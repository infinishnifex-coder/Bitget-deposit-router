import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KYBER_BASE = "https://aggregator-api.kyberswap.com/base/api/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tokenIn  = searchParams.get("tokenIn");
  const tokenOut = searchParams.get("tokenOut");
  const amountIn = searchParams.get("amountIn");

  if (!tokenIn || !tokenOut || !amountIn) {
    return NextResponse.json(
      { error: "tokenIn, tokenOut and amountIn are required." },
      { status: 400 }
    );
  }

  const qs = new URLSearchParams({ tokenIn, tokenOut, amountIn });
  const upstream = await fetch(`${KYBER_BASE}/routes?${qs.toString()}`, {
    headers: { "x-client-id": "bitget-deposit-router" },
    cache: "no-store",
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: `KyberSwap quote failed: ${text}` },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();
  return NextResponse.json(data);
}
