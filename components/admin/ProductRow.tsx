"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { isLowStock, isOutOfStock } from "@/lib/constants/stock";
import { StockInput } from "./StockInput";
import { PriceInput } from "./PriceInput";
import { FeaturedToggle } from "./FeaturedToggle";
import { DeleteButton } from "./DeleteButton";
import { cn } from "@/lib/utils";

interface ProductRowProps {
  product: any;
  onUpdate?: (product: any) => void;
}

export function ProductRow({ product, onUpdate }: ProductRowProps) {
  const lowStock = isLowStock(product.stock);
  const outOfStock = isOutOfStock(product.stock);

  return (
    <TableRow className="group border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
      {/* Media */}
      <TableCell className="hidden py-5 pl-6 sm:table-cell">
        <Link href={`/admin/inventory/${product._id}`}>
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200/50 dark:bg-zinc-800 dark:ring-zinc-700/50 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
            {product.images?.[0]?.asset?.url ? (
              <Image
                src={product.images[0].asset.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] font-bold text-zinc-400">
                NO IMAGE
              </div>
            )}
          </div>
        </Link>
      </TableCell>

      {/* Product Info */}
      <TableCell className="py-5">
        <div className="flex flex-col gap-1 max-w-[200px] lg:max-w-[300px]">
          <div className="flex items-center gap-2">
            <Link href={`/admin/inventory/${product._id}`} className="hover:underline decoration-zinc-400 underline-offset-4">
              <span className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 lg:text-base tracking-tight">
                {product.name || "Untitled Product"}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {typeof product.category === 'string' ? product.category : product.category?.title || "UNCATEGORIZED"}
            </span>
          </div>
          
          {/* Mobile only details */}
          <div className="mt-3 flex items-center gap-3 sm:hidden">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatPrice(product.price)}
            </span>
            <Badge 
              className={cn(
                "rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border-none",
                outOfStock 
                  ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                  : lowStock 
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" 
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              )}
            >
              {outOfStock ? "Out" : lowStock ? "Low" : "In Stock"}
            </Badge>
          </div>
        </div>
      </TableCell>

      {/* Pricing */}
      <TableCell className="hidden py-5 md:table-cell">
        <PriceInput product={product} onUpdate={onUpdate} />
      </TableCell>

      {/* Inventory */}
      <TableCell className="hidden py-5 md:table-cell">
        <div className="flex items-center gap-3">
          <StockInput product={product} onUpdate={onUpdate} />
          {outOfStock ? (
            <Badge className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600 border-none dark:bg-red-900/20 dark:text-red-400">
              Out
            </Badge>
          ) : lowStock ? (
            <Badge className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 border-none dark:bg-amber-900/20 dark:text-amber-400">
              Low
            </Badge>
          ) : (
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="In Stock" />
          )}
        </div>
      </TableCell>

      {/* Featured Status */}
      <TableCell className="hidden py-5 text-center lg:table-cell">
        <FeaturedToggle product={product} onUpdate={onUpdate} />
      </TableCell>

      {/* Actions */}
      <TableCell className="hidden py-5 text-right pr-6 sm:table-cell">
        <div className="flex items-center justify-end">
          <DeleteButton 
            productId={product._id} 
            onDelete={() => onUpdate?.(null)} 
            size="icon" 
            variant="ghost"
            className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProductRowSkeleton() {
  return (
    <TableRow className="border-b border-zinc-100 dark:border-zinc-800/50">
      <TableCell className="hidden py-5 pl-6 sm:table-cell">
        <Skeleton className="h-16 w-16 rounded-2xl" />
      </TableCell>
      <TableCell className="py-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell className="hidden py-5 md:table-cell">
        <Skeleton className="h-10 w-32 rounded-xl" />
      </TableCell>
      <TableCell className="hidden py-5 md:table-cell">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-5 w-10 rounded-lg" />
        </div>
      </TableCell>
      <TableCell className="hidden py-5 lg:table-cell">
        <Skeleton className="h-10 w-10 rounded-xl mx-auto" />
      </TableCell>
      <TableCell className="hidden py-5 text-right pr-6 sm:table-cell">
        <Skeleton className="h-10 w-10 rounded-xl ml-auto" />
      </TableCell>
    </TableRow>
  );
}
