"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { StockBadge } from "@/components/app/StockBadge";
import { StarRating } from "@/components/app/StarRating";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product, Variant } from "@/lib/types";
import { useWishlistActions, useIsInWishlist } from "@/lib/store/wishlist-store-provider";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Heart,
  ShieldCheck,
  Truck,
  RefreshCcw,
  ChevronDown,
  Info,
  Check
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StickyAddToCart } from "./StickyAddToCart";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const imageUrl = product.images?.[0]?.asset?.url;
  const { addItem, removeItem } = useWishlistActions();
  const isInWishlist = useIsInWishlist(product._id);
  const { user } = useUser();
  const userId = user?.id;

  // Derived state for display
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayDiscountPrice = selectedVariant ? selectedVariant.discountPrice : product.discountPrice;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentImage = selectedVariant?.image || imageUrl;

  // Group variants by attributes
  const { sizes, colors } = useMemo(() => {
    if (!product.variants) return { sizes: [], colors: [] };
    const s = new Set<string>();
    const c = new Set<string>();

    product.variants.forEach(v => {
      const size = v.size || v.attributes?.find(a => a.name.toLowerCase() === "size")?.value;
      const color = v.color || v.attributes?.find(a => a.name.toLowerCase() === "color")?.value;

      if (size) s.add(size);
      if (color) c.add(color);
    });

    return {
      sizes: Array.from(s),
      colors: Array.from(c)
    };
  }, [product.variants]);

  // Helper to get variant attributes
  const getVariantSize = (v: Variant) => v.size || v.attributes?.find(a => a.name.toLowerCase() === "size")?.value;
  const getVariantColor = (v: Variant) => v.color || v.attributes?.find(a => a.name.toLowerCase() === "color")?.value;

  // Handle variant selection flexibility
  const handleColorSelect = (color: string) => {
    const variant = product.variants?.find(v => {
      const vColor = getVariantColor(v);
      const vSize = getVariantSize(v);
      const currentSize = selectedVariant ? getVariantSize(selectedVariant) : null;
      return vColor === color && (currentSize ? vSize === currentSize : true);
    });

    if (variant) setSelectedVariant(variant);
    else {
      // Fallback to first variant with this color
      const firstMatch = product.variants?.find(v => getVariantColor(v) === color);
      if (firstMatch) setSelectedVariant(firstMatch);
    }
  };

  const handleSizeSelect = (size: string) => {
    const variant = product.variants?.find(v => {
      const vSize = getVariantSize(v);
      const vColor = getVariantColor(v);
      const currentColor = selectedVariant ? getVariantColor(selectedVariant) : null;
      return vSize === size && (currentColor ? vColor === currentColor : true);
    });

    if (variant) setSelectedVariant(variant);
    else {
      // Fallback
      const firstMatch = product.variants?.find(v => getVariantSize(v) === size);
      if (firstMatch) setSelectedVariant(firstMatch);
    }
  };

  // Selection helpers
  const isColorSelected = (color: string) => {
    if (!selectedVariant) return false;
    return getVariantColor(selectedVariant) === color;
  };

  const isSizeSelected = (size: string) => {
    if (!selectedVariant) return false;
    return getVariantSize(selectedVariant) === size;
  };

  // Add to cart handler for the sticky bar

  return (
    <div className="flex flex-col gap-6">

      {/* 1. Header Section: Category, Rating, Title */}
      <div className="space-y-3">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {product.category && (
              <Link
                href={`/?category=${product.category.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {product.category.title}
              </Link>
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h1>

      </div>

      {/* 2. Pricing Section (Aggressive) */}
      <div className="flex items-baseline gap-3 border-b border-zinc-100 dark:border-zinc-800">

        {displayDiscountPrice ? (
          <>
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatPrice(displayDiscountPrice)}
            </span>
            <span className="text-lg font-medium text-zinc-400 line-through">
              {formatPrice(displayPrice)}
            </span>
            <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 font-bold px-2 py-0.5 rounded-sm">
              {Math.round(((displayPrice - displayDiscountPrice) / displayPrice) * 100)}% OFF
            </Badge>
          </>
        ) : (
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatPrice(displayPrice)}
          </span>
        )}

      </div>

      {product.reviewCount > 0 && (
        <div href="#reviews" className="flex items-center gap-1.5 group">
          <StarRating
            rating={product.averageRating}
            size="sm"
            showNumber={false}
            className="text-yellow-400 group-hover:opacity-80 transition-opacity"
          />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 underline decoration-zinc-300 underline-offset-2">
            {product.reviewCount} review (s)
          </span>
        </div>
      )}
      {/* 3. Variant Selection (Visual) */}
      {product.hasVariants && (
        <div className="space-y-6">
          {/* Colors */}
          {colors.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Select Color: <span className="text-zinc-500 font-normal">{selectedVariant ? getVariantColor(selectedVariant) : ""}</span>
              </Label>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={cn(
                      "group relative h-10 w-10 rounded-full border-[3px] transition-all hover:scale-110",
                      isColorSelected(color)
                        ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                        : "border-transparent ring-1 ring-zinc-200 dark:ring-zinc-700 hover:ring-zinc-300"
                    )}
                    title={color}
                  >
                    <span
                      className="absolute inset-0.5 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    {isColorSelected(color) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className={cn("h-4 w-4 drop-shadow-md", ["white", "yellow", "cream"].includes(color.toLowerCase()) ? "text-black" : "text-white")} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Select Size
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={cn(
                      "min-w-[48px] h-10 px-3 rounded-lg border text-sm font-medium transition-all active:scale-95",
                      isSizeSelected(size)
                        ? "border-zinc-900 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-md transform scale-105"
                        : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-zinc-100"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Actions & Stock */}
      <div className="space-y-4">
        {/* Urgency / Stock Status */}
        <div className="flex items-center justify-between">
          <StockBadge productId={product._id} stock={displayStock ?? 0} />
          {displayStock && displayStock <= 10 && displayStock > 0 && (
            <span className="text-xs font-bold text-red-600">
              Only {displayStock} left - order now!
            </span>
          )}
        </div>

        {/* Main CTA */}
        <div className="flex gap-3 h-12">
          <AddToCartButton
            productId={product._id}
            name={product.name ?? "Unknown Product"}
            price={displayDiscountPrice || displayPrice || 0}
            image={currentImage}
            stock={displayStock ?? 0}
            selectedVariant={selectedVariant ? {
              sku: selectedVariant.sku,
              variantName: selectedVariant.variantName,
              price: selectedVariant.discountPrice || selectedVariant.price,
              image: selectedVariant.image
            } : undefined}
            disabled={product.hasVariants && !selectedVariant}
            className="w-2/5 h-full text-base font-bold cart-button"
          />
          <Button
            variant="outline"
            className="h-12 w-12 shrink-0 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            onClick={() => {
              if (isInWishlist) removeItem(product._id, userId);
              else addItem(product, userId);
            }}
          >
            <Heart className={cn("h-6 w-6 transition-colors", isInWishlist && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </div>

      {/* 6. Expandable Details (Mobile Friendly) */}
      <div className="border-t border-zinc-100 dark:border-zinc-800">
        <Accordion type="single" collapsible className="w-full" defaultValue="description">
          <AccordionItem value="description" className="border-none">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
              Description
            </AccordionTrigger>
            <AccordionContent className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>{product.description}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="features" className="border-t border-zinc-100 dark:border-zinc-800">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
              Key Features
            </AccordionTrigger>
            <AccordionContent>
              {product.features && product.features.length > 0 ? (
                <ul className="grid sm:grid-cols-2 gap-3">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">No specific features listed.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="specifications" className="border-t border-zinc-100 dark:border-zinc-800">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
              Specifications
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {product.attributes && product.attributes.map((attr) => (
                  <div key={attr.name} className="flex justify-between items-center py-1 border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-0">
                    <span className="text-sm text-zinc-500">{attr.name}</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{attr.value}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

