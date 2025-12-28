"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LowStockAlertProps {
  products?: any[];
}

export function LowStockAlert({ products = [] }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="flex items-center gap-2 border-b border-zinc-200/50 px-6 py-5 dark:border-zinc-800/50">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">
            Inventory Health
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            All products are well stocked!
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
      <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <div>
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">
            Low Stock Alerts
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Items requiring immediate attention</p>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <AnimatePresence>
          {products.slice(0, 5).map((product, index) => {
            const isOutOfStock = product.stock === 0;
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/admin/inventory/${product._id}`}
                  className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200/50 dark:bg-zinc-800 dark:ring-zinc-700/50">
                    {product?.images?.[0]?.asset?.url ? (
                      <Image
                        src={product.images[0].asset.url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-zinc-400">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 px-0.5">
                      {product.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                       <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isOutOfStock ? "text-red-500" : "text-amber-500"
                       )}>
                        {isOutOfStock ? "Out of Stock" : "Limited Stock"}
                       </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={isOutOfStock ? "destructive" : "outline"}
                      className={cn(
                        "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none",
                        !isOutOfStock && "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      )}
                    >
                      {isOutOfStock ? "Restock" : `${product.stock} left`}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {products.length > 5 && (
          <Link
            href="/admin/inventory?filter=low-stock"
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-t border-zinc-100 dark:border-zinc-800 mt-2"
          >
            View all {products.length} low stock items
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
