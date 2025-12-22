import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/db/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get("q") ?? "";
    const categorySlug = searchParams.get("category") ?? "";
    const color = searchParams.get("color") ?? "";
    const material = searchParams.get("material") ?? "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 0;
    const sort = searchParams.get("sort") ?? "name";
    const inStock = searchParams.get("inStock") === "true";

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;

    const result = await searchProducts(q, {
      categorySlug,
      color,
      material,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page,
      limit,
    });

    // Return with cache headers for client-side caching
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
