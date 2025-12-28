import { NextRequest, NextResponse } from "next/server";
import { getAllReviewsForAdmin } from "@/lib/db/reviews";

/**
 * GET /api/admin/reviews
 * Fetch all reviews for admin panel
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sort = searchParams.get("sort") || "newest";

    const result = await getAllReviewsForAdmin({
      page,
      limit,
      sort: sort as "newest" | "oldest" | "highest" | "lowest" | "helpful",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
