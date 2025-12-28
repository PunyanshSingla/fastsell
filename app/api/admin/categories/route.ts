
import { NextResponse } from "next/server";
import Category from "@/models/Category";
import Product from "@/models/Product"; // Import Product model for aggregation (if needed implicitly by mongoose)
import dbConnect from "@/lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          image: 1,
          productCount: { $size: "$products" },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { title, slug, image } = await req.json();

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and Slug are required" },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      title,
      slug,
      image,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
