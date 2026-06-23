import { Loader2 } from "lucide-react";
import { formatTokenAmount } from "@/lib/utils";
import { DEFAULT_SLIPPAGE } from "@/lib/constants";
import type { KyberQuoteRoute, WalletToken } from "@/types";

interface QuoteCardProps {
  srcToken: WalletToken;
  destinationSymbol: string;
  destinationDecimals: number;
  amountIn: bigint;
  quote: KyberQuoteRoute | null;
  loading: boolean;
  error: string | null;
  isAlreadySafe: boolean;
}

export function QuoteCard({
  srcToken,
  destinationSymbol,
  destinationDecimals,
  amountIn,
  quote,
  loading,
  error,
  isAlreadySafe,
}: QuoteCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface2 p-4 text-sm">
      <Row label="You send" value={`${formatTokenAmount(amountIn, srcToken.decimals)} ${srcToken.symbol}`} />

      {isAlreadySafe ? (
        <Row
          label="Bitget receives"
          value={`${formatTokenAmount(amountIn, srcToken.decimals)} ${srcToken.symbol}`}
          highlight
        />
      ) : loading ? (
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Fetching best route on KyberSwap…
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : quote ? (
        <>
          <Row
            label="Estimated output"
            value={`${formatTokenAmount(BigInt(quote.amountOut), destinationDecimals)} ${destinationSymbol}`}
            highlight
          />
          <Row label="Slippage tolerance" value={`${DEFAULT_SLIPPAGE}%`} />
          {quote.gas !== undefined && <Row label="Estimated gas" value={`${Number(quote.gas).toLocaleString()} units`} />}
        </>
      ) : (
        <p className="text-muted">Enter an amount to see a quote.</p>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={highlight ? "font-semibold text-foreground" : "text-foreground"}>{value}</span>
    </div>
  );
}
