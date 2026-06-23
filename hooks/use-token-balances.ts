"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { erc20Abi } from "@/lib/erc20";
import { ETH_TOKEN } from "@/lib/constants";
import { fetchTokenList } from "@/lib/kyberswap";
import type { WalletToken } from "@/types";

/**
 * Pulls the KyberSwap token list for Base, then multicalls balanceOf for the
 * connected wallet across all of them (plus a native ETH balance check),
 * returning only tokens the wallet actually holds.
 */
export function useTokenBalances() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [tokens, setTokens] = useState<WalletToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !publicClient) return;
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const ethBalance = await publicClient!.getBalance({ address: address! });

        const tokenList = await fetchTokenList();
        const erc20Entries = Object.values(tokenList).filter(
          (t) => t.address.toLowerCase() !== ETH_TOKEN.address.toLowerCase()
        );

        // Cap the multicall batch to avoid hitting RPC limits. The KyberSwap list
        // is roughly sorted by liquidity/popularity across the 3 fetched pages.
        // Users with uncommon tokens can use the contract-address lookup instead.
        const batch = erc20Entries.slice(0, 500);

        const results = await publicClient!.multicall({
          contracts: batch.map((t) => ({
            address: t.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address!],
          })),
          allowFailure: true,
        });

        const held: WalletToken[] = [];
        results.forEach((res, i) => {
          if (res.status === "success" && (res.result as unknown as bigint) > 0n) {
            const t = batch[i];
            held.push({
              address: t.address,
              symbol: t.symbol,
              name: t.name,
              decimals: t.decimals,
              logoURI: t.logoURI,
              balance: res.result as unknown as bigint,
            });
          }
        });

        if (ethBalance > 0n) {
          held.unshift({
            address: ETH_TOKEN.address,
            symbol: ETH_TOKEN.symbol,
            name: ETH_TOKEN.name,
            decimals: ETH_TOKEN.decimals,
            logoURI: ETH_TOKEN.logoURI,
            balance: ethBalance,
          });
        }

        if (!cancelled) setTokens(held);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load balances.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient]);

  return { tokens, loading, error };
}
