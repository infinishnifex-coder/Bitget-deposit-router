import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// KyberSwap token list for Base — no API key required.
// We fetch multiple pages and merge them so users see a broad token set.
const KYBER_TOKENS_URL =
  "https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=8453&pageSize=100&page=";

export async function GET() {
  try {
    // Fetch first 3 pages (300 tokens) — covers all major Base tokens
    const pages = await Promise.all(
      [1, 2, 3].map((p) =>
        fetch(`${KYBER_TOKENS_URL}${p}`, { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => ({ data: { tokens: [] } }))
      )
    );

    const tokens = pages.flatMap((p) => p?.data?.tokens ?? []);
    return NextResponse.json({ data: { tokens } });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch token list from KyberSwap." },
      { status: 502 }
    );
  }
}
