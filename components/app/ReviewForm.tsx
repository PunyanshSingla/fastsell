"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "./StarRatingInput";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSuccess?: () => void;
  className?: string;
}

export function ReviewForm({
  productId,
  productName,
  onSuccess,
  className,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (title.trim().length === 0) {
      toast.error("Please enter a review title");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review comment must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      
      // Reset formz
      setRating(0);
      setTitle("");
      setComment("");

      // Refresh the page to show updated reviews
      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Write a Review
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Share your experience with {productName}
          </p>
        </div>

        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Rating */}
        <div className="space-y-3">
          <Label htmlFor="rating" className="text-base font-semibold">
            Your Rating <span className="text-red-500">*</span>
          </Label>
          <StarRatingInput
            value={rating}
            onChange={setRating}
            size="lg"
            disabled={isSubmitting}
          />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base font-semibold">
            Review Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Sum up your experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            disabled={isSubmitting}
            required
            className="text-base"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {title.length}/100 characters
          </p>
        </div>

        {/* Comment */}
        <div className="space-y-3">
          <Label htmlFor="comment" className="text-base font-semibold">
            Your Review <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="comment"
            placeholder="Tell us what you think about this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={6}
            maxLength={2000}
            disabled={isSubmitting}
            required
            className="resize-none text-base"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {comment.length}/2000 characters (minimum 10)
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting Review...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </Card>
  );
}
