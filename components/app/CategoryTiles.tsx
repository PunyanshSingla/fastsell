"use client";

import Link from "next/link";
import Image from "next/image";
import { Grid2x2, Loader2 } from "lucide-react";
import { useNavigationTransition } from "./ProductBrowsingLayout";
import { prefetchProducts } from "@/lib/hooks/useProducts";
import type { Category } from "@/lib/types";

interface CategoryTilesProps {
  categories: Category[];
  activeCategory?: string;
}

export function CategoryTiles({
  categories,
  activeCategory,
}: CategoryTilesProps) {
  const { isPending, navigate, pendingSlug } = useNavigationTransition();

  const handleCategoryClick = (e: React.MouseEvent, slug: string | null) => {
    // Only intercept normal clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    
    e.preventDefault();
    const url = slug ? `/?category=${slug}` : "/";
    navigate(url, slug ?? "all");
  };

  // Prefetch products on hover for instant loading
  const handleMouseEnter = (slug: string | null) => {
    prefetchProducts(slug);
  };

  return (
    <div className="relative bg-white dark:bg-zinc-950">
      {/* Scroll affordance fades */}
      <div className="absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none dark:from-zinc-950 sm:w-12" />
      <div className="absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none dark:from-zinc-950 sm:w-12" />

      {/* Horizontal scrolling container with snap */}
      <div className="flex gap-2 overflow-x-auto py-3 px-4 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-proximity scroll-smooth items-center">
        {/* All Products tile */}
        <Link
          href="/"
          onClick={(e) => handleCategoryClick(e, null)}
          onMouseEnter={() => handleMouseEnter(null)}
          aria-label="View all products"
          aria-current={!activeCategory ? "page" : undefined}
          className={`group relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 snap-start h-10 w-32 sm:h-12 sm:w-40 flex items-center justify-center gap-2 px-3 border ${
            !activeCategory
              ? "ring-2 ring-amber-500 ring-offset-1 border-amber-500 bg-amber-50 dark:bg-amber-500/10 dark:ring-offset-zinc-950"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
          } ${isPending && pendingSlug !== "all" ? "opacity-70 grayscale-[0.5]" : ""}`}
        >
          {isPending && pendingSlug === "all" ? (
            <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
          ) : (
            <Grid2x2 className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${!activeCategory ? "text-amber-500" : "text-zinc-400"}`} />
          )}
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${!activeCategory ? "text-amber-600 dark:text-amber-500" : "text-zinc-600 dark:text-zinc-400"}`}>
            All Products
          </span>
        </Link>

        {/* Category tiles */}
        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          const isTransitioning = isPending && pendingSlug === category.slug;
          const imageUrl = category.image?.asset?.url;

          return (
            <Link
              key={category._id}
              href={`/?category=${category.slug}`}
              onClick={(e) => handleCategoryClick(e, category.slug ?? null)}
              onMouseEnter={() => handleMouseEnter(category.slug ?? null)}
              aria-label={`View ${category.title} products`}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 snap-start h-10 w-32 sm:h-12 sm:w-40 border ${
                isActive
                  ? "ring-2 ring-amber-500 ring-offset-1 border-amber-500 dark:ring-offset-zinc-950"
                  : "border-zinc-200 dark:border-zinc-800 opacity-90 hover:opacity-100"
              } ${isPending && !isTransitioning ? "opacity-70 grayscale-[0.5]" : ""}`}
            >
              {/* Background image or gradient fallback */}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isTransitioning ? "scale-110 blur-[2px]" : ""}`}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900" />
              )}

              {/* Loading indicator overlay */}
              {isTransitioning && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
              )}

              {/* Dark overlay for text readability */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? "bg-black/40" : "bg-black/50 group-hover:bg-black/40"}`} />

              {/* Category name */}
              <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center p-2 text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white drop-shadow-sm">
                  {category.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
