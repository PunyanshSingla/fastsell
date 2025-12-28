"use server";

import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import mongoose from "mongoose";

export interface CreateReviewData {
  productId: string;
  clerkUserId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  status?: "pending" | "approved" | "rejected";
}

export interface ReviewFilters {
  productId?: string;
  customerId?: string;
  clerkUserId?: string;
  status?: "pending" | "approved" | "rejected";
  rating?: number;
  verifiedPurchase?: boolean;
}

export interface ReviewSortOptions {
  sort?: "newest" | "oldest" | "highest" | "lowest" | "helpful";
  page?: number;
  limit?: number;
}

/**
 * Check if a user has purchased a product (verified purchase)
 */
export async function checkVerifiedPurchase(
  clerkUserId: string,
  productId: string
): Promise<boolean> {
  try {
    await dbConnect();

    const order = await Order.findOne({
      clerkUserId,
      "items.product": new mongoose.Types.ObjectId(productId),
      status: { $in: ["paid", "processing", "shipped", "delivered"] },
    });

    return !!order;
  } catch (error) {
    console.error("Error checking verified purchase:", error);
    return false;
  }
}

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewData) {
  console.log(data);
  try {
    await dbConnect();

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      clerkUserId: data.clerkUserId,
      product: new mongoose.Types.ObjectId(data.productId),
    });

    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }

    // Check if verified purchase
    const isVerified = await checkVerifiedPurchase(
      data.clerkUserId,
      data.productId
    );
    console.log(isVerified);

    // Get or create customer
    let customer = await Customer.findOne({ clerkUserId: data.clerkUserId });
    console.log(customer);
    if (!customer) {
      throw new Error("Login to review the product");
    }

    const status = data.status || (isVerified ? "approved" : "pending");

    // Create review - auto-approve if verified purchase
    const review = await Review.create({
      product: new mongoose.Types.ObjectId(data.productId),
      customer: customer._id,
      clerkUserId: data.clerkUserId,
      customerName: data.customerName,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      verifiedPurchase: isVerified,
      status: status, // Use provided status or auto-approve verified purchases
    });
    console.log(review);
    // Increment customer review count
    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { reviewCount: 1 },
    });

    // Update product rating stats immediately for verified purchases or manually approved
    await updateProductRatingStats(data.productId);
    console.log(review);
    return JSON.parse(JSON.stringify(review));
  } catch (error: any) {
    console.error("Error creating review:", error);
    throw new Error(error.message || "Failed to create review");
  }
}

/**
 * Get reviews with filters and pagination
 */
export async function getReviews(
  filters: ReviewFilters = {},
  options: ReviewSortOptions = {}
) {
  try {
    await dbConnect();

    const {
      productId,
      customerId,
      clerkUserId,
      status,
      rating,
      verifiedPurchase,
    } = filters;
    const { sort = "newest", page = 1, limit = 10 } = options;

    // Build query
    const query: any = {};

    if (productId) {
      query.product = new mongoose.Types.ObjectId(productId);
    }
    if (customerId) {
      query.customer = new mongoose.Types.ObjectId(customerId);
    }
    if (clerkUserId) {
      query.clerkUserId = clerkUserId;
    }
    if (status) {
      query.status = status;
    }
    if (rating) {
      query.rating = rating;
    }
    if (verifiedPurchase !== undefined) {
      query.verifiedPurchase = verifiedPurchase;
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "highest":
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortQuery = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sortQuery = { helpfulCount: -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate("product", "name slug images")
        .lean(),
      Review.countDocuments(query),
    ]);

    return {
      reviews: JSON.parse(JSON.stringify(reviews)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error("Failed to fetch reviews");
  }
}

/**
 * Get a single review by ID
 */
export async function getReviewById(reviewId: string) {
  try {
    await dbConnect();

    const review = await Review.findById(reviewId)
      .populate("product", "name slug images price")
      .populate("customer", "name email")
      .lean();

    if (!review) {
      throw new Error("Review not found");
    }

    return JSON.parse(JSON.stringify(review));
  } catch (error) {
    console.error("Error fetching review:", error);
    throw new Error("Failed to fetch review");
  }
}

/**
 * Get all reviews for admin panel
 */
export async function getAllReviewsForAdmin(options: ReviewSortOptions = {}) {
  try {
    await dbConnect();

    const { sort = "newest", page = 1, limit = 50 } = options;

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "highest":
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortQuery = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sortQuery = { helpfulCount: -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({})
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate("product", "name slug images _id")
        .populate("customer", "name email clerkUserId")
        .lean(),
      Review.countDocuments({}),
    ]);

    return {
      reviews: JSON.parse(JSON.stringify(reviews)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    throw new Error("Failed to fetch admin reviews");
  }
}

/**
 * Update a review (user can edit their own review)
 */
export async function updateReview(
  reviewId: string,
  clerkUserId: string,
  data: { rating?: number; title?: string; comment?: string }
) {
  try {
    await dbConnect();

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.clerkUserId !== clerkUserId) {
      throw new Error("Unauthorized");
    }

    // Update fields
    if (data.rating !== undefined) review.rating = data.rating;
    if (data.title !== undefined) review.title = data.title;
    if (data.comment !== undefined) review.comment = data.comment;

    // Reset to pending if edited
    review.status = "pending";

    await review.save();

    // Recalculate product stats
    await updateProductRatingStats(review.product.toString());

    return JSON.parse(JSON.stringify(review));
  } catch (error: any) {
    console.error("Error updating review:", error);
    throw new Error(error.message || "Failed to update review");
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string, clerkUserId: string) {
  try {
    await dbConnect();

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.clerkUserId !== clerkUserId) {
      throw new Error("Unauthorized");
    }

    const productId = review.product.toString();
    const customerId = review.customer.toString();

    await Review.findByIdAndDelete(reviewId);

    // Decrement customer review count
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { reviewCount: -1 },
    });

    // Recalculate product stats
    await updateProductRatingStats(productId);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting review:", error);
    throw new Error(error.message || "Failed to delete review");
  }
}

