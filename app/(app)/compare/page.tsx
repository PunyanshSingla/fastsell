"use client";

import { useCompareItems, useCompareActions, MAX_COMPARE_ITEMS } from "@/lib/store/compare-store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  GitCompareArrows, 
  Trash2, 
  ShoppingBag,
  Check,
  Minus,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/app/AddToCartButton";

export default function ComparePage() {
  const items = useCompareItems();
  const { removeProduct, clearAll } = useCompareActions();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            icon={GitCompareArrows}
            title="No products to compare"
            description="Add products to compare from the product pages. You can compare up to 4 products at once."
            action={{
              label: "Browse Products",
              href: "/",
              icon: ShoppingBag,
            }}
          />
        </div>
      </div>
    );
  }

  // Define the comparison attributes
  const comparisonRows = [
    { label: "Price", key: "price" },
    { label: "Category", key: "category" },
    { label: "Stock", key: "stock" },
    { label: "Rating", key: "rating" },
    { label: "Description", key: "description" },
    { label: "Features", key: "features" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Compare Products
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={clearAll}
            className="self-start sm:self-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>

        {/* Mobile/Tablet View - Horizontal Scroll Comparison */}
        <div className="block lg:hidden">
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {items.map((product) => (
                <Card key={product._id} className="w-[280px] shrink-0 overflow-hidden bg-white dark:bg-zinc-900">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-sm hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeProduct(product._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
                        {product.images?.[0]?.asset?.url && (
                          <Image
                            src={product.images[0].asset.url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    </Link>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
                          {product.name}
                        </h3>
                      </Link>
                      {product.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {product.category.title}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Price</span>
                        <div className="text-right">
                          {product.discountPrice ? (
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                {formatPrice(product.discountPrice)}
                              </span>
                              <span className="line-through text-zinc-400 text-xs">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Stock</span>
                        <span className={cn(
                          "font-medium text-xs px-2 py-0.5 rounded-full",
                          product.stock > 10 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                            : product.stock > 0 
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {product.stock > 0 ? (product.stock > 10 ? "In Stock" : `${product.stock} left`) : "Out"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Rating</span>
                        {product.averageRating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{product.averageRating.toFixed(1)}</span>
                            <span className="text-zinc-400 text-xs">({product.reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs">No reviews</span>
                        )}
                      </div>
                    </div>

                    <AddToCartButton
                      productId={product._id}
                      name={product.name}
                      price={product.discountPrice || product.price}
                      image={product.images?.[0]?.asset?.url}
                      stock={product.stock}
                      className="w-full mt-2"
                    />
                  </CardContent>
                </Card>
              ))}
              
              {/* Add more products placeholder */}
              {items.length < MAX_COMPARE_ITEMS && (
                <Link href="/" className="w-[280px] shrink-0">
                  <Card className="h-full min-h-[400px] border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center">
                    <div className="text-center text-zinc-400 p-4">
                      <GitCompareArrows className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Add Product</p>
                      <p className="text-xs mt-1">Compare up to {MAX_COMPARE_ITEMS} products</p>
                    </div>
                  </Card>
                </Link>
              )}
            </div>
          </div>
          
          {/* Scroll hint */}
          {items.length > 1 && (
            <p className="text-center text-xs text-zinc-400 mt-2">
              ← Swipe to compare →
            </p>
          )}
        </div>

        {/* Desktop View - Comparison Table */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <table className="w-full">
              {/* Product Images Row */}
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="w-48 p-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900/50">
                    Product
                  </th>
                  {items.map((product) => (
                    <th key={product._id} className="p-4 text-center min-w-[200px]">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 z-10 h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
                          onClick={() => removeProduct(product._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Link href={`/products/${product.slug}`}>
                          <div className="relative mx-auto h-40 w-40 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700">
                            {product.images?.[0]?.asset?.url && (
                              <Image
                                src={product.images[0].asset.url}
                                alt={product.name}
                                fill
                                className="object-cover hover:scale-105 transition-transform"
                              />
                            )}
                          </div>
                        </Link>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                      </div>
                    </th>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: MAX_COMPARE_ITEMS - items.length }).map((_, idx) => (
                    <th key={`empty-${idx}`} className="p-4 min-w-[200px]">
                      <Link href="/">
                        <div className="mx-auto h-40 w-40 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                          <div className="text-center text-zinc-400">
                            <GitCompareArrows className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <span className="text-xs">Add product</span>
                          </div>
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* Price Row */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/30">
                    Price
                  </td>
                  {items.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      <div className="space-y-1">
                        {product.discountPrice ? (
                          <>
                            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                              {formatPrice(product.discountPrice)}
                            </div>
                            <div className="text-sm text-zinc-400 line-through">
                              {formatPrice(product.price)}
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                            </Badge>
                          </>
                        ) : (
                          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE_ITEMS - items.length }).map((_, idx) => (
                    <td key={`empty-${idx}`} className="p-4 text-center text-zinc-300 dark:text-zinc-700">
                      <Minus className="h-5 w-5 mx-auto" />
                    </td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/30">
                    Category
                  </td>
                  {items.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      {product.category ? (
                        <Badge variant="secondary">{product.category.title}</Badge>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE_ITEMS - items.length }).map((_, idx) => (
                    <td key={`empty-${idx}`} className="p-4 text-center text-zinc-300 dark:text-zinc-700">
                      <Minus className="h-5 w-5 mx-auto" />
                    </td>
                  ))}
                </tr>

                {/* Stock Row */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/30">
                    Availability
                  </td>
                  {items.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                        product.stock > 10 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : product.stock > 0 
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {product.stock > 0 ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            {product.stock > 10 ? "In Stock" : `Only ${product.stock} left`}
                          </>
                        ) : (
                          "Out of Stock"
                        )}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE_ITEMS - items.length }).map((_, idx) => (
                    <td key={`empty-${idx}`} className="p-4 text-center text-zinc-300 dark:text-zinc-700">
                      <Minus className="h-5 w-5 mx-auto" />
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/30">
                    Rating
                  </td>
                  {items.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      {product.averageRating > 0 ? (
                        <div className="inline-flex items-center gap-1.5">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < Math.round(product.averageRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {product.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-zinc-400">
                            ({product.reviewCount})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">No reviews yet</span>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE_ITEMS - items.length }).map((_, idx) => (
                    <td key={`empty-${idx}`} className="p-4 text-center text-zinc-300 dark:text-zinc-700">
                      <Minus className="h-5 w-5 mx-auto" />
                    </td>
                  ))}
                </tr>

                {/* Description Row */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/30">
                    Description
                  </td>
                  {items.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                        {product.description || "-"}
                      </p>
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE_ITEMS - items.length }).map((_, idx) => (
                    <td key={`empty-${idx}`} className="p-4 text-center text-zinc-300 dark:text-zinc-700">
                      <Minus className="h-5 w-5 mx-auto" />
                    </td>
                  ))}
                </tr>

                {/* Features Row */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/30">
                    Features
                  </td>
                  {items.map((product) => (
                    <td key={product._id} className="p-4">
                      {product.features && product.features.length > 0 ? (
                        <ul className="space-y-1.5 text-left">
                          {product.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{feature}</span>
                            </li>
                          ))}
                          {product.features.length > 4 && (
                            <li className="text-xs text-zinc-400 pl-6">
                              +{product.features.length - 4} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-sm text-zinc-400 text-center block">-</span>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE_ITEMS - items.length }).map((_, idx) => (
                    <td key={`empty-${idx}`} className="p-4 text-center text-zinc-300 dark:text-zinc-700">
                      <Minus className="h-5 w-5 mx-auto" />
                    </td>
                  ))}
                </tr>

                {/* Add to Cart Row */}
                <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                  <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Action
                  </td>
                  {items.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      <AddToCartButton
                        productId={product._id}
                        name={product.name}
                        price={product.discountPrice || product.price}
                        image={product.images?.[0]?.asset?.url}
                        stock={product.stock}
                        className="w-full max-w-[180px] mx-auto"
                      />
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE_ITEMS - items.length }).map((_, idx) => (
                    <td key={`empty-${idx}`} className="p-4 text-center">
                      <Link href="/">
                        <Button variant="outline" className="w-full max-w-[180px]">
                          <GitCompareArrows className="mr-2 h-4 w-4" />
                          Add Product
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
