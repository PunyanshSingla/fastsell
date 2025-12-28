"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StockInputProps {
  product: any;
  onUpdate?: (updatedProduct: any) => void;
}

export function StockInput({ product, onUpdate }: StockInputProps) {
  const [localValue, setLocalValue] = useState<string>(product.stock?.toString() ?? "0");
  const [isUpdating, setIsUpdating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(product.stock?.toString() ?? "0");
  }, [product.stock]);

  const numericValue = parseInt(localValue) || 0;
  const isLowStock = numericValue > 0 && numericValue <= 5;
  const isOutOfStock = numericValue === 0;

  const saveStock = async (newStock: number) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      if (onUpdate) {
        onUpdate(result.product);
      }
    } catch (error: any) {
      toast.error("Failed to update stock", {
        description: error.message,
      });
      setLocalValue(product.stock?.toString() ?? "0");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    const intVal = parseInt(val);
    if (!isNaN(intVal)) {
      timerRef.current = setTimeout(() => {
        saveStock(intVal);
      }, 800);
    }
  };

  return (
    <div className="relative group w-24">
      <Input
        type="number"
        min={0}
        value={localValue}
        onChange={handleChange}
        className={cn(
          "h-11 w-full text-center rounded-2xl border-zinc-200 bg-white ring-offset-white transition-all",
          "focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500",
          "dark:border-zinc-800 dark:bg-zinc-900 dark:ring-offset-zinc-950 dark:focus-visible:ring-emerald-400/20 dark:focus-visible:border-emerald-400",
          "font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
          isOutOfStock && "text-red-600 border-red-200 bg-red-50/50 dark:text-red-400 dark:border-red-900/30 dark:bg-red-950/20",
          isLowStock && !isOutOfStock && "text-amber-600 border-amber-200 bg-amber-50/50 dark:text-amber-400 dark:border-amber-900/30 dark:bg-amber-950/20",
          isUpdating && "opacity-60"
        )}
      />
      {isUpdating && (
        <div className="absolute -right-1 -top-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      )}
    </div>
  );
}
