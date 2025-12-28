"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/app/StarRating";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  customerName: string;
  clerkUserId: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    clerkUserId: string;
  };
  product: {
    _id: string;
    name: string;
    slug: string;
    images: { asset: { url: string } }[];
  };
}

interface ReviewsTableProps {
  reviews: Review[];
}

export function ReviewsTable({ reviews }: ReviewsTableProps) {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
        <p className="text-center text-zinc-500">No reviews found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View - Hidden on mobile/tablet */}
      <div className="hidden lg:block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="relative w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead className="min-w-[180px]">Customer</TableHead>
                <TableHead className="min-w-[100px]">Rating</TableHead>
                <TableHead className="min-w-[250px]">Review</TableHead>
                <TableHead className="min-w-[120px]">Verification</TableHead>
                <TableHead className="min-w-[140px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review._id}>
                  {/* Product Column */}
                  <TableCell>
                    <Link
                      href={`/admin/inventory/${review.product._id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                        {review.product.images?.[0]?.asset?.url ? (
                          <Image
                            src={review.product.images[0].asset.url}
                            alt={review.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-zinc-400 text-xs">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {review.product.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {review.product.slug}
                        </p>
                      </div>
                    </Link>
                  </TableCell>

                  {/* Customer Column */}
                  <TableCell>
                    <Link
                      href={`/admin/users/${review.customer._id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs">
                          {review.customer.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {review.customer.name || review.customerName}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {review.customer.email}
                        </p>
                      </div>
                    </Link>
                  </TableCell>

                  {/* Rating Column */}
                  <TableCell>
                    <StarRating rating={review.rating} size="sm" showNumber={false} />
                    <p className="text-xs text-zinc-500 mt-1">{review.rating}/5</p>
                  </TableCell>

                  {/* Review Column */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {review.title}
                      </p>
                      <p
                        className={cn(
                          "text-sm text-zinc-600 dark:text-zinc-400",
                          expandedReview !== review._id && "line-clamp-2"
                        )}
                      >
                        {review.comment}
                      </p>
                      {review.comment.length > 100 && (
                        <button
                          onClick={() =>
                            setExpandedReview(
                              expandedReview === review._id ? null : review._id
                            )
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          {expandedReview === review._id ? "Show less" : "Show more"}
                        </button>
                      )}
                    </div>
                  </TableCell>

                  {/* Verification Column */}
                  <TableCell>
                    {review.verifiedPurchase ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-500">
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status Column */}
                  {/* Date Column */}
                  <TableCell>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {format(new Date(review.createdAt), "h:mm a")}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile/Tablet Card View - Shown on smaller screens */}
      <div className="lg:hidden space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4"
          >
            {/* Header: Product & Status */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <Link
                href={`/admin/inventory/${review.product._id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
              >
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg overflow-hidden">
                  {review.product.images?.[0]?.asset?.url ? (
                    <Image
                      src={review.product.images[0].asset.url}
                      alt={review.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-400 text-xs">
                      N/A
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {review.product.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {review.product.slug}
                  </p>
                </div>
              </Link>
              <div className="flex-shrink-0">
                {getStatusBadge(review.status)}
              </div>
            </div>

            {/* Customer Info */}
            <Link
              href={`/admin/users/${review.customer._id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm">
                  {review.customer.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {review.customer.name || review.customerName}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {review.customer.email}
                </p>
              </div>
            </Link>

            {/* Rating & Verification */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" showNumber={false} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {review.rating}/5
                </span>
              </div>
              {review.verifiedPurchase ? (
                <Badge
                  variant="default"
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified Purchase
                </Badge>
              ) : (
                <Badge variant="outline" className="text-zinc-500">
                  Not Verified
                </Badge>
              )}
            </div>

            {/* Review Content */}
            <div className="space-y-2">
              <p className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                {review.title}
              </p>
              <p
                className={cn(
                  "text-sm text-zinc-600 dark:text-zinc-400",
                  expandedReview !== review._id && "line-clamp-3"
                )}
              >
                {review.comment}
              </p>
              {review.comment.length > 100 && (
                <button
                  onClick={() =>
                    setExpandedReview(
                      expandedReview === review._id ? null : review._id
                    )
                  }
                  className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                >
                  {expandedReview === review._id ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Clock className="h-3 w-3" />
              <span>
                {format(new Date(review.createdAt), "MMM d, yyyy")} at{" "}
                {format(new Date(review.createdAt), "h:mm a")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
