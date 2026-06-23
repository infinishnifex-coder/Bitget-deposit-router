"use client";

import { useAccount } from "wagmi";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DESTINATION_ASSETS, type DestinationSymbol } from "@/lib/constants";
import { validateDepositAddress } from "@/lib/validators";

interface DepositFormProps {
  address: string;
  onAddressChange: (value: string) => void;
  destination: DestinationSymbol;
  onDestinationChange: (value: DestinationSymbol) => void;
}

export function DepositForm({
  address,
  onAddressChange,
  destination,
  onDestinationChange,
}: DepositFormProps) {
  const { address: connected } = useAccount();
  const validation = validateDepositAddress(address, connected);
  const showError = address.length > 0 && !validation.valid;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bitget-address" className="text-sm font-medium text-foreground">
          Bitget deposit address (Base)
        </label>
        <Input
          id="bitget-address"
          placeholder="0x..."
          value={address}
          error={showError}
          onChange={(e) => onAddressChange(e.target.value.trim())}
          autoComplete="off"
          spellCheck={false}
        />
        {showError && <p className="text-xs text-danger">{validation.message}</p>}
        <p className="text-xs text-muted">
          Copy this from Bitget → Assets → Deposit → select the network: Base.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Receive as</label>
        <Select value={destination} onValueChange={(v) => onDestinationChange(v as DestinationSymbol)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DESTINATION_ASSETS.map((asset) => (
              <SelectItem key={asset.symbol} value={asset.symbol}>
                {asset.symbol} — {asset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
