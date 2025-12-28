"use client";

import { useWishlistItems } from "@/lib/store/wishlist-store-provider";
import { ProductCard } from "@/components/app/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const wishlistItems = useWishlistItems();

  if (wishlistItems.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-6 text-center">
        <div className="rounded-full bg-zinc-50 p-8 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <Heart className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
        </div>
        <div className="max-w-md space-y-2 px-4">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Your wishlist is empty
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Looks like you haven't added anything to your wishlist yet.
          </p>
        </div>
        <Button asChild size="lg" className="mt-8 px-8">
          <Link href="/">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          My Wishlist
        </h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlistItems.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
