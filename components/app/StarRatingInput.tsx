"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function StarRatingInput({
  value,
  onChange,
  maxRating = 5,
  size = "md",
  disabled = false,
  className,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => !disabled && onChange(starValue)}
            onMouseEnter={() => !disabled && setHoverRating(starValue)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            disabled={disabled}
            className={cn(
              "transition-all duration-150",
              !disabled && "cursor-pointer hover:scale-110",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label={`Rate ${starValue} out of ${maxRating} stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-zinc-300 dark:text-zinc-600 hover:text-yellow-300 dark:hover:text-yellow-500"
              )}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {value} {value === 1 ? "star" : "stars"}
        </span>
      )}
    </div>
  );
}
