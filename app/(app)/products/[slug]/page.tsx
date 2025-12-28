import { getProductBySlug } from "@/lib/db/products";
import { getProductRatingDistribution } from "@/lib/db/reviews";
import { ProductGallery } from "@/components/app/ProductGallery";
import { ProductInfo } from "@/components/app/ProductInfo";
import { ReviewSummary } from "@/components/app/ReviewSummary";
import { ReviewForm } from "@/components/app/ReviewForm";
import { ReviewList } from "@/components/app/ReviewList";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { cn } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;

}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { userId } = await auth();

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch rating distribution for review summary
  const ratingDistribution = await getProductRatingDistribution(product._id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8">
        {/* Product Section */}
        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* Image Gallery */}
          <div className="space-y-8">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <ProductInfo product={product} />
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-12">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Customer Reviews
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {product.reviewCount > 0
                  ? `See what our customers are saying about ${product.name}`
                  : (
                    userId ?
                      `Be the first to review ${product.name}` :
                      `Login to review this product`
                  )
                }
              </p>
            </div>
            {/* Review Summary */}
            {product.reviewCount > 0 && (
              <div className="mb-10">
                <ReviewSummary
                  averageRating={product.averageRating}
                  reviewCount={product.reviewCount}
                  ratingDistribution={ratingDistribution}
                />
              </div>
            )}

            {/* Two Column Layout on Desktop */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Review Form - Left Column on Desktop */}
              {userId && (
                <div className="lg:col-span-1">
                  <div className="sticky top-4">
                    <ReviewForm
                      productId={product._id}
                      productName={product.name}
                    />
                  </div>
                </div>
              )}

              {/* Review List - Right Column on Desktop */}
              <div className={cn(
                userId ? "lg:col-span-2" : "lg:col-span-3"
              )}>
                <ReviewList
                  productId={product._id}
                  currentUserId={userId || undefined}
                  key={product._id} // Force re-render when product changes
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
