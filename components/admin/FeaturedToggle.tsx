"use client";

import { useState } from "react";
import { Loader2, Crown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeaturedToggleProps {
  product: any;
  onUpdate?: (updatedProduct: any) => void;
}

export function FeaturedToggle({ product, onUpdate }: FeaturedToggleProps) {
  const [isFeatured, setIsFeatured] = useState(product.featured ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (newValue: boolean) => {
    setIsFeatured(newValue);
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newValue }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      if (onUpdate) {
        onUpdate(result.product);
      }
    } catch (error: any) {
      toast.error("Failed to update status", {
        description: error.message,
      });
      setIsFeatured(!newValue);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <div className={cn(
        "flex h-8 items-center gap-2 rounded-full px-3 transition-all duration-300",
        isFeatured 
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
      )}>
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Crown className={cn("h-3 w-3", isFeatured ? "fill-current" : "opacity-40")} />
        )}
        <span className="text-[10px] font-black uppercase tracking-wider">
          {isFeatured ? "Featured" : "Standard"}
        </span>
        <Switch
          checked={isFeatured}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
          className="scale-75 data-[state=checked]:bg-emerald-600"
        />
      </div>
    </div>
  );
}
