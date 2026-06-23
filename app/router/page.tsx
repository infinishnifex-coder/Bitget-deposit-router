"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/step-indicator";
import { NetworkGuard } from "@/components/network-guard";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { TokenList } from "@/components/token-list";
import { DepositForm } from "@/components/deposit-form";
import { WarningBanner } from "@/components/warning-banner";
import { QuoteCard } from "@/components/quote-card";
import { TxStatus } from "@/components/tx-status";
import { useQuote } from "@/hooks/use-quote";
import { useDepositFlow } from "@/hooks/use-deposit-flow";
import {
  DESTINATION_ASSETS,
  ETH_TOKEN,
  SAFE_TOKEN_ADDRESSES,
  USDC_TOKEN,
  type DestinationSymbol,
} from "@/lib/constants";
import { validateDepositAddress } from "@/lib/validators";
import { formatTokenAmount, safeParseUnits } from "@/lib/utils";
import type { WalletToken } from "@/types";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

type Phase = "select" | "confirm" | "executing";

export default function RouterPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedToken, setSelectedToken] = useState<WalletToken | null>(null);
  const [amountStr, setAmountStr] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [destinationSymbol, setDestinationSymbol] = useState<DestinationSymbol>("ETH");

  const destinationAsset = destinationSymbol === "ETH" ? ETH_TOKEN : USDC_TOKEN;
  const amountRaw = selectedToken ? safeParseUnits(amountStr, selectedToken.decimals) : null;
  const isAlreadySafe = selectedToken
    ? SAFE_TOKEN_ADDRESSES.has(selectedToken.address.toLowerCase())
    : false;

  const { quote, loading: quoteLoading, error: quoteError } = useQuote({
    srcToken: selectedToken,
    dstAddress: destinationAsset.address,
    dstDecimals: destinationAsset.decimals,
    amount: amountRaw,
  });

  const { run, stage, result, error: execError, reset } = useDepositFlow();

  const addressValidation = validateDepositAddress(depositAddress, address);
  const amountValid = !!amountRaw && (!selectedToken || amountRaw <= selectedToken.balance);

  const canGoToConfirm = !!selectedToken && amountValid && addressValidation.valid;
  const canExecute =
    canGoToConfirm && (isAlreadySafe || (!!quote && !quoteLoading && !quoteError));

  const stepIndex = useMemo(() => {
    if (!isConnected) return 0;
    if (phase === "select") return 1;
    return 2;
  }, [isConnected, phase]);

  // BUG FIX: Navigate in useEffect, not during render, to avoid React render-phase side effects.
  useEffect(() => {
    if (stage === "done" && result?.transferHash) {
      const qs = new URLSearchParams({
        hash: result.transferHash,
        amount: result.outputAmount ?? "",
        symbol: result.outputSymbol ?? "",
        to: result.destinationAddress ?? "",
        decimals: String(destinationAsset.decimals),
      });
      router.push(`/success?${qs.toString()}`);
    }
  }, [stage, result, destinationAsset.decimals, router]);

  async function handleConfirmDeposit() {
    if (!selectedToken || !amountRaw || !address) return;
    setPhase("executing");
    await run({
      srcToken: selectedToken,
      amountRaw,
      destinationAddress: depositAddress as `0x${string}`,
      destinationSymbol,
      destinationDecimals: destinationAsset.decimals,
      destinationTokenAddress: destinationAsset.address,
      fromAddress: address as `0x${string}`,
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-10">
      <div className="mb-8">
        <StepIndicator current={stepIndex} />
      </div>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect your wallet</CardTitle>
            <CardDescription>You'll need a wallet on Base to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnectButton />
          </CardContent>
        </Card>
      ) : (
        <NetworkGuard>
          {phase === "select" && (
            <div className="flex flex-col gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Select a token</CardTitle>
                  <CardDescription>Choose what you want to send to Bitget.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TokenList selected={selectedToken} onSelect={setSelectedToken} />
                </CardContent>
              </Card>

              {selectedToken && (
                <Card>
                  <CardHeader>
                    <CardTitle>Amount</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        inputMode="decimal"
                        placeholder="0.0"
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setAmountStr(formatTokenAmount(selectedToken.balance, selectedToken.decimals, 6))
                        }
                      >
                        Max
                      </Button>
                    </div>
                    <p className="text-xs text-muted">
                      Balance: {formatTokenAmount(selectedToken.balance, selectedToken.decimals)}{" "}
                      {selectedToken.symbol}
                    </p>
                    {amountStr && !amountValid && (
                      <p className="text-xs text-danger">Enter an amount within your balance.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Deposit details</CardTitle>
                </CardHeader>
                <CardContent>
                  <DepositForm
                    address={depositAddress}
                    onAddressChange={setDepositAddress}
                    destination={destinationSymbol}
                    onDestinationChange={setDestinationSymbol}
                  />
                </CardContent>
              </Card>

              {selectedToken && <WarningBanner tokenSymbol={selectedToken.symbol} isSafe={isAlreadySafe} />}

              <Button size="lg" disabled={!canGoToConfirm} onClick={() => setPhase("confirm")}>
                Review deposit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {phase === "confirm" && selectedToken && amountRaw && (
            <div className="flex flex-col gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Confirm your deposit</CardTitle>
                  <CardDescription>Double-check everything before you submit.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <QuoteCard
                    srcToken={selectedToken}
                    destinationSymbol={destinationSymbol}
                    destinationDecimals={destinationAsset.decimals}
                    amountIn={amountRaw}
                    quote={quote}
                    loading={quoteLoading}
                    error={quoteError}
                    isAlreadySafe={isAlreadySafe}
                  />
                  <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface2 p-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="shrink-0 text-muted">Bitget deposit address</span>
                      <span className="truncate font-mono text-foreground text-right">{depositAddress}</span>
                    </div>
                  </div>
                  <WarningBanner tokenSymbol={selectedToken.symbol} isSafe={isAlreadySafe} />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setPhase("select")} className="flex-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleConfirmDeposit} disabled={!canExecute} className="flex-1">
                  Deposit to Bitget
                </Button>
              </div>
            </div>
          )}

          {phase === "executing" && selectedToken && (
            <Card>
              <CardHeader>
                <CardTitle>Sending your deposit</CardTitle>
                <CardDescription>Keep this tab open and confirm prompts in your wallet.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <TxStatus
                  stage={stage}
                  approvalHash={result?.approvalHash}
                  swapHash={result?.swapHash}
                  transferHash={result?.transferHash}
                  skipSwap={isAlreadySafe}
                />
                {stage !== "error" && stage !== "done" && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for confirmation…
                  </div>
                )}
                {stage === "error" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-danger">{execError}</p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        reset();
                        setPhase("confirm");
                      }}
                    >
                      Back to review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </NetworkGuard>
      )}
    </main>
  );
}
