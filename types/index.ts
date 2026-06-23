export interface WalletToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance: bigint;
  /** USD value of the held balance, if priceable. */
  usdValue?: number;
}

export interface KyberToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

/** routeSummary object returned by KyberSwap GET /routes */
export interface KyberQuoteRoute {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;        // human-readable estimated output (raw units)
  gas?: string;
  // KyberSwap returns many more fields; we carry the whole object opaquely
  // so it can be passed back verbatim to POST /route/build
  [key: string]: unknown;
}

/** Result of POST /route/build */
export interface KyberSwapResult {
  amountOut: string;
  data: string;             // calldata
  routerAddress: string;    // spender / router to approve
  gas?: number;
}

export type DepositStep = "connect" | "select" | "confirm" | "deposit";

export type ExecutionStage =
  | "idle"
  | "approving"
  | "awaiting-approval-confirmation"
  | "swapping"
  | "awaiting-swap-confirmation"
  | "transferring"
  | "awaiting-transfer-confirmation"
  | "done"
  | "error";

export interface ExecutionResult {
  approvalHash?: string;
  swapHash?: string;
  transferHash?: string;
  outputAmount?: string;
  outputSymbol?: string;
  destinationAddress?: string;
}
