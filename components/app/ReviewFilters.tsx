"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReviewFiltersProps {
  selectedRating: number | null;
  selectedSort: string;
  verifiedOnly: boolean;
  onRatingChange: (rating: number | null) => void;
  onSortChange: (sort: string) => void;
  onVerifiedChange: (verified: boolean) => void;
  onClearFilters: () => void;
  className?: string;
}

export function ReviewFilters({
  selectedRating,
  selectedSort,
  verifiedOnly,
  onRatingChange,
  onSortChange,
  onVerifiedChange,
  className,
}: ReviewFiltersProps) {
  const hasActiveFilters = selectedRating !== null || verifiedOnly;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Sort by:
          </span>
          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Rating:
          </span>
          <div className="flex gap-1">
            <Button
              variant={selectedRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => onRatingChange(null)}
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={selectedRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => onRatingChange(rating)}
                className="gap-1"
              >
                {rating}
                <Star className="h-3 w-3 fill-current" />
              </Button>
            ))}
          </div>
        </div>

        {/* Verified Purchase Toggle */}
        <Button
          variant={verifiedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onVerifiedChange(!verifiedOnly)}
          className="gap-2"
        >
          {verifiedOnly && <Badge variant="secondary" className="h-1.5 w-1.5 rounded-full p-0 bg-green-500" />}
          Verified Purchases Only
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onRatingChange(null);
              onVerifiedChange(false);
            }}
            className="gap-1 text-zinc-600 dark:text-zinc-400"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
