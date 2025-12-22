"use client";

import { useCallback } from "react";
import useSWRInfinite from "swr/infinite";
import { mutate } from "swr";
import type { Product } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: any;
  fetchMore: () => void;
  total: number;
}

export function useProducts(
  searchParams: URLSearchParams,
  initialData?: {
    products: Product[];
    total: number;
    hasMore: boolean;
  }
): UseProductsResult {
  const searchParamsStr = searchParams.toString();

  const getKey = (pageIndex: number, previousPageData: any) => {
    // If we reached the end
    if (previousPageData && !previousPageData.hasMore) return null;

    const params = new URLSearchParams(searchParamsStr);
    params.set("page", (pageIndex + 1).toString());
    params.set("limit", "12");

    return `/api/products?${params.toString()}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    {
      fallbackData: initialData
        ? [
          {
            products: initialData.products,
            total: initialData.total,
            hasMore: initialData.hasMore,
          },
        ]
        : undefined,
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateIfStale: false, // Prevents reloading when returning from product page
      dedupingInterval: 60000, // 1 minute deduping
      persistSize: true,
    }
  );

  const products = data ? data.flatMap((page) => page.products) : [];
  const isLoading = !data && !error;
  const isLoadingMore = isValidating && products.length > 0;
  const hasMore = data ? data[data.length - 1]?.hasMore : false;
  const total = data ? data[0]?.total : initialData?.total ?? 0;

  const fetchMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1);
    }
  }, [hasMore, isLoadingMore, setSize, size]);

  return {
    products,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    fetchMore,
    total,
  };
}

// Prefetch products for a category (call on hover)
export function prefetchProducts(categorySlug: string | null) {
  const params = new URLSearchParams();
  if (categorySlug) {
    params.set("category", categorySlug);
  }
  params.set("page", "1");
  params.set("limit", "12");
  
  const url = `/api/products?${params.toString()}`;
  
  // Seed the SWR cache if not already present
  // we use the same fetcher logic to ensure cache key matches
  mutate(url, fetcher(url), { revalidate: false });
}
