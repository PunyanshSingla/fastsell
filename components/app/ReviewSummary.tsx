"use client";

import { Card } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { Progress } from "@/components/ui/progress";

interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  className?: string;
}

export function ReviewSummary({
  averageRating,
  reviewCount,
  ratingDistribution,
  className,
}: ReviewSummaryProps) {
  return (
    <Card className={className}>
      <div className="p-8 space-y-6">
        {/* Overall Rating */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="text-center md:text-left min-w-[140px]">
            <div className="text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating
              rating={averageRating}
              size="lg"
              showNumber={false}
              className="mt-2 justify-center md:justify-start"
            />
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
              Based on {reviewCount.toLocaleString()} {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 w-full space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {rating}
                  </span>
                  <svg
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    stars
                  </span>
                </div>
                <div className="flex-1">
                  <Progress value={percentage} className="h-2.5" />
                </div>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 w-16 text-right">
                  {percentage}% <span className="text-xs text-zinc-400">({count})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
