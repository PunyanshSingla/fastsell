"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ExternalLink,
  Edit2,
  Save,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StatusSelect,
  AddressEditor,
} from "@/components/admin";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    <div className="space-y-4 sm:space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {formatDate(order.createdAt, "datetime")}
            </p>
          </div>

          {/* Status and Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Status:
              </span>
              <StatusSelect order={order} onUpdate={setOrder} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Order Items */}
          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6 sm:py-4">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Items ({order.items?.length ?? 0})
                </h2>
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {order.items?.map((item: any) => (
                  <div
                    key={item._id || item._key}
                    className="flex gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
                  >
                    {/* Image */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 sm:h-20 sm:w-20">
                      {item.product?.image?.asset?.url ? (
                        <Image
                          src={item.product.image.asset.url}
                          alt={item.product.name ?? "Product"}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:text-base">
                            {item.product?.name ?? "Unknown Product"}
                          </span>
                          {item.product?.slug && (
                            <Link
                              href={`/products/${item.product.slug}`}
                              target="_blank"
                              className="shrink-0 text-zinc-400 hover:text-zinc-600"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                          Qty: {item.quantity} ×{" "}
                          {formatPrice(item.priceAtPurchase)}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:text-base">
                        {formatPrice(
                          (item.priceAtPurchase ?? 0) * (item.quantity ?? 1),
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Order Summary
              </h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Subtotal
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                  <div className="flex justify-between font-semibold">
                    <span className="text-zinc-900 dark:text-zinc-100">
                      Total
                    </span>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-2">
            {/* Customer Info */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Customer
                </h2>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="break-all text-zinc-900 dark:text-zinc-100">
                  {order.email}
                </p>
                {order.stripePaymentId && (
                  <p className="break-all text-xs text-zinc-500 dark:text-zinc-400">
                    Payment: {order.stripePaymentId}
                  </p>
                )}
              </div>
            </div>

            {/* Editable Shipping Address */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-zinc-400" />
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Shipping Address
                  </h2>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleSaveAddress} 
                  disabled={savingAddress}
                >
                  {savingAddress ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-4">
                <AddressEditor order={order} onUpdate={setOrder} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-full sm:w-[180px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="space-y-6 lg:col-span-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
