
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  ShoppingBag,
  User as UserIcon,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUser(data.user);
      setOrders(data.orders);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast.error(error.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
      case "cancelled":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">User not found</h2>
        <Link href="/admin/users" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 active:scale-95 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">User Details</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            View detailed information about this user
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Info Card */}
        <Card className="md:col-span-1 rounded-2xl overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Profile Info</CardTitle>
                <CardDescription>Basic user details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">{user.name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100 truncate" title={user.email}>{user.email}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Joined Date
              </label>
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                {user.createdAt ? format(new Date(user.createdAt), "PPP") : "N/A"}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Total Orders</span>
                <Badge variant="secondary" className="rounded-full px-3">{orders.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="md:col-span-2 rounded-2xl overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Order History</CardTitle>
                <CardDescription>Recent purchases made by this user</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                    <TableHead className="py-4 pl-6">Order ID</TableHead>
                    <TableHead className="py-4">Date</TableHead>
                    <TableHead className="py-4">Status</TableHead>
                    <TableHead className="py-4 text-right pr-6">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Package className="h-8 w-8 opacity-20" />
                          <p>No orders found for this user.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                        <TableRow onClick={() => router.push(`/admin/orders/${order._id}`)} key={order._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 cursor-pointer">
                          <TableCell className="font-mono text-xs pl-6">
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                              #{order.orderNumber || order._id.slice(-6)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                            {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`rounded-full capitalize font-medium ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-zinc-900 dark:text-zinc-100 text-right pr-6">
                            ₹{order.total?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
