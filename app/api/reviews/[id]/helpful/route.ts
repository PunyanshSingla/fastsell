import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { voteReviewHelpful } from "@/lib/db/reviews";

/**
 * POST /api/reviews/[id]/helpful - Vote on review helpfulness
 */
export async function POST(
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
    const { helpful } = body;

    if (typeof helpful !== "boolean") {
      return NextResponse.json(
        { error: "Invalid input: helpful must be a boolean" },
        { status: 400 }
      );
    }

    const review = await voteReviewHelpful(id, userId, helpful);

    return NextResponse.json({
      success: true,
      review,
      message: "Vote recorded successfully",
    });

  } catch (error: any) {
    console.error("Error voting on review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to vote on review" },
      { status: 500 }
    );
  }
}
