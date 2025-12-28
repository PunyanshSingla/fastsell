"use client";

import { useState, useEffect } from "react";
import { ReviewCard } from "./ReviewCard";
import { ReviewFilters } from "./ReviewFilters";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Review {
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
  helpfulVotes?: { userId: string; helpful: boolean }[];
}

interface ReviewListProps {
  productId: string;
  currentUserId?: string;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  className?: string;
}

export function ReviewList({
  productId,
  currentUserId,
  onEdit,
  onDelete,
  className,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchReviews = async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        productId,
        page: pageNum.toString(),
        limit: "10",
        sort: selectedSort,
      });

      if (selectedRating) {
        params.append("rating", selectedRating.toString());
      }

      if (verifiedOnly) {
        params.append("verifiedPurchase", "true");
      }

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch reviews");
      }

      if (append) {
        setReviews((prev) => [...prev, ...data.reviews]);
      } else {
        setReviews(data.reviews);
      }

      setTotalPages(data.pagination.pages);
      setPage(pageNum);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast.error(error.message || "Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [productId, selectedRating, selectedSort, verifiedOnly]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchReviews(page + 1, true);
    }
  };

  const handleVoteHelpful = async (reviewId: string, helpful: boolean) => {
    if (!currentUserId) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ helpful }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to vote");
      }

      // Update local state
      setReviews((prev) =>
        prev.map((review) =>
          review._id === reviewId ? data.review : review
        )
      );

      toast.success("Vote recorded");
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to vote");
    }
  };

  const getUserVote = (review: Review): boolean | null => {
    if (!currentUserId || !review.helpfulVotes) return null;
    const vote = review.helpfulVotes.find((v) => v.userId === currentUserId);
    return vote ? vote.helpful : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filters */}
      <ReviewFilters
        selectedRating={selectedRating}
        selectedSort={selectedSort}
        verifiedOnly={verifiedOnly}
        onRatingChange={setSelectedRating}
        onSortChange={setSelectedSort}
        onVerifiedChange={setVerifiedOnly}
        onClearFilters={() => {
          setSelectedRating(null);
          setVerifiedOnly(false);
        }}
        className="mb-6"
      />

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No reviews yet
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onVoteHelpful={handleVoteHelpful}
              userVote={getUserVote(review)}
            />
          ))}

          {/* Load More */}
          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More Reviews (${reviews.length} of ${totalPages * 10})`
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
