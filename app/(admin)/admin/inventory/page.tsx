"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ProductRow,
  ProductRowSkeleton,
  AdminSearch,
  useDebouncedValue,
  ProductTableHeader,
} from "@/components/admin";
import { cn } from "@/lib/utils";

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
      toast.error("Failed to fetch products", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch]);

  const handleCreateProduct = () => {
    setIsCreating(true);
    window.location.href = "/admin/inventory/new";
  };

  const handleUpdate = (updatedProduct: any) => {
    if (!updatedProduct) {
      fetchProducts();
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Inventory
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Manage your product catalog, real-time stock, and pricing.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="outline"
            className="rounded-xl border-zinc-200/50 bg-white/50 backdrop-blur-sm hover:bg-white dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
            onClick={() => fetchProducts()}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4 transition-transform", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={handleCreateProduct}
            disabled={isCreating}
            className="rounded-xl bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none"
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Product
          </Button>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <AdminSearch
          placeholder="Search product name or SKU..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-md"
        />
      </motion.div>

      {/* Product List */}
      <AnimatePresence mode="wait">
        {loading && products.length === 0 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProductListSkeleton />
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <EmptyState
              icon={Package}
              title={debouncedSearch ? "No products found" : "Your inventory is empty"}
              description={
                debouncedSearch
                  ? `We couldn't find anything matching "${debouncedSearch}".`
                  : "Start building your store by adding your first product."
              }
              action={
                !debouncedSearch
                  ? {
                      label: "Create First Product",
                      onClick: handleCreateProduct,
                      disabled: isCreating,
                      icon: isCreating ? Loader2 : Plus,
                    }
                  : undefined
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-200/50 bg-white/70 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/70 overflow-hidden shadow-xl shadow-zinc-200/20 dark:shadow-none"
          >
            <Table>
              <ProductTableHeader />
              <TableBody>
                {products.map((product, index) => (
                  <ProductRow 
                    key={product._id} 
                    product={product} 
                    onUpdate={handleUpdate}
                  />
                ))}
              </TableBody>
            </Table>

            {hasMore && (
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <Button
                  variant="ghost"
                  className="rounded-xl font-bold uppercase tracking-wider text-xs px-8 h-12 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all"
                  onClick={() => fetchProducts(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load More Products
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
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
