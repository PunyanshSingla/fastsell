"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg" | "xl";
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = true,
  reviewCount,
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(
              sizeClasses[size],
              "fill-yellow-400 text-yellow-400"
            )}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                "text-yellow-400"
              )}
            />
            <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
              <Star
                className={cn(
                  sizeClasses[size],
                  "fill-yellow-400 text-yellow-400"
                )}
              />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(
              sizeClasses[size],
              "text-zinc-300 dark:text-zinc-600"
            )}
          />
        ))}
      </div>

      {showNumber && (
        <span className={cn(
          "font-medium text-zinc-700 dark:text-zinc-300",
          textSizeClasses[size]
        )}>
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={cn(
          "text-zinc-500 dark:text-zinc-400",
          textSizeClasses[size]
        )}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
