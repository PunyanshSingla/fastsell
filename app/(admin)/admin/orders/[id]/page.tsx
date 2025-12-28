"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ExternalLink,
  Save,
  Loader2,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StatusSelect,
  AddressEditor,
} from "@/components/admin";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${id}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setOrder(result.order);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load order", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: order.address }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setOrder(result.order);
      toast.success("Address updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update address");
    } finally {
      setSavingAddress(false);
    }
  };

  if (loading) return <OrderDetailSkeleton />;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/admin/orders"
          className="group inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Orders
        </Link>
      </motion.div>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Package className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Placed on {formatDate(order.createdAt, "datetime")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Status Select */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-2 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
          >
            <span className="pl-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              Status
            </span>
            <StatusSelect order={order} onUpdate={setOrder} />
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Order Items */}
          <div className="space-y-8 lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-zinc-200/50 bg-white shadow-xl shadow-zinc-200/20 dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-none overflow-hidden"
            >
              <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Ordered Items ({order.items?.length ?? 0})
                </h2>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.items?.map((item: any, idx: number) => (
                  <div
                    key={item._id || item._key}
                    className="flex gap-6 px-6 py-6 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                  >
                    {/* Image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200/50 dark:bg-zinc-800 dark:ring-zinc-700/50">
                      {item.product?.images?.[0]?.asset?.url ? (
                        <Image
                          src={item.product.images[0].asset.url}
                          alt={item.product.name ?? "Product"}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-bold text-zinc-400">
                          N/A
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {item.product?.name ?? "Unknown Product"}
                          </span>
                          {item.product?.slug && (
                            <Link
                              href={`/products/${item.product.slug}`}
                              target="_blank"
                              className="p-2 rounded-xl bg-zinc-100 text-zinc-400 hover:text-zinc-900 dark:bg-zinc-800 dark:hover:text-zinc-100 transition-all"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          {item.quantity} × {formatPrice(item.priceAtPurchase)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4 sm:mt-0">
                         <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {formatPrice((item.priceAtPurchase ?? 0) * (item.quantity ?? 1))}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-zinc-200/50 bg-white p-6 shadow-xl shadow-zinc-200/20 dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-none"
            >
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 underline decoration-zinc-200 underline-offset-8">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                    Subtotal
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                    Shipping
                  </span>
                  <span className="text-emerald-500 font-bold uppercase tracking-wider text-xs">
                    Free Shipping
                  </span>
                </div>
                <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Total
                    </span>
                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:col-span-2">
            {/* Customer Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-zinc-200/50 bg-zinc-900 p-8 text-white shadow-2xl shadow-zinc-900/20 dark:border-zinc-800/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold font-mono tracking-tight">CUSTOMER DETAILS</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Email Address</label>
                  <p className="mt-1 text-base font-medium break-all">{order.email}</p>
                </div>
                {order.stripePaymentId && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Transaction ID</label>
                    <p className="mt-1 text-xs font-mono bg-white/5 p-3 rounded-xl border border-white/10 break-all">{order.stripePaymentId}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl border border-zinc-200/50 bg-white p-8 shadow-xl shadow-zinc-200/20 dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-none"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <MapPin className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">SHIPPING</h2>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={handleSaveAddress} 
                  disabled={savingAddress}
                >
                  {savingAddress ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <AddressEditor order={order} onUpdate={setOrder} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto p-4 sm:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-14 w-full sm:w-[220px] rounded-2xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[200px] rounded-3xl" />
        </div>
        <div className="space-y-8 lg:col-span-2">
          <Skeleton className="h-[250px] rounded-3xl" />
          <Skeleton className="h-[350px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
