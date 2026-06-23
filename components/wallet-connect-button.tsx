"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";
import { Wallet, LogOut } from "lucide-react";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-surface2 px-4 text-sm text-foreground">
          <span className="h-2 w-2 rounded-full bg-accent" />
          {shortenAddress(address)}
        </div>
        <Button variant="ghost" size="icon" onClick={() => disconnect()} aria-label="Disconnect">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          variant="secondary"
          disabled={isPending}
          onClick={() => connect({ connector })}
        >
          <Wallet className="h-4 w-4" />
          {connector.name}
        </Button>
      ))}
    </div>
  );
}