/**
 * Moderate a review (admin only)
 */
export async function moderateReview(
  reviewId: string,
  status: "approved" | "rejected"
) {
  try {
    await dbConnect();

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    if (!review) {
      throw new Error("Review not found");
    }

    // Recalculate product stats
    await updateProductRatingStats(review.product.toString());

    return JSON.parse(JSON.stringify(review));
  } catch (error) {
    console.error("Error moderating review:", error);
    throw new Error("Failed to moderate review");
  }
}

/**
 * Vote on review helpfulness
 */
export async function voteReviewHelpful(
  reviewId: string,
  userId: string,
  helpful: boolean
) {
  try {
    await dbConnect();

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    // Check if user already voted
    const existingVoteIndex = review.helpfulVotes.findIndex(
      (vote: any) => vote.userId === userId
    );

    if (existingVoteIndex !== -1) {
      // Update existing vote
      const oldVote = review.helpfulVotes[existingVoteIndex].helpful;

      if (oldVote === helpful) {
        // Remove vote if clicking same button
        review.helpfulVotes.splice(existingVoteIndex, 1);
        if (helpful) {
          review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        } else {
          review.notHelpfulCount = Math.max(0, review.notHelpfulCount - 1);
        }
      } else {
        // Change vote
        review.helpfulVotes[existingVoteIndex].helpful = helpful;
        if (helpful) {
          review.helpfulCount += 1;
          review.notHelpfulCount = Math.max(0, review.notHelpfulCount - 1);
        } else {
          review.notHelpfulCount += 1;
          review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        }
      }
    } else {
      // Add new vote
      review.helpfulVotes.push({ userId, helpful });
      if (helpful) {
        review.helpfulCount += 1;
      } else {
        review.notHelpfulCount += 1;
      }
    }

    await review.save();

    return JSON.parse(JSON.stringify(review));
  } catch (error) {
    console.error("Error voting on review:", error);
    throw new Error("Failed to vote on review");
  }
}

/**
 * Update product rating statistics
 */
export async function updateProductRatingStats(productId: string) {
  console.log("Updating product rating stats for product:", productId);
  try {
    await dbConnect();

    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);
    console.log(stats, "stats");
    const averageRating = stats[0]?.averageRating || 0;
    const reviewCount = stats[0]?.reviewCount || 0;

    await Product.updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      {
        $set: {
          averageRating: Number(averageRating.toFixed(1)),
          reviewCount,
        },
      }
    );


    return { averageRating, reviewCount };
  } catch (error) {
    console.error("Error updating product rating stats:", error);
    throw new Error("Failed to update product stats");
  }
}

/**
 * Get review statistics for admin dashboard
 */
export async function getReviewStats() {
  try {
    await dbConnect();

    const [totalStats, recentReviews, topProducts] = await Promise.all([
      // Total stats by status
      Review.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Recent reviews
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("product", "name slug images")
        .lean(),

      // Top rated products
      Product.find({ reviewCount: { $gt: 0 } })
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(5)
        .select("name slug images averageRating reviewCount")
        .lean(),
    ]);

    const stats = {
      pending: totalStats.find((s) => s._id === "pending")?.count || 0,
      approved: totalStats.find((s) => s._id === "approved")?.count || 0,
      rejected: totalStats.find((s) => s._id === "rejected")?.count || 0,
      total:
        totalStats.reduce((sum, s) => sum + s.count, 0) || 0,
    };

    // Calculate platform average rating
    const avgRating = await Review.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    return {
      stats,
      platformAverageRating: avgRating[0]?.avg || 0,
      recentReviews: JSON.parse(JSON.stringify(recentReviews)),
      topProducts: JSON.parse(JSON.stringify(topProducts)),
    };
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw new Error("Failed to fetch review stats");
  }
}

/**
 * Get rating distribution for a product
 */
export async function getProductRatingDistribution(productId: string) {
  try {
    await dbConnect();

    const distribution = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    // Format as array [5, 4, 3, 2, 1]
    const result = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: distribution.find((d) => d._id === rating)?.count || 0,
    }));

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return result.map((r) => ({
      ...r,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  } catch (error) {
    console.error("Error fetching rating distribution:", error);
    throw new Error("Failed to fetch rating distribution");
  }
}
