"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import { motion } from "framer-motion";

interface RecentOrdersProps {
  orders?: any[];
}

export function RecentOrders({ orders = [] }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="flex items-center justify-between border-b border-zinc-200/50 px-6 py-5 dark:border-zinc-800/50">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">
            Recent Orders
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <ShoppingCart className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No orders yet
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <div>
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">
            Recent Orders
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest transactions from your store</p>
        </div>
        <Link
          href="/admin/orders"
          className="group flex items-center gap-1 text-sm font-medium text-zinc-900 hover:underline dark:text-white"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="p-3 space-y-1">
        {orders.map((order, index) => {
          const status = getOrderStatus(order.status);
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/admin/orders/${order._id}`}
                className="group flex items-center justify-between rounded-xl p-3 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <StatusIcon className={cn("h-5 w-5", status.color.split(' ')[0].replace('bg-', 'text-'))} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      #{formatOrderNumber(order.orderNumber)}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {order.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">INR</p>
                  </div>
                  <Badge variant="secondary" className={cn("rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none", status.color)}>
                    {status.label}
                  </Badge>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

import { cn } from "@/lib/utils";
