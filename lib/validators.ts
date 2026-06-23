import { isAddress } from "viem";

export interface AddressValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates a Bitget deposit address for Base.
 * - Must be a well-formed EVM address (checksum-agnostic).
 * - Must not be the zero address.
 * - Cannot equal the connected wallet (deposits must go to Bitget, not back to self —
 *   a common copy-paste mistake we proactively catch).
 */
export function validateDepositAddress(
  address: string,
  connectedAddress?: string
): AddressValidationResult {
  if (!address || address.trim().length === 0) {
    return { valid: false, message: "Enter a Bitget deposit address." };
  }
  if (!isAddress(address)) {
    return { valid: false, message: "That doesn't look like a valid Base address." };
  }
  if (/^0x0{40}$/i.test(address)) {
    return { valid: false, message: "The zero address can't receive deposits." };
  }
  if (connectedAddress && address.toLowerCase() === connectedAddress.toLowerCase()) {
    return { valid: false, message: "This is your own wallet address, not a Bitget address." };
  }
  return { valid: true };
}
