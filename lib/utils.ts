import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a raw bigint token amount into a human string, trimmed to a sane precision. */
export function formatTokenAmount(raw: bigint, decimals: number, maxFractionDigits = 6): string {
  const full = formatUnits(raw, decimals);
  const [whole, frac = ""] = full.split(".");
  if (!frac) return whole;
  const trimmed = frac.slice(0, maxFractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

/** Parse a user-entered decimal string into a raw bigint amount. Returns null if invalid. */
export function safeParseUnits(value: string, decimals: number): bigint | null {
  try {
    if (!value || value.trim() === "") return null;
    // Avoid Number() for the zero-check — it loses precision on large amounts.
    // parseUnits will throw on empty/non-numeric strings, so we guard with a regex.
    if (!/^\d*\.?\d+$/.test(value.trim())) return null;
    const parsed = parseUnits(value.trim() as `${number}`, decimals);
    if (parsed <= 0n) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatUsd(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

export function explorerTxUrl(hash: string): string {
  return `https://basescan.org/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://basescan.org/address/${address}`;
}
