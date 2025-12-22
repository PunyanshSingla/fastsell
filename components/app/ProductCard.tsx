"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { StockBadge } from "@/components/app/StockBadge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(
    null,
  );

  const images = product.images ?? [];
  const mainImageUrl = images[0]?.asset?.url;
  const displayedImageUrl =
    hoveredImageIndex !== null
      ? images[hoveredImageIndex]?.asset?.url
      : mainImageUrl;

  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const hasMultipleImages = images.length > 1;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-lg border-0 bg-white p-0 shadow-sm ring-1 ring-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700">
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden bg-zinc-100 dark:bg-zinc-800",
            "aspect-[4/3]"
          )}
        >
          {displayedImageUrl ? (
            <Image
              src={displayedImageUrl}
              alt={product.name ?? "Product image"}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              <svg
                className="h-10 w-10 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />

          {isOutOfStock && (
            <Badge
              variant="destructive"
              className="absolute right-1.5 top-1.5 rounded p-1 text-[8px] font-bold leading-none shadow-sm"
            >
              OUT
            </Badge>
          )}
          {product.category && (
            <span className="absolute left-1.5 top-1.5 rounded bg-white/95 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-600 shadow-sm backdrop-blur-sm dark:bg-zinc-900/95 dark:text-zinc-400">
              {product.category.title}
            </span>
          )}
        </div>
      </Link>

      <CardContent className="flex grow flex-col justify-between gap-1 p-2">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-1 text-xs font-medium leading-tight text-zinc-900 transition-colors group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-500">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
            {formatPrice(product.price)}
          </p>
          <StockBadge productId={product._id} stock={stock} size="sm" />
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <AddToCartButton
          productId={product._id}
          name={product.name ?? "Unknown Product"}
          price={product.price ?? 0}
          image={mainImageUrl ?? undefined}
          stock={stock}
        />
      </CardFooter>
    </Card>
  );
}

