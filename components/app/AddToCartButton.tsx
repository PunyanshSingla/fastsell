"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartActions, useCartItem } from "@/lib/store/cart-store-provider";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  className?: string;
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  stock,
  className,
}: AddToCartButtonProps) {
  const { addItem, updateQuantity } = useCartActions();
  const cartItem = useCartItem(productId);

  const quantityInCart = cartItem?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isAtMax = quantityInCart >= stock;

  const handleAdd = () => {
    if (quantityInCart < stock) {
      addItem({ productId, name, price, image }, 1);
      toast.success(`Added ${name}`);
    }
  };

  const handleDecrement = () => {
    if (quantityInCart > 0) {
      updateQuantity(productId, quantityInCart - 1);
    }
  };

  // Out of stock
  if (isOutOfStock) {
    return (
      <Button
        disabled
        variant="secondary"
        className={cn("h-11 w-48 text-sm font-medium opacity-50", className)}
      >
        Out of Stock
      </Button>
    );
  }

  // Not in cart - show Add to Basket button
  if (quantityInCart === 0) {
    return (
      <Button 
        onClick={handleAdd} 
        className={cn("h-11 sm:w-48 w-full text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.98]", className)}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    );
  }

  // In cart - show quantity controls
  return (
    <div
      className={cn(
        "flex h-11 w-48 items-center overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-full w-12 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
        onClick={handleDecrement}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="flex-1 text-center text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
        {quantityInCart}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-full w-12 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20"
        onClick={handleAdd}
        disabled={isAtMax}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
