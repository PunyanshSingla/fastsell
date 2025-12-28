import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { moderateReview, deleteReview } from "@/lib/db/reviews";

/**
 * PATCH /api/admin/reviews/[id] - Moderate a single review
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
    const { status } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const review = await moderateReview(id, status);

    return NextResponse.json({
      success: true,
      review,
      message: `Review ${status} successfully`,
    });

  } catch (error: any) {
    console.error("Error moderating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to moderate review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id] - Delete a review (admin)
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
    
    // Admin can delete any review - pass a dummy clerkUserId
    // In production, you'd want to modify deleteReview to have an admin override
    await deleteReview(id, userId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
