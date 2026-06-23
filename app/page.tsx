"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { NetworkGuard } from "@/components/network-guard";
import { ArrowRight, ShieldCheck, Zap, RefreshCw } from "lucide-react";

export default function HomePage() {
  const { isConnected, chainId } = useAccount();
  const readyForRouter = isConnected && chainId === base.id;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-fade pointer-events-none absolute inset-0 -z-10 h-[560px]" />

      {/* Glow orbs for depth */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-32 -z-10 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[100px]" />

      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground shadow-glow">
            B
          </span>
          <span className="font-display text-sm font-semibold tracking-wide text-foreground">
            Deposit Router
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted sm:block">
            Base network only
          </span>
          <NetworkGuard>
            <WalletConnectButton />
          </NetworkGuard>
        </div>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-12 text-center">
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-accent">Live on Base</span>
        </div>

        <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          That airdropped token won't
          <br />
          deposit to Bitget.{" "}
          <span className="relative text-primary">
            This will.
            <svg className="absolute -bottom-1 left-0 h-[3px] w-full" viewBox="0 0 100 3" preserveAspectRatio="none">
              <path d="M0 1.5 Q50 0 100 1.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
            </svg>
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
          Got PEPE, or some other token Bitget doesn't list, sitting in your wallet on Base?
          Convert it to ETH or USDC first, then send it — automatically, in one flow.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          {!isConnected && (
            <NetworkGuard>
              <WalletConnectButton />
            </NetworkGuard>
          )}

          {readyForRouter && (
            <Button asChild size="lg" variant="accent" className="group px-8 shadow-glow">
              <Link href="/router">
                Continue to Deposit Router
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Flow steps */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-3">
        <FlowCard
          step="01"
          icon={<RefreshCw className="h-4 w-4" />}
          title="Pick the token"
          body="We scan your Base wallet and show what you're actually holding."
        />
        <FlowCard
          step="02"
          icon={<Zap className="h-4 w-4" />}
          title="Convert on Base"
          body="KyberSwap routes it to ETH or USDC at the best price — no manual swapping."
        />
        <FlowCard
          step="03"
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Land in Bitget"
          body="The safe asset is sent straight to your Bitget deposit address."
        />
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm text-foreground">
                Unsupported tokens are never sent to Bitget directly — they're converted first.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-foreground">Everything happens on Base. No bridging.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function FlowCard({ step, icon, title, body }: { step: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-glow/50">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs text-primary">{step}</span>
          <span className="text-muted group-hover:text-primary transition-colors">{icon}</span>
        </div>
        <h3 className="mt-2 font-display text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
      </CardContent>
    </Card>
  );
}
