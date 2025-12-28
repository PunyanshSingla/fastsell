"use client";

import { Card } from "@/components/ui/card";
import { Star, MessageSquare, Clock, CheckCircle } from "lucide-react";

interface ReviewStatsProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  platformAverageRating: number;
}

export function ReviewStats({ stats, platformAverageRating }: ReviewStatsProps) {
  const statCards = [
    {
      title: "Pending Reviews",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: "Approved Reviews",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Total Reviews",
      value: stats.total,
      icon: MessageSquare,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Platform Rating",
      value: platformAverageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      suffix: "/5.0",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {stat.value}
                {stat.suffix && (
                  <span className="text-base font-normal text-zinc-500 ml-1">
                    {stat.suffix}
                  </span>
                )}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
