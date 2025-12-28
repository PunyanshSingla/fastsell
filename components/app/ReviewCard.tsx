"use client";

import { Card } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    _id: string;
    customerName: string;
    rating: number;
    title: string;
    comment: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
    notHelpfulCount: number;
    createdAt: string;
    clerkUserId: string;
  };
  currentUserId?: string;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  onVoteHelpful?: (reviewId: string, helpful: boolean) => void;
  userVote?: boolean | null; // true = helpful, false = not helpful, null = no vote
  className?: string;
}

export function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onVoteHelpful,
  userVote,
  className,
}: ReviewCardProps) {
  const isOwnReview = currentUserId === review.clerkUserId;
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className={cn("p-6 space-y-4 hover:shadow-md transition-shadow", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              {review.customerName}
            </h4>
            {review.verifiedPurchase && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                ✓ Verified Purchase
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StarRating rating={review.rating} size="sm" showNumber={false} />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Actions for own review */}
        {isOwnReview && (onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review._id)}
                className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Edit review"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit review</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(review._id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                title="Delete review"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete review</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className="space-y-3">
        <h5 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
          {review.title}
        </h5>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      </div>

      {/* Helpful Votes */}
      {onVoteHelpful && (
        <div className="flex items-center gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Was this helpful?
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant={userVote === true ? "default" : "outline"}
              size="sm"
              onClick={() => onVoteHelpful(review._id, true)}
              className={cn(
                "h-8 gap-1.5 min-w-[60px]",
                userVote === true && "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{review.helpfulCount}</span>
            </Button>
            <Button
              variant={userVote === false ? "default" : "outline"}
              size="sm"
              onClick={() => onVoteHelpful(review._id, false)}
              className={cn(
                "h-8 gap-1.5 min-w-[60px]",
                userVote === false && "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{review.notHelpfulCount}</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
