import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category"; // Required for populate

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    // Ensure Category model is registered before populate
    void Category;
    const product = await Product.findById(id).populate("category").lean();
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    void Category;
    const body = await req.json();
    
    // Transform the data to match the Product model (similar to POST)
    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    // Handle slug transformation (could be string or object { current: string })
    if (body.slug) {
      updateData.slug = typeof body.slug === 'object' ? body.slug.current : body.slug;
    }

    // Explicitly handle discountPrice - set to null to remove it from DB when empty
    if (body.discountPrice !== undefined) {
      updateData.discountPrice = body.discountPrice === "" || body.discountPrice === null 
        ? null 
        : Number(body.discountPrice);
    }

    // Transform variants if present
    if (body.variants && Array.isArray(body.variants)) {
      updateData.variants = body.variants.map((v: any) => ({
        ...v,
        discountPrice: (v.discountPrice === "" || v.discountPrice === undefined || v.discountPrice === null) 
          ? null 
          : Number(v.discountPrice),
      }));
    }

    if(body.features) {
      updateData.features = body.features;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category");

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

