"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minPurchaseAmount: "",
    expirationDate: "",
    usageLimit: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(`/api/coupons/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch coupon");
        const data = await res.json();
        
        setFormData({
            code: data.code,
            type: data.type,
            value: data.value.toString(),
            minPurchaseAmount: data.minPurchaseAmount ? data.minPurchaseAmount.toString() : "",
            expirationDate: format(new Date(data.expirationDate), "yyyy-MM-dd"),
            usageLimit: data.usageLimit ? data.usageLimit.toString() : "",
            isActive: data.isActive,
        });
      } catch (error) {
        console.error("Error loading coupon details:", error);
        toast.error("Error loading coupon details");
        router.push("/admin/coupons");
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) {
      fetchCoupon();
    }
  }, [params.id, router]);

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/coupons/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: Number(formData.value),
          minPurchaseAmount: Number(formData.minPurchaseAmount) || 0,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update coupon");
      }

      toast.success("Coupon updated successfully");
      router.push("/admin/coupons");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Edit Coupon
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Modify coupon details and status.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Code & Type */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              disabled
              value={formData.code}
              className="uppercase font-mono bg-zinc-100 dark:bg-zinc-800"
            />
            <p className="text-xs text-zinc-500">Code cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Discount Type</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => handleChange("type", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Value & Min Purchase */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="value">
              {formData.type === "PERCENTAGE" ? "Percentage Value (%)" : "Discount Amount (₹)"}
            </Label>
            <Input
              id="value"
              type="number"
              placeholder={formData.type === "PERCENTAGE" ? "20" : "10"}
              value={formData.value}
              onChange={(e) => handleChange("value", e.target.value)}
              required
              min="0"
              max={formData.type === "PERCENTAGE" ? "100" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minPurchaseAmount">Min. Purchase Amount (₹)</Label>
            <Input
              id="minPurchaseAmount"
              type="number"
              placeholder="0 (Optional)"
              value={formData.minPurchaseAmount}
              onChange={(e) => handleChange("minPurchaseAmount", e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Expiration & Limits */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleChange("expirationDate", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input
              id="usageLimit"
              type="number"
              placeholder="Total uses (Optional)"
              value={formData.usageLimit}
              onChange={(e) => handleChange("usageLimit", e.target.value)}
              min="1"
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="space-y-0.5">
            <Label className="text-base">Active Status</Label>
            <p className="text-sm text-zinc-500">
              Enable or disable this coupon immediately.
            </p>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange("isActive", checked)}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Update Coupon
          </Button>
        </div>
      </form>
    </div>
  );
}
