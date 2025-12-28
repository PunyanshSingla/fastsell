"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  value: number;
  valueFormatter?: (count: number) => string;
  href?: string;
  progress?: number;
  color?: "zinc" | "emerald" | "amber" | "rose" | "teal" | "slate";
}

const colorStyles = {
  zinc: "bg-zinc-950 dark:bg-zinc-100",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
  slate: "bg-slate-700",
};

const bgStyles = {
  zinc: "bg-zinc-50 dark:bg-zinc-800/50",
  emerald: "bg-emerald-50 dark:bg-emerald-500/10",
  amber: "bg-amber-50 dark:bg-amber-500/10",
  rose: "bg-rose-50 dark:bg-rose-500/10",
  teal: "bg-teal-50 dark:bg-teal-500/10",
  slate: "bg-slate-50 dark:bg-slate-500/10",
};

const iconStyles = {
  zinc: "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950",
  emerald: "bg-emerald-500 text-white",
  amber: "bg-amber-500 text-white",
  rose: "bg-rose-500 text-white",
  teal: "bg-teal-500 text-white",
  slate: "bg-slate-700 text-white",
};

export function StatCard({
  title,
  icon: Icon,
  value,
  valueFormatter = (count) => count.toLocaleString(),
  href,
  progress = 65,
  color = "zinc",
}: StatCardProps) {
  const content = (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-2xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:backdrop-blur-sm dark:hover:shadow-none",
        href && "cursor-pointer"
      )}
    >
      {/* Decorative Gradient Background */}
      <div className={cn(
        "absolute -right-4 -top-4 h-32 w-32 rounded-full transition-all duration-500 group-hover:scale-110 opacity-50",
        bgStyles[color]
      )} />
      
      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {valueFormatter(value)}
            </p>
          </div>
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
          iconStyles[color]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
