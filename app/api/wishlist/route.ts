import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Customer from "@/models/Customer";
import  Product  from "@/models/Product"; // Ensure Product model is registered
import dbConnect from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const customer = await Customer.findOne({ clerkUserId: userId }).populate({
      path: "wishlist",
      model: "Product", // Explicitly specify model if needed, but ref should handle it
    });

    if (!customer) {
      return NextResponse.json({ wishlist: [] });
    }

    return NextResponse.json({ wishlist: customer.wishlist || [] });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await dbConnect();

    // Use findOneAndUpdate with upsert to create customer if it doesn't exist (though it should usually exist)
    // $addToSet prevents duplicates
    const customer = await Customer.findOneAndUpdate(
      { clerkUserId: userId },
      { $addToSet: { wishlist: productId } },
      { new: true, upsert: true } // Upsert might not be strictly necessary if we ensure customer creation elsewhere, but good for safety
    ).populate("wishlist");

    return NextResponse.json({ wishlist: customer.wishlist });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await dbConnect();

    const customer = await Customer.findOneAndUpdate(
      { clerkUserId: userId },
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate("wishlist");

    if (!customer) {
       return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ wishlist: customer.wishlist });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
