"use client";

import { Badge } from "@/components/ui/badge";
import { useCartItem } from "@/lib/store/cart-store-provider";
import { cn } from "@/lib/utils";
import { isLowStock as checkLowStock } from "@/lib/constants/stock";

interface StockBadgeProps {
  productId: string;
  stock: number;
  className?: string;
  size?: "default" | "sm";
}

export function StockBadge({
  productId,
  stock,
  className,
  size = "default",
}: StockBadgeProps) {
  const cartItem = useCartItem(productId);

  const quantityInCart = cartItem?.quantity ?? 0;
  const isAtMax = quantityInCart >= stock && stock > 0;
  const lowStock = checkLowStock(stock);

  const sizeClasses = {
    default: "px-2 py-0.5 text-[10px]",
    sm: "px-1 py-0 text-[8px] font-bold",
  };

  if (isAtMax) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "w-fit bg-blue-100 text-blue-800",
          sizeClasses[size],
          className,
        )}
      >
        Max
      </Badge>
    );
  }

  if (lowStock) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "w-fit bg-amber-100 text-amber-800",
          sizeClasses[size],
          className,
        )}
      >
        {size === "sm" ? `${stock} left` : `Only ${stock} left`}
      </Badge>
    );
  }

  return null;
}
