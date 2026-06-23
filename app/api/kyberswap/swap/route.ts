import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KYBER_BASE = "https://aggregator-api.kyberswap.com/base/api/v1";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const upstream = await fetch(`${KYBER_BASE}/route/build`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": "bitget-deposit-router",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: `KyberSwap swap build failed: ${text}` },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();
  return NextResponse.json(data);
}
