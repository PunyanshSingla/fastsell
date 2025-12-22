import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category"; // Required for populate

// Helper to serialize MongoDB documents
function serialize(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Ensure Category model is registered before populate
    void Category;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "name";
    const order = searchParams.get("order") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (status === "low-stock") {
      query.stock = { $gt: 0, $lte: 5 };
    } else if (status === "out-of-stock") {
      query.stock = 0;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category")
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      products: serialize(products),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: total > skip + products.length,
      },
    });
  } catch (error: any) {
    console.error("Admin products GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Transform the data to match the Product model
    const productData: any = {
      name: body.name,
      // Handle slug as either string or object { current: string }
      slug: typeof body.slug === 'object' ? body.slug.current : body.slug,
      description: body.description || '',
      price: body.price || 0,
      stock: body.stock || 0,
      material: body.material,
      color: body.color,
      dimensions: body.dimensions,
      featured: body.featured || false,
      assemblyRequired: body.assemblyRequired || false,
      images: body.images || [],
    };

    // Only add category if provided
    if (body.category) {
      productData.category = body.category;
    }

    // Validate required fields
    if (!productData.name || !productData.slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const product = await Product.create(productData);

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
