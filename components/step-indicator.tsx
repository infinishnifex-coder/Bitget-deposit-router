import { FLOW_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <nav aria-label="Deposit progress">
      <ol className="flex w-full items-center">
        {FLOW_STEPS.map((label, i) => {
          const isComplete = i < current;
          const isActive = i === current;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                    isComplete && "bg-accent text-accent-foreground shadow-glow-accent",
                    isActive && "bg-primary text-primary-foreground shadow-glow ring-4 ring-primary/20",
                    !isComplete && !isActive && "border border-border bg-surface2 text-muted"
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest",
                    isActive ? "text-foreground" : isComplete ? "text-accent/80" : "text-muted/60"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1 -translate-y-3 transition-all duration-500",
                    isComplete ? "bg-accent/50" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
