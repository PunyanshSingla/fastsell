import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, error: "Invalid product IDs" },
        { status: 400 }
      );
    }

    await dbConnect();

    const products = await Product.find({
      _id: { $in: ids },
    }).lean();

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("Batch products fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
