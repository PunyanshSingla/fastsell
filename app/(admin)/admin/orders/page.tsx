"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, RefreshCw, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  OrderRow,
  OrderRowSkeleton,
  AdminSearch,
  useDebouncedValue,
  OrderTableHeader,
} from "@/components/admin";
import { ORDER_STATUS_TABS } from "@/lib/constants/orderStatus";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchOrders = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      setError(null);
      
      const currentPage = isLoadMore ? page + 1 : 1;
      const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const response = await fetch(
        `/api/admin/orders?search=${debouncedSearch}${statusParam}&page=${currentPage}&limit=20`
      );
      const result = await response.json();
      
      if (!result.success) throw new Error(result.error);
      
      if (isLoadMore) {
        setOrders((prev) => [...prev, ...result.orders]);
        setPage(currentPage);
      } else {
        setOrders(result.orders);
        setPage(1);
      }
      setHasMore(result.pagination.hasMore);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load orders", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, statusFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Orders
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Track customer purchases and manage fulfillment.
          </p>
        </motion.div>
        <Button
          variant="outline"
          className="rounded-xl border-zinc-200/50 bg-white/50 backdrop-blur-sm hover:bg-white dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
          onClick={() => fetchOrders()}
          disabled={loading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4 transition-transform", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <AdminSearch
            placeholder="Search by order # or email..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:max-w-md"
          />
        </div>
        
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="h-12 w-full sm:w-max inline-flex p-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-xl backdrop-blur-sm">
              {ORDER_STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-zinc-100"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Order List */}
      <AnimatePresence mode="wait">
        {loading && orders.length === 0 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OrderListSkeleton />
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description={
                debouncedSearch
                  ? `No orders matching "${debouncedSearch}" were found.`
                  : statusFilter === "all"
                    ? "Orders will appear here as soon as customers start shopping."
                    : `There are currently no orders with the status "${statusFilter}".`
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
              <OrderTableHeader />
              <TableBody>
                {orders.map((order, index) => (
                  <OrderRow key={order._id} order={order} />
                ))}
              </TableBody>
            </Table>

            {hasMore && (
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <Button
                  variant="ghost"
                  className="rounded-xl font-bold uppercase tracking-wider text-xs px-8 h-12 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all"
                  onClick={() => fetchOrders(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
                  ) : null}
                  Load More Orders
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <OrderTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
