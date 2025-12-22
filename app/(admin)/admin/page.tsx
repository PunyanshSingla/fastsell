"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, ShoppingCart, TrendingUp, Plus, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StatCard,
  LowStockAlert,
  RecentOrders,
  AIInsightsCard,
} from "@/components/admin";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/insights");
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateProduct = () => {
    // Redirect to a new product creation page (to be implemented)
    // For now, just go to inventory
    window.location.href = "/admin/inventory/new";
  };

  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Overview of your store
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={handleCreateProduct} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </div>
      </div>

      {/* AI Insights (now uses the same data if we want, but it has its own fetch currently) */}
      {/* Better to sync them or just let AIInsightsCard fetch its own as before */}
      <AIInsightsCard />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Products"
          icon={Package}
          value={data?.rawMetrics?.totalProductsCount ?? 0}
          href="/admin/inventory"
        />
        <StatCard
          title="Total Orders"
          icon={ShoppingCart}
          value={data?.rawMetrics?.orderCount ?? 0}
          href="/admin/orders"
        />
        <StatCard
          title="Low Stock Items"
          icon={TrendingUp}
          value={data?.rawMetrics?.lowStockCount ?? 0}
          href="/admin/inventory"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LowStockAlert products={data?.insights?.inventory?.needsRestock?.map((p: any) => ({
          ...p,
          documentId: p.id // Map to what the component expects
        }))} />
        {/* We need to provide more data to RecentOrders if we want it to work without fetching */}
        {/* For now let's just update the components to take data as props */}
        <RecentOrders orders={data?.rawMetrics?.recentOrders} />
      </div>
    </div>
  );
}

// Need to import cn
import { cn } from "@/lib/utils";
