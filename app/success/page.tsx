"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { explorerTxUrl, formatTokenAmount, shortenAddress } from "@/lib/utils";
import { CheckCircle2, ExternalLink, ArrowLeftRight, Copy } from "lucide-react";
import { useState } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const hash = params.get("hash") ?? "";
  const amount = params.get("amount") ?? "0";
  const symbol = params.get("symbol") ?? "";
  const to = params.get("to") ?? "";
  const decimals = Number(params.get("decimals") ?? "18");
  const [copied, setCopied] = useState(false);

  const formattedAmount = (() => {
    try {
      return formatTokenAmount(BigInt(amount || "0"), decimals);
    } catch {
      return amount;
    }
  })();

  function copyAddress() {
    navigator.clipboard.writeText(to).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[100px]" />

      {/* Success icon */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/30">
        <CheckCircle2 className="h-10 w-10 text-accent" />
        {/* Pulse ring */}
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/10" style={{ animationDuration: "2s" }} />
      </div>

      <h1 className="mt-7 font-display text-2xl font-bold text-foreground">Deposit on its way</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {formattedAmount} {symbol} was sent to your Bitget deposit address on Base.
        <br />
        It can take a few minutes to be credited.
      </p>

      <Card className="mt-8 w-full text-left">
        <CardHeader>
          <CardTitle className="text-base">Deposit details</CardTitle>
          <CardDescription>Check Basescan for real-time confirmation status.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <DetailRow label="Amount" value={`${formattedAmount} ${symbol}`} />
          <div className="flex items-center justify-between">
            <span className="text-muted">Destination</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-foreground">{shortenAddress(to, 6)}</span>
              <button
                onClick={copyAddress}
                className="text-muted hover:text-foreground transition-colors"
                aria-label="Copy address"
              >
                <Copy className="h-3 w-3" />
              </button>
              {copied && <span className="text-xs text-accent">Copied!</span>}
            </div>
          </div>
          {hash && (
            <div className="flex items-center justify-between">
              <span className="text-muted">Transaction</span>
              <a
                href={explorerTxUrl(hash)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-primary hover:underline"
              >
                {shortenAddress(hash)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info callout */}
      <div className="mt-4 w-full rounded-xl border border-warning/20 bg-warning/8 p-4 text-left text-xs text-muted">
        <span className="font-medium text-warning">Heads up:</span> Bitget typically credits Base
        deposits within 10–30 minutes. If it's taking longer, check Basescan to confirm the
        transaction has been included in a block.
      </div>

      <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
        <Link href="/router">
          <ArrowLeftRight className="h-4 w-4" />
          Make another deposit
        </Link>
      </Button>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
