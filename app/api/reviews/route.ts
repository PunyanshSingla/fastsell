import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createReview, getReviews } from "@/lib/db/reviews";
import { z } from "zod";

// Validation schema
const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "Title is required").max(100),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(2000),
});

/**
 * POST /api/reviews - Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = createReviewSchema.parse(body);

    // Get customer name from Clerk - fetch user details
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const customerName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username || "Anonymous User";

    // Check if user is admin
    const Product = (await import("@/models/Product")).default;
    const product = await Product.findById(validatedData.productId).select('slug');
    console.log(product);
    const review = await createReview({
      ...validatedData,
      clerkUserId: userId,
      customerName,
    });
    console.log(review);
    // Revalidate product page if review is approved (immediate update)
    if (review.status === "approved" && product) {
      // Revalidate the product page
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/products/${product.slug}`);
    }

    return NextResponse.json({
      success: true,
      review,
      message: "Review submitted successfully",
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating review:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews - Get reviews with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: any = {};
    const productId = searchParams.get("productId");
    const customerId = searchParams.get("customerId");
    const clerkUserId = searchParams.get("clerkUserId");
    const status = searchParams.get("status");
    const rating = searchParams.get("rating");
    const verifiedPurchase = searchParams.get("verifiedPurchase");

    if (productId) filters.productId = productId;
    if (customerId) filters.customerId = customerId;
    if (clerkUserId) filters.clerkUserId = clerkUserId;
    if (rating) filters.rating = parseInt(rating);
    if (verifiedPurchase) filters.verifiedPurchase = verifiedPurchase === "true";

    // Only show approved reviews to public, unless admin
    const { userId } = await auth();
    if (!status && !userId) {
      filters.status = "approved";
    } else if (status) {
      filters.status = status as "pending" | "approved" | "rejected";
    }

    // Parse options
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await getReviews(filters, { sort: sort as any, page, limit });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
