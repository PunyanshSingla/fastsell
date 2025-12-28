import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getReviewStats } from "@/lib/db/reviews";

/**
 * GET /api/admin/reviews/stats - Get review statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stats = await getReviewStats();

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error("Error fetching review stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch review stats" },
      { status: 500 }
    );
  }
}
