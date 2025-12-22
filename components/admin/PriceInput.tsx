"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PriceInputProps {
  product: any;
  onUpdate?: (updatedProduct: any) => void;
}

export function PriceInput({ product, onUpdate }: PriceInputProps) {
  const [value, setValue] = useState(product.price ?? 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newPrice: number) => {
    setValue(newPrice);
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });
      const result = await response.json();
      if (result.success && onUpdate) {
        onUpdate(result.product);
      }
    } catch (error) {
      console.error("Failed to update price:", error);
      setValue(product.price);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-zinc-500">₹</span>
      <Input
        type="number"
        min={0}
        step={0.01}
        value={value}
        disabled={isUpdating}
        onChange={(e) => handleUpdate(parseFloat(e.target.value) || 0)}
        className="h-8 w-24 text-right"
      />
    </div>
  );
}
