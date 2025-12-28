import { getAllReviewsForAdmin } from "@/lib/db/reviews";
import { ReviewsTable } from "@/components/admin/ReviewsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle2, Clock, XCircle } from "lucide-react";

export default async function AdminReviewsPage() {
  const { reviews, pagination } = await getAllReviewsForAdmin({ limit: 100 });

  // Calculate stats
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter((r: any) => r.status === "approved").length;
  const pendingReviews = reviews.filter((r: any) => r.status === "pending").length;
  const verifiedReviews = reviews.filter((r: any) => r.verifiedPurchase).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Reviews Management
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          View and manage all customer reviews. Verified purchases are automatically approved.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-zinc-500 mt-1">All time</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Purchases</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedReviews}</div>
            <p className="text-xs text-zinc-500 mt-1">
              {totalReviews > 0 ? Math.round((verifiedReviews / totalReviews) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>
            Click on customer names to view user details or product names to view product details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          <ReviewsTable reviews={reviews} />
        </CardContent>
      </Card>
    </div>
  );
}
