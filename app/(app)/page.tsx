import { getCachedFeaturedProducts, getCachedAllProducts, getCachedCategories, getCachedSearchProducts } from "@/lib/db/products";
import { ProductSection } from "@/components/app/ProductSection";
import { CategoryTiles } from "@/components/app/CategoryTiles";
import { FeaturedCarousel } from "@/components/app/FeaturedCarousel";
import { FeaturedCarouselSkeleton } from "@/components/app/FeaturedCarouselSkeleton";
import { ProductBrowsingLayout } from "@/components/app/ProductBrowsingLayout";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    color?: string;
    material?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const searchQuery = params.q ?? "";
  const categorySlug = params.category ?? "";
  const color = params.color ?? "";
  const material = params.material ?? "";
  const minPrice = Number(params.minPrice) || 0;
  const maxPrice = Number(params.maxPrice) || 0;
  const sort = params.sort ?? "name";
  const inStock = params.inStock === "true";

  // Fetch products with filters (server-side via MongoDB)
  const result = await getCachedSearchProducts(searchQuery, {
    categorySlug,
    color,
    material,
    minPrice,
    maxPrice,
    inStock,
    sort,
    page: 1,
    limit: 12,
  });

  const products = result.products;

  // Fetch categories for filter sidebar
  const categories = await getCachedCategories();

  // Fetch featured products for carousel
  const featuredProducts = await getCachedFeaturedProducts();

  return (
    <ProductBrowsingLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        {/* Featured Products Carousel */}
        {featuredProducts.length > 0 && (
          <Suspense fallback={<FeaturedCarouselSkeleton />}>
            <FeaturedCarousel products={featuredProducts} />
          </Suspense>
        )}

        {/* Page Banner */}
        <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Shop {categorySlug ? categorySlug : "All Products"}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Premium furniture for your home
            </p>
          </div>

          {/* Category Tiles - Full width */}
          <div className="mt-6">
            <CategoryTiles
              categories={categories}
              activeCategory={categorySlug || undefined}
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProductSection
            categories={categories}
            initialData={result}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </ProductBrowsingLayout>
  );
}
