"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, ShoppingCart, TrendingUp, Plus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  StatCard,
  LowStockAlert,
  RecentOrders,
} from "@/components/admin";
import { cn } from "@/lib/utils";

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
      toast.error("Failed to fetch dashboard data", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateProduct = () => {
    window.location.href = "/admin/inventory/new";
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-zinc-200 dark:border-zinc-800" />
          <div className="absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent dark:border-zinc-100" />
        </div>
        <p className="text-sm font-medium text-zinc-500 animate-pulse">Loading amazing insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Welcome back! Here's what's happening with your store today.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="outline"
            className="rounded-xl border-zinc-200/50 bg-white/50 backdrop-blur-sm transition-all hover:bg-white dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4 transition-transform duration-500", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            onClick={handleCreateProduct} 
            className="rounded-xl bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatCard
          title="Total Products"
          icon={Package}
          value={data?.rawMetrics?.totalProductsCount ?? 0}
          href="/admin/inventory"
          color="zinc"
          progress={78}
        />
        <StatCard
          title="Total Orders"
          icon={ShoppingCart}
          value={data?.rawMetrics?.orderCount ?? 0}
          href="/admin/orders"
          color="emerald"
          progress={Math.min(100, parseFloat(data?.rawMetrics?.revenueChange || 0) + 50)}
        />
        <StatCard
          title="Low Stock Items"
          icon={TrendingUp}
          value={data?.rawMetrics?.lowStockCount ?? 0}
          href="/admin/inventory"
          color="amber"
          progress={data?.rawMetrics?.totalProductsCount > 0 ? Math.round((data.rawMetrics.lowStockCount / data.rawMetrics.totalProductsCount) * 100) : 0}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LowStockAlert products={data?.insights?.inventory?.needsRestock?.map((p: any) => ({
            ...p,
            documentId: p.id
          }))} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RecentOrders orders={data?.rawMetrics?.recentOrders} />
        </motion.div>
      </div>
    </div>
  );
}
