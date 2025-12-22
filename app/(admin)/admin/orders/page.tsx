"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, RefreshCw, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, statusFilter]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Manage and track customer orders
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchOrders()}
          disabled={loading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col gap-4">
        <AdminSearch
          placeholder="Search by order # or email..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="w-max">
              {ORDER_STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs sm:text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Order List */}
      {loading && orders.length === 0 ? (
        <OrderListSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={
            debouncedSearch
              ? "Try adjusting your search terms."
              : statusFilter === "all"
                ? "Orders will appear here when customers make purchases."
                : `No ${statusFilter} orders at the moment.`
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Table>
              <OrderTableHeader />
              <TableBody>
                {orders.map((order) => (
                  <OrderRow key={order._id} order={order} />
                ))}
              </TableBody>
            </Table>
          </div>

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchOrders(true)}
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

function OrderListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
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
