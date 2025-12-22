"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  ProductRow,
  ProductRowSkeleton,
  AdminSearch,
  useDebouncedValue,
  ProductTableHeader,
} from "@/components/admin";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      setError(null);
      
      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await fetch(
        `/api/admin/products?search=${debouncedSearch}&page=${currentPage}&limit=20`
      );
      const result = await response.json();
      
      if (!result.success) throw new Error(result.error);
      
      if (isLoadMore) {
        setProducts((prev) => [...prev, ...result.products]);
        setPage(currentPage);
      } else {
        setProducts(result.products);
        setPage(1);
      }
      setHasMore(result.pagination.hasMore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch]);

  const handleCreateProduct = () => {
    setIsCreating(true);
    // Redirect to a new product creation page
    window.location.href = "/admin/inventory/new";
  };

  const handleUpdate = (updatedProduct: any) => {
    if (!updatedProduct) {
      // If null, it means deleted
      fetchProducts();
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Manage your product stock and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchProducts()}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={handleCreateProduct}
            disabled={isCreating}
            className="w-full sm:w-auto"
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <AdminSearch
        placeholder="Search products..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="w-full sm:max-w-sm"
      />

      {/* Product List */}
      {loading && products.length === 0 ? (
        <ProductListSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={debouncedSearch ? "No products found" : "No products yet"}
          description={
            debouncedSearch
              ? "Try adjusting your search terms."
              : "Get started by adding your first product."
          }
          action={
            !debouncedSearch
              ? {
                  label: "Add Product",
                  onClick: handleCreateProduct,
                  disabled: isCreating,
                  icon: isCreating ? Loader2 : Plus,
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Table>
              <ProductTableHeader />
              <TableBody>
                {products.map((product) => (
                  <ProductRow 
                    key={product._id} 
                    product={product} 
                    onUpdate={handleUpdate}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchProducts(true)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <ProductTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <ProductRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { cn } from "@/lib/utils";
