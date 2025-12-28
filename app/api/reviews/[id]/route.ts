import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getReviewById, updateReview, deleteReview } from "@/lib/db/reviews";
import { z } from "zod";

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(10).max(2000).optional(),
});

/**
 * GET /api/reviews/[id] - Get a single review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await getReviewById(id);

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch review" },
      { status: 404 }
    );
  }
}

/**
 * PATCH /api/reviews/[id] - Update a review
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = updateReviewSchema.parse(body);

    const review = await updateReview(id, userId, validatedData);

    return NextResponse.json({
      success: true,
      review,
      message: "Review updated successfully and is pending approval",
    });

  } catch (error: any) {
    console.error("Error updating review:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update review" },
      { status: error.message === "Unauthorized" ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id] - Delete a review
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteReview(id, userId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: error.message === "Unauthorized" ? 403 : 500 }
    );
  }
}
