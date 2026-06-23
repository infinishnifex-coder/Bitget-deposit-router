import { CheckCircle2, Loader2, ExternalLink, Circle } from "lucide-react";
import { explorerTxUrl, shortenAddress } from "@/lib/utils";
import type { ExecutionStage } from "@/types";

interface TxStatusProps {
  stage: ExecutionStage;
  approvalHash?: string;
  swapHash?: string;
  transferHash?: string;
  skipSwap: boolean;
}

const STEPS_WITH_SWAP = [
  { key: "approving", label: "Approve token", desc: "Allow KyberSwap to use your token" },
  { key: "swapping", label: "Swap on KyberSwap", desc: "Converting to the destination asset" },
  { key: "transferring", label: "Send to Bitget", desc: "Transferring to your deposit address" },
] as const;

const STEPS_WITHOUT_SWAP = [
  { key: "transferring", label: "Send to Bitget", desc: "Transferring to your deposit address" },
] as const;

export function TxStatus({ stage, approvalHash, swapHash, transferHash, skipSwap }: TxStatusProps) {
  const steps = skipSwap ? STEPS_WITHOUT_SWAP : STEPS_WITH_SWAP;

  function statusFor(key: string): "pending" | "active" | "done" {
    const order = ["approving", "swapping", "transferring"];
    const stageOrder: Record<string, number> = {
      idle: -1,
      approving: 0,
      "awaiting-approval-confirmation": 0,
      swapping: 1,
      "awaiting-swap-confirmation": 1,
      transferring: 2,
      "awaiting-transfer-confirmation": 2,
      done: 3,
      error: order.indexOf(key),
    };
    const current = stageOrder[stage] ?? -1;
    const idx = order.indexOf(key);
    if (current > idx) return "done";
    if (current === idx) return "active";
    return "pending";
  }

  const hashFor = (key: string) =>
    key === "approving" ? approvalHash : key === "swapping" ? swapHash : transferHash;

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const status = statusFor(step.key);
        const hash = hashFor(step.key);
        const isLast = i === steps.length - 1;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Timeline track */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  status === "done"
                    ? "border-accent bg-accent/15"
                    : status === "active"
                    ? "border-primary bg-primary/15"
                    : "border-border bg-surface2"
                }`}
              >
                {status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                ) : status === "active" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <Circle className="h-3 w-3 text-muted/40" />
                )}
              </div>
              {!isLast && (
                <div className={`my-1 w-px flex-1 transition-colors duration-500 ${status === "done" ? "bg-accent/40" : "bg-border"}`} style={{ minHeight: "20px" }} />
              )}
            </div>

            {/* Content */}
            <div className={`flex flex-1 items-start justify-between pb-${isLast ? "0" : "5"} pt-1`}>
              <div>
                <p className={`text-sm font-medium transition-colors ${status === "active" ? "text-foreground" : status === "done" ? "text-accent" : "text-muted"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted/70 mt-0.5">{step.desc}</p>
              </div>
              {hash && (
                <a
                  href={explorerTxUrl(hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface2 px-2.5 py-1 text-xs text-primary hover:border-primary/50 hover:bg-surface2/80 transition-colors"
                >
                  {shortenAddress(hash)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
