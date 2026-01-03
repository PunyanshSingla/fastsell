"use client";

import { GitCompareArrows, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useCompareActions,
  useIsInCompare,
  useIsCompareMaxed,
  MAX_COMPARE_ITEMS,
} from "@/lib/store/compare-store-provider";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface AddToCompareButtonProps {
  product: Product;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCompareButton({
  product,
  className,
  variant = "outline",
  size = "default",
}: AddToCompareButtonProps) {
  const { addProduct, removeProduct } = useCompareActions();
  const isInCompare = useIsInCompare(product._id);
  const isMaxed = useIsCompareMaxed();

  const handleClick = () => {
    if (isInCompare) {
      removeProduct(product._id);
      toast.success(`Removed "${product.name}" from comparison`);
    } else {
      if (isMaxed) {
        toast.error(`Maximum ${MAX_COMPARE_ITEMS} products can be compared at once`);
        return;
      }
      const success = addProduct(product);
      if (success) {
        toast.success(`Added "${product.name}" to comparison`);
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={isInCompare ? "default" : variant}
      size={size}
      className={cn(
        "transition-all",
        isInCompare && "bg-emerald-600 hover:bg-emerald-700 text-white",
        className
      )}
    >
      {isInCompare ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          In Compare
        </>
      ) : (
        <>
          <GitCompareArrows className="mr-2 h-4 w-4" />
          Add to Compare
        </>
      )}
    </Button>
  );
}
