"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_CONFIG, getOrderStatus } from "@/lib/constants/orderStatus";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StatusSelectProps {
  order: any;
  onUpdate: (updatedOrder: any) => void;
}

export function StatusSelect({ order, onUpdate }: StatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const currentStatus = order.status ?? "paid";
  const statusConfig = getOrderStatus(currentStatus);
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async (value: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      onUpdate(result.order);
      toast.success(`Order status updated to ${value}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
      <SelectTrigger className="w-[180px]">
        {isUpdating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <StatusIcon className="mr-2 h-4 w-4" />
        )}
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => {
          const Icon = config.icon;
          return (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
