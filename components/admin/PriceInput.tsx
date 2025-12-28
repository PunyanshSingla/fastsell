"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PriceInputProps {
  product: any;
  onUpdate?: (updatedProduct: any) => void;
}

export function PriceInput({ product, onUpdate }: PriceInputProps) {
  const [localValue, setLocalValue] = useState<string>(product.price?.toString() ?? "0");
  const [isUpdating, setIsUpdating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(product.price?.toString() ?? "0");
  }, [product.price]);

  const savePrice = async (newPrice: number) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      if (onUpdate) {
        onUpdate(result.product);
      }
    } catch (error: any) {
      toast.error("Failed to update price", {
        description: error.message,
      });
      setLocalValue(product.price?.toString() ?? "0");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (timerRef.current) clearTimeout(timerRef.current);
    
    const numericVal = parseFloat(val);
    if (!isNaN(numericVal)) {
      timerRef.current = setTimeout(() => {
        savePrice(numericVal);
      }, 800);
    }
  };

  return (
    <div className="relative group w-[120px]">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">₹</span>
        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <Input
        type="number"
        min={0}
        step={0.01}
        value={localValue}
        onChange={handleChange}
        className={cn(
          "h-11 w-full pl-11 pr-3 text-center rounded-2xl border-zinc-200 bg-white ring-offset-white transition-all",
          "focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500",
          "dark:border-zinc-800 dark:bg-zinc-900 dark:ring-offset-zinc-950 dark:focus-visible:ring-emerald-400/20 dark:focus-visible:border-emerald-400",
          "font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
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
