"use client";

import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { formatPrice, formatDate, formatOrderNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrderRowProps {
  order: any;
}

export function OrderRow({ order }: OrderRowProps) {
  const status = getOrderStatus(order.status);
  const StatusIcon = status.icon;
  const itemCount = order.items?.length ?? 0;

  return (
    <TableRow className="group transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800">
      {/* Order Info */}
      <TableCell className="py-4 pl-6">
        <Link href={`/admin/orders/${order._id}`} className="block">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              #{formatOrderNumber(order.orderNumber)}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest sm:hidden">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
          </div>
        </Link>
      </TableCell>

      {/* Customer */}
      <TableCell className="hidden py-4 sm:table-cell">
        <Link href={`/admin/orders/${order._id}`} className="block">
          <p className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
            {order.email}
          </p>
        </Link>
      </TableCell>

      {/* Items Count */}
      <TableCell className="hidden py-4 text-center md:table-cell">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {itemCount}
        </span>
      </TableCell>

      {/* Total */}
      <TableCell className="py-4 text-right sm:text-left">
        <div className="flex flex-col items-end sm:items-start sm:block">
           <span className="font-bold text-zinc-900 dark:text-zinc-100">
             {formatPrice(order.total)}
           </span>
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest sm:hidden">
             {status.label}
           </span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="hidden py-4 sm:table-cell">
        <Badge
          variant="secondary"
          className={cn(
            "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-none",
            status.color
          )}
        >
          <StatusIcon className="mr-1.5 h-3 w-3" />
          {status.label}
        </Badge>
      </TableCell>

      {/* Date */}
      <TableCell className="hidden py-4 text-zinc-500 dark:text-zinc-400 md:table-cell pr-6">
        <div className="flex flex-col items-end text-xs">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatDate(order.createdAt, "short")}
          </span>
          <span className="text-[10px] text-zinc-400">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function OrderRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="py-4 pl-6">
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell className="hidden py-4 sm:table-cell">
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="mx-auto h-7 w-7 rounded-full" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-5 w-16" />
      </TableCell>
      <TableCell className="hidden py-4 sm:table-cell">
        <Skeleton className="h-6 w-24 rounded-lg" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell pr-6">
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2 w-10" />
        </div>
      </TableCell>
    </TableRow>
  );
}
