"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Menu,
  X,
  ExternalLink,
  Tags,
  Users,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Providers } from "@/components/providers/Providers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: Tags,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Providers>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 selection:bg-emerald-600 selection:text-white dark:selection:bg-emerald-500 dark:selection:text-white">
        {/* Background Gradients */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-zinc-500/10 blur-[120px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[120px]" />
        </div>

        {/* Mobile Header */}
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-200/50 bg-white/70 px-4 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/70 lg:hidden">
          <Link href="/admin" className="flex items-center gap-3 transition-transform active:scale-95">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 shadow-lg shadow-zinc-900/20 dark:bg-zinc-100 dark:shadow-none">
              <span className="text-sm font-bold text-white dark:text-zinc-900">
                A
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Admin
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </header>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-64 border-r border-zinc-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 dark:border-zinc-800/50 dark:bg-zinc-900/70 lg:translate-x-0 outline-none",
            sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-20 items-center border-b border-zinc-200/50 px-6 dark:border-zinc-800/50">
              <Link
                href="/admin"
                className="flex items-center gap-3 transition-transform active:scale-95"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 shadow-xl shadow-zinc-900/20 dark:bg-zinc-100 dark:shadow-none">
                  <span className="text-base font-bold text-white dark:text-zinc-900">
                    A
                  </span>
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Admin
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-3 py-6">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100",
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-inherit" : "group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                    )} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 z-[-1] rounded-xl bg-zinc-900 dark:bg-zinc-100"
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="space-y-4 border-t border-zinc-200/50 px-4 py-6 dark:border-zinc-800/50">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 group-hover:bg-white dark:bg-zinc-800 dark:group-hover:bg-zinc-700 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <span>Back to Store</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="pt-16 lg:ml-64 lg:pt-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-4 lg:p-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </Providers>
  );
}

export default AdminLayout;
