"use client";

import { useEffect, useState } from "react";
import { fetchQuote } from "@/lib/kyberswap";
import { SAFE_TOKEN_ADDRESSES } from "@/lib/constants";
import type { KyberQuoteRoute, WalletToken } from "@/types";

interface UseQuoteArgs {
  srcToken: WalletToken | null;
  dstAddress: string;
  dstDecimals: number;
  amount: bigint | null;
}

/**
 * Debounced KyberSwap quote lookup. Skipped entirely when the source token is
 * already a "safe" asset (ETH/USDC) — no swap is needed in that case.
 *
 * BUG FIX: bigint values are not reference-stable between renders (a new bigint
 * with the same numeric value is !== to an older one). Using amount?.toString()
 * as the effect dependency gives React a primitive string to diff correctly,
 * preventing unnecessary re-fetches and potential infinite loops.
 */
export function useQuote({ srcToken, dstAddress, dstDecimals, amount }: UseQuoteArgs) {
  const [quote, setQuote] = useState<KyberQuoteRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAlreadySafe =
    !!srcToken && SAFE_TOKEN_ADDRESSES.has(srcToken.address.toLowerCase());

  // Use string form of amount as the dependency — bigint is not reference-stable.
  const amountStr = amount?.toString() ?? null;

  useEffect(() => {
    setQuote(null);
    setError(null);

    if (!srcToken || !amountStr || amountStr === "0" || isAlreadySafe) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = await fetchQuote({
          src: srcToken.address,
          dst: dstAddress,
          amount: amountStr,
        });
        if (!cancelled) setQuote(q);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to fetch quote.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcToken?.address, dstAddress, amountStr, isAlreadySafe]);

  return { quote, loading, error, isAlreadySafe, dstDecimals };
}
