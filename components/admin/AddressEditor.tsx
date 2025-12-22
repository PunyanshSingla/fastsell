"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressEditorProps {
  order: any;
  onUpdate: (updatedOrder: any) => void;
}

export function AddressEditor({ order, onUpdate }: AddressEditorProps) {
  const address = order.address ?? {};

  const handleFieldChange = (field: string, value: string) => {
    const updatedAddress = { ...address, [field]: value };
    onUpdate({ ...order, address: updatedAddress });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs text-zinc-500 dark:text-zinc-400">
          Full Name
        </Label>
        <Input
          id="name"
          value={address.name || ""}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          placeholder="John Doe"
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="line1" className="text-xs text-zinc-500 dark:text-zinc-400">
          Address Line 1
        </Label>
        <Input
          id="line1"
          value={address.line1 || ""}
          onChange={(e) => handleFieldChange("line1", e.target.value)}
          placeholder="123 Main St"
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="line2" className="text-xs text-zinc-500 dark:text-zinc-400">
          Address Line 2
        </Label>
        <Input
          id="line2"
          value={address.line2 || ""}
          onChange={(e) => handleFieldChange("line2", e.target.value)}
          placeholder="Apt 4B (optional)"
          className="h-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs text-zinc-500 dark:text-zinc-400">
            City
          </Label>
          <Input
            id="city"
            value={address.city || ""}
            onChange={(e) => handleFieldChange("city", e.target.value)}
            placeholder="London"
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="postcode" className="text-xs text-zinc-500 dark:text-zinc-400">
            Postcode
          </Label>
          <Input
            id="postcode"
            value={address.postcode || ""}
            onChange={(e) => handleFieldChange("postcode", e.target.value)}
            placeholder="SW1A 1AA"
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="country" className="text-xs text-zinc-500 dark:text-zinc-400">
          Country
        </Label>
        <Input
          id="country"
          value={address.country || ""}
          onChange={(e) => handleFieldChange("country", e.target.value)}
          placeholder="United Kingdom"
          className="h-9"
        />
      </div>
    </div>
  );
}

