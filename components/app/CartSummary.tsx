"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  useTotalPrice,
  useTotalItems,
  useCartActions,
} from "@/lib/store/cart-store-provider";

interface CartSummaryProps {
  hasStockIssues?: boolean;
}

export function CartSummary({ hasStockIssues = false }: CartSummaryProps) {
  const totalPrice = useTotalPrice();
  const totalItems = useTotalItems();
  const { closeCart } = useCartActions();

  if (totalItems === 0) return null;

  return (
    <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex justify-between text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <span>Subtotal</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      <div className="mt-4">
        {hasStockIssues ? (
          <Button disabled className="w-full h-12 opacity-70 cursor-not-allowed">
            Resolve stock issues to checkout
          </Button>
        ) : (
          <div className="flex items-center justify-center">
            <Button asChild className="w-full h-12 text-base font-semibold">
              <Link href="/checkout" onClick={() => closeCart()}>
                Checkout
              </Link>
            </Button>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}
