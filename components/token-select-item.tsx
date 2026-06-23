import Image from "next/image";
import { cn, formatTokenAmount, formatUsd } from "@/lib/utils";
import type { WalletToken } from "@/types";

interface TokenSelectItemProps {
  token: WalletToken;
  selected: boolean;
  onSelect: () => void;
}

export function TokenSelectItem({ token, selected, onSelect }: TokenSelectItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-surface2 hover:border-primary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface text-xs font-semibold text-muted">
          {token.logoURI ? (
            <Image src={token.logoURI} alt={token.symbol} width={36} height={36} />
          ) : (
            token.symbol.slice(0, 3)
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{token.symbol}</p>
          <p className="text-xs text-muted">{token.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">
          {formatTokenAmount(token.balance, token.decimals)}
        </p>
        <p className="text-xs text-muted">{formatUsd(token.usdValue)}</p>
      </div>
    </button>
  );
}
