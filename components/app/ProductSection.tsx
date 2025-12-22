"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PanelLeftClose, PanelLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { useNavigationTransition } from "./ProductBrowsingLayout";
import { useProducts } from "@/lib/hooks/useProducts";
import type { Category } from "@/lib/types";

interface ProductSectionProps {
  categories: Category[];
  initialData: {
    products: any[];
    total: number;
    hasMore: boolean;
  };
  searchQuery: string;
}

export function ProductSection({
  categories,
  initialData,
  searchQuery,
}: ProductSectionProps) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { isPending } = useNavigationTransition();
  const searchParams = useSearchParams();
  
  // Memoize search params to prevent unnecessary re-fetches
  const stableSearchParams = useMemo(() => {
    return new URLSearchParams(searchParams.toString());
  }, [searchParams]);
  
  // Use client-side fetching with caching and pagination
  const { 
    products, 
    isLoading, 
    isLoadingMore, 
    hasMore, 
    fetchMore, 
    total 
  } = useProducts(stableSearchParams, initialData);
  
  // Simplify display logic
  const showSkeleton = isLoading && products.length === 0;

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, fetchMore]);

  return (
    <div className={`flex flex-col gap-6 transition-all duration-300 ${isPending ? "opacity-50 pointer-events-none grayscale-[0.1]" : "opacity-100"}`}>
      {/* Header with results count and filter toggle */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {showSkeleton ? (
            <span className="animate-pulse">Loading products...</span>
          ) : (
            <>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {total}
              </span>{" "}
              {total === 1 ? "product" : "products"}{" "}
              found
              {searchQuery && (
                <span>
                  {" "}
                  for &quot;<span className="font-medium">{searchQuery}</span>&quot;
                </span>
              )}
            </>
          )}
        </p>

        {/* Filter toggle button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 border-zinc-300 bg-white shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          aria-label={filtersOpen ? "Hide filters" : "Show filters"}
        >
          {filtersOpen ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="hidden sm:inline">Hide Filters</span>
              <span className="sm:hidden">Hide</span>
            </>
          ) : (
            <>
              <PanelLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Show Filters</span>
              <span className="sm:hidden">Filters</span>
            </>
          )}
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters - completely hidden when collapsed on desktop */}
        <aside
          className={`shrink-0 transition-all duration-300 ease-in-out ${
            filtersOpen ? "w-full lg:w-72 lg:opacity-100" : "hidden lg:hidden"
          }`}
        >
          <ProductFilters categories={categories} />
        </aside>

        {/* Product Grid - expands to full width when filters hidden */}
        <main className="flex-1 transition-all duration-300">
          {showSkeleton ? (
            <ProductGridSkeleton />
          ) : (
            <>
              <ProductGrid products={products} />
              
              {/* Infinite Scroll Trigger & Loading State */}
              <div 
                ref={loadMoreRef} 
                className="mt-12 flex flex-col items-center justify-center gap-4 py-8"
              >
                {isLoadingMore ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p className="text-sm font-medium text-zinc-500 animate-pulse">
                      Loading more awesome products...
                    </p>
                  </div>
                ) : hasMore ? (
                  <Button 
                    variant="ghost" 
                    onClick={() => fetchMore()}
                    className="text-zinc-500 hover:text-amber-500 hover:bg-amber-50"
                  >
                    Scroll down or click to load more
                  </Button>
                ) : products.length > 0 ? (
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
                    <p className="text-xs font-medium uppercase tracking-widest">
                      You&apos;ve reached the end
                    </p>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

