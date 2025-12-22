"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StockInputProps {
  product: any;
  onUpdate?: (updatedProduct: any) => void;
}

export function StockInput({ product, onUpdate }: StockInputProps) {
  const [value, setValue] = useState(product.stock ?? 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const stockValue = value;
  const isLowStock = stockValue > 0 && stockValue <= 5;
  const isOutOfStock = stockValue === 0;

  const handleUpdate = async (newStock: number) => {
    setValue(newStock);
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      const result = await response.json();
      if (result.success && onUpdate) {
        onUpdate(result.product);
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
      // Revert on error
      setValue(product.stock);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Input
      type="number"
      min={0}
      value={value}
      disabled={isUpdating}
      onChange={(e) => handleUpdate(parseInt(e.target.value) || 0)}
      className={cn(
        "h-8 w-20 text-center",
        isOutOfStock &&
          "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
        isLowStock &&
          "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
        isUpdating && "opacity-50"
      )}
    />
  );
}
