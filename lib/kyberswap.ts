import { SUPPORTED_CHAIN_ID, KYBERSWAP_CHAIN_SLUG } from "./constants";
import type { KyberToken, KyberQuoteRoute, KyberSwapResult } from "@/types";

/**
 * Thin client for our own /api/kyberswap/* proxy routes.
 * KyberSwap requires no API key or KYC — all endpoints are public.
 */

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || body?.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || err?.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchTokenList(): Promise<Record<string, KyberToken>> {
  const data = await getJson<{ data: { tokens: KyberToken[] } }>(
    `/api/kyberswap/tokens`
  );
  // Index by lowercase address for O(1) lookup
  const map: Record<string, KyberToken> = {};
  for (const t of data.data.tokens) {
    map[t.address.toLowerCase()] = t;
  }
  return map;
}

export async function fetchQuote(params: {
  src: string;
  dst: string;
  amount: string;
}): Promise<KyberQuoteRoute> {
  const qs = new URLSearchParams({
    tokenIn: params.src,
    tokenOut: params.dst,
    amountIn: params.amount,
  });
  const data = await getJson<{ data: { routeSummary: KyberQuoteRoute } }>(
    `/api/kyberswap/quote?${qs.toString()}`
  );
  return data.data.routeSummary;
}

export async function buildSwapTx(params: {
  routeSummary: KyberQuoteRoute;
  from: string;
  slippageBps: number;
}): Promise<KyberSwapResult> {
  const data = await postJson<{ data: KyberSwapResult }>(
    `/api/kyberswap/swap`,
    {
      routeSummary: params.routeSummary,
      sender: params.from,
      recipient: params.from,
      slippageTolerance: params.slippageBps,
      deadline: Math.floor(Date.now() / 1000) + 1200, // 20 min
    }
  );
  return data.data;
}
