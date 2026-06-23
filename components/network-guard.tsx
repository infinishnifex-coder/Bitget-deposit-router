"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Renders nothing when the connected wallet is already on Base. Otherwise
 * blocks the rest of the flow behind a "Switch to Base" prompt — this app
 * never operates on any other network.
 */
export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return <>{children}</>;
  if (chainId === base.id) return <>{children}</>;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-warning/40 bg-warning/10 p-6 text-center">
      <AlertTriangle className="h-6 w-6 text-warning" />
      <div>
        <p className="font-medium text-foreground">Wrong network</p>
        <p className="text-sm text-muted">
          This app only works on Base. Switch your wallet's network to continue.
        </p>
      </div>
      <Button onClick={() => switchChain({ chainId: base.id })} disabled={isPending}>
        {isPending ? "Switching…" : "Switch to Base"}
      </Button>
    </div>
  );
}
