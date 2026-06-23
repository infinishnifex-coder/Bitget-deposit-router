"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { usePublicClient, useAccount } from "wagmi";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { TokenSelectItem } from "@/components/token-select-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { erc20Abi } from "@/lib/erc20";
import { NATIVE_TOKEN_ADDRESS } from "@/lib/constants";
import type { WalletToken } from "@/types";
import { Loader2, Inbox, Search, X } from "lucide-react";

interface TokenListProps {
  selected: WalletToken | null;
  onSelect: (token: WalletToken) => void;
}

export function TokenList({ selected, onSelect }: TokenListProps) {
  const { tokens, loading, error } = useTokenBalances();
  const publicClient = usePublicClient();
  const { address: walletAddress } = useAccount();

  const [contractInput, setContractInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookedUpToken, setLookedUpToken] = useState<WalletToken | null>(null);

  async function handleLookup() {
    const addr = contractInput.trim();
    setLookupError(null);
    setLookedUpToken(null);

    if (!addr) return;

    // Native ETH pseudo-address
    if (addr.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
      setLookupError("ETH is already listed above — select it from the list.");
      return;
    }

    if (!isAddress(addr)) {
      setLookupError("That doesn't look like a valid contract address.");
      return;
    }

    // BUG FIX: Require wallet connection before attempting the lookup.
    // Previously fell back to the zero address (0x000...0) as the balanceOf
    // argument when walletAddress was undefined, giving a misleading 0 balance
    // instead of a proper "not connected" error.
    if (!publicClient || !walletAddress) {
      setLookupError("Connect your wallet first to look up a token balance.");
      return;
    }

    setLookupLoading(true);
    try {
      // Read symbol, decimals, and user's balance in parallel
      const [symbol, decimals, balance] = await Promise.all([
        publicClient.readContract({
          address: addr as `0x${string}`,
          abi: erc20Abi,
          functionName: "symbol",
        }) as Promise<string>,
        publicClient.readContract({
          address: addr as `0x${string}`,
          abi: erc20Abi,
          functionName: "decimals",
        }) as Promise<number>,
        publicClient.readContract({
          address: addr as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [walletAddress],
        }) as Promise<bigint>,
      ]);

      setLookedUpToken({
        address: addr,
        symbol,
        name: symbol,
        decimals: Number(decimals),
        balance,
      });
    } catch {
      setLookupError(
        "Couldn't read this contract. Make sure it's an ERC-20 token on Base."
      );
    } finally {
      setLookupLoading(false);
    }
  }

  function clearLookup() {
    setContractInput("");
    setLookedUpToken(null);
    setLookupError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Wallet token list */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Scanning your wallet on Base…
        </div>
      ) : error ? (
        <p className="py-6 text-center text-sm text-danger">{error}</p>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted">
          <Inbox className="h-5 w-5" />
          No token balances found on Base for this wallet.
        </div>
      ) : (
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {tokens.map((token) => (
            <TokenSelectItem
              key={token.address}
              token={token}
              selected={selected?.address === token.address}
              onSelect={() => onSelect(token)}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted">or enter contract address</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Contract address lookup */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="0x… token contract address"
              value={contractInput}
              onChange={(e) => {
                setContractInput(e.target.value);
                setLookedUpToken(null);
                setLookupError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              autoComplete="off"
              spellCheck={false}
            />
            {contractInput && (
              <button
                type="button"
                onClick={clearLookup}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleLookup}
            disabled={!contractInput.trim() || lookupLoading}
          >
            {lookupLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {lookupError && (
          <p className="text-xs text-danger">{lookupError}</p>
        )}

        {lookedUpToken && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted">Token found — tap to select:</p>
            <TokenSelectItem
              token={lookedUpToken}
              selected={selected?.address === lookedUpToken.address}
              onSelect={() => {
                onSelect(lookedUpToken);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
