import { base } from "viem/chains";

/** This app only ever operates on Base. Hard-coded on purpose — no chain switcher. */
export const SUPPORTED_CHAIN = base;
export const SUPPORTED_CHAIN_ID = base.id; // 8453

/** Canonical "native ETH" pseudo-address used by KyberSwap's API. */
export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

/** Native USDC on Base (not bridged USDbC). */
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export const ETH_TOKEN = {
  address: NATIVE_TOKEN_ADDRESS,
  symbol: "ETH",
  name: "Ethereum",
  decimals: 18,
  logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
} as const;

export const USDC_TOKEN = {
  address: USDC_ADDRESS,
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  logoURI: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
} as const;

/** Destination assets a user may receive at their Bitget deposit address. */
export const DESTINATION_ASSETS = [ETH_TOKEN, USDC_TOKEN] as const;

export type DestinationSymbol = (typeof DESTINATION_ASSETS)[number]["symbol"];

/** Tokens that are already "safe" to send straight to Bitget without swapping. */
export const SAFE_TOKEN_ADDRESSES = new Set(
  [NATIVE_TOKEN_ADDRESS, USDC_ADDRESS].map((a) => a.toLowerCase())
);

/** KyberSwap Aggregator — no API key or KYC required. */
export const KYBERSWAP_BASE_URL = "https://aggregator-api.kyberswap.com";
export const KYBERSWAP_CHAIN_SLUG = "base";

/**
 * KyberSwap MetaAggregationRouterV2 on Base.
 * This is the address users must approve before a swap can be executed.
 * Same address across all EVM chains KyberSwap supports.
 */
export const KYBERSWAP_ROUTER_ADDRESS = "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5";

/** Default slippage tolerance in basis points (100 bps = 1%). KyberSwap uses bps. */
export const DEFAULT_SLIPPAGE_BPS = 100; // 1%
export const DEFAULT_SLIPPAGE = 1;       // kept for display use

/** Steps shown in the progress indicator. */
export const FLOW_STEPS = ["Connect", "Select Token", "Confirm", "Deposit"] as const;
