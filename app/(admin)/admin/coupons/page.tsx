"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Tag, Percent, DollarSign } from "lucide-react"; // Icons for type
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  _id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  expirationDate: string;
  isActive: boolean;
  usedCount: number;
  usageLimit?: number;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      toast.error("Error loading coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete coupon");

      toast.success("Coupon deleted");
      fetchCoupons(); // Refresh list
    } catch (error) {
      toast.error("Error deleting coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Coupons
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Manage discount codes and promotions.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                  No coupons found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium font-mono text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-500" />
                      {coupon.code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {coupon.type === "PERCENTAGE" ? (
                        <Percent className="h-3 w-3" />
                      ) : (
                        <div className="h-3 w-3 flex items-center justify-center font-bold text-[10px]">₹</div>
                      )}
                      {coupon.type === "PERCENTAGE"
                        ? `${coupon.value}% OFF`
                        : `₹${coupon.value} OFF`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        coupon.isActive
                          ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                      }
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : "∞"}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {format(new Date(coupon.expirationDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                        <Link href={`/admin/coupons/${coupon._id}`}>
                            <Tag className="h-4 w-4" />
                        </Link>
                        </Button>
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
