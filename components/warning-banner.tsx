import { ShieldAlert, ShieldCheck } from "lucide-react";

interface WarningBannerProps {
  tokenSymbol: string;
  isSafe: boolean;
}

/**
 * "Safe Deposit Mode" messaging — tells the user plainly whether the token
 * they picked needs to be converted before it can reach Bitget.
 */
export function WarningBanner({ tokenSymbol, isSafe }: WarningBannerProps) {
  if (isSafe) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
        <p>
          <span className="font-medium">{tokenSymbol}</span> is already supported by Bitget. It
          will be sent directly — no swap needed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
      <p>
        <span className="font-medium">{tokenSymbol}</span> is not supported by Bitget deposits. It
        will be converted on Base before sending, so your deposit is credited correctly.
      </p>
    </div>
  );
}
