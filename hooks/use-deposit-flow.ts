"use client";

import { useCallback, useState } from "react";
import { useConfig, usePublicClient } from "wagmi";
import {
  getWalletClient,
  waitForTransactionReceipt,
  readContract,
} from "wagmi/actions";
import { erc20Abi } from "@/lib/erc20";
import { fetchQuote, buildSwapTx } from "@/lib/kyberswap";
import {
  NATIVE_TOKEN_ADDRESS,
  SAFE_TOKEN_ADDRESSES,
  KYBERSWAP_ROUTER_ADDRESS,
  DEFAULT_SLIPPAGE_BPS,
} from "@/lib/constants";
import type { ExecutionResult, ExecutionStage, WalletToken } from "@/types";

interface RunArgs {
  srcToken: WalletToken;
  amountRaw: bigint;
  destinationAddress: `0x${string}`;
  destinationSymbol: "ETH" | "USDC";
  destinationDecimals: number;
  destinationTokenAddress: string;
  fromAddress: `0x${string}`;
}

/**
 * Runs the full two-step flow:
 *   1. (if needed) approve the KyberSwap router, then swap srcToken -> destination asset
 *   2. transfer the resulting ETH/USDC to the Bitget deposit address
 * Each on-chain action is confirmed before the next one starts, and every
 * stage is surfaced so the UI can show real progress instead of a spinner.
 */
export function useDepositFlow() {
  const config = useConfig();
  const publicClient = usePublicClient();
  const [stage, setStage] = useState<ExecutionStage>("idle");
  const [result, setResult] = useState<ExecutionResult>({});
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (args: RunArgs) => {
      setError(null);
      setResult({});
      try {
        const walletClient = await getWalletClient(config);
        const isAlreadySafe = SAFE_TOKEN_ADDRESSES.has(srcAddr(args.srcToken));
        let amountAfterSwapRaw: bigint = args.amountRaw;
        let swapHash: string | undefined;

        if (!isAlreadySafe) {
          // --- Step 1a: fetch quote first so we have routeSummary for the build step ---
          const quote = await fetchQuote({
            src: args.srcToken.address,
            dst: args.destinationTokenAddress,
            amount: args.amountRaw.toString(),
          });

          // --- Step 1b: approval (skipped for native ETH input) ---
          if (srcAddr(args.srcToken) !== NATIVE_TOKEN_ADDRESS.toLowerCase()) {
            const currentAllowance = await readContract(config, {
              address: args.srcToken.address as `0x${string}`,
              abi: erc20Abi,
              functionName: "allowance",
              args: [args.fromAddress, KYBERSWAP_ROUTER_ADDRESS as `0x${string}`],
            });

            if ((currentAllowance as bigint) < args.amountRaw) {
              setStage("approving");
              const approvalHash = await walletClient.writeContract({
                address: args.srcToken.address as `0x${string}`,
                abi: erc20Abi,
                functionName: "approve",
                args: [KYBERSWAP_ROUTER_ADDRESS as `0x${string}`, args.amountRaw],
              });
              setResult((r) => ({ ...r, approvalHash }));
              setStage("awaiting-approval-confirmation");
              await waitForTransactionReceipt(config, { hash: approvalHash });
            }
          }

          // --- Step 1c: build and send the swap tx ---
          setStage("swapping");

          // BUG FIX: Snapshot balances BEFORE the swap so we can diff them afterward.
          // For ETH output: diff the ETH balance (accounts for gas paid by the swap tx).
          // For ERC-20 output: diff the token balance (avoids returning the full wallet
          // balance, which would be wrong if the user already held some of that token).
          const ethBalanceBefore = await publicClient!.getBalance({ address: args.fromAddress });
          const erc20BalanceBefore: bigint =
            args.destinationSymbol !== "ETH"
              ? (await readContract(config, {
                  address: args.destinationTokenAddress as `0x${string}`,
                  abi: erc20Abi,
                  functionName: "balanceOf",
                  args: [args.fromAddress],
                })) as bigint
              : 0n;

          const swap = await buildSwapTx({
            routeSummary: quote,
            from: args.fromAddress,
            slippageBps: DEFAULT_SLIPPAGE_BPS,
          });

          swapHash = await walletClient.sendTransaction({
            to: swap.routerAddress as `0x${string}`,
            data: swap.data as `0x${string}`,
            value: srcAddr(args.srcToken) === NATIVE_TOKEN_ADDRESS.toLowerCase()
              ? args.amountRaw
              : 0n,
          });
          setResult((r) => ({ ...r, swapHash }));
          setStage("awaiting-swap-confirmation");
          await waitForTransactionReceipt(config, { hash: swapHash as `0x${string}` });

          // BUG FIX: Compute received amount as (balance_after - balance_before).
          // For ETH: the diff may be negative due to gas costs of the swap tx itself.
          //          Fall back to the router's reported amountOut (post-slippage minimum).
          // For ERC-20: the diff is exact (gas is always paid in ETH, never in the token).
          if (args.destinationSymbol === "ETH") {
            const balanceAfter = await publicClient!.getBalance({ address: args.fromAddress });
            const received = balanceAfter - ethBalanceBefore;
            amountAfterSwapRaw = received > 0n ? received : BigInt(swap.amountOut);
          } else {
            const balanceAfter = (await readContract(config, {
              address: args.destinationTokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [args.fromAddress],
            })) as bigint;
            // Use the delta, not the total balance — user may already hold some of this token.
            const received = balanceAfter - erc20BalanceBefore;
            amountAfterSwapRaw = received > 0n ? received : BigInt(swap.amountOut);
          }
        }

        // --- Step 2: transfer the safe asset to the Bitget deposit address ---
        setStage("transferring");
        let transferHash: `0x${string}`;
        if (args.destinationSymbol === "ETH") {
          transferHash = await walletClient.sendTransaction({
            to: args.destinationAddress,
            value: amountAfterSwapRaw,
          });
        } else {
          transferHash = await walletClient.writeContract({
            address: args.destinationTokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "transfer",
            args: [args.destinationAddress, amountAfterSwapRaw],
          });
        }
        setResult((r) => ({ ...r, transferHash }));
        setStage("awaiting-transfer-confirmation");
        await waitForTransactionReceipt(config, { hash: transferHash });

        setResult((r) => ({
          ...r,
          swapHash,
          transferHash,
          outputAmount: amountAfterSwapRaw.toString(),
          outputSymbol: args.destinationSymbol,
          destinationAddress: args.destinationAddress,
        }));
        setStage("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Deposit failed. Nothing further was sent.");
        setStage("error");
      }
    },
    [config, publicClient]
  );

  const reset = useCallback(() => {
    setStage("idle");
    setResult({});
    setError(null);
  }, []);

  return { run, reset, stage, result, error };
}

function srcAddr(token: WalletToken) {
  return token.address.toLowerCase();
}
