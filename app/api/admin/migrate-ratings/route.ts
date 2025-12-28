import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Review from "@/models/Review";

/**
 * Migration API Route: Add averageRating and reviewCount to existing products
 * 
 * Call this endpoint once to populate rating fields for all products
 * GET /api/admin/migrate-ratings
 */
export async function GET() {
  try {
    await dbConnect();

    // Step 1: Add default rating fields to all products
    const updateResult = await Product.updateMany(
      {
        $or: [
          { averageRating: { $exists: false } },
          { reviewCount: { $exists: false } }
        ]
      },
      {
        $set: {
          averageRating: 0,
          reviewCount: 0
        }
      }
    );

    // Step 2: Recalculate ratings for products with approved reviews
    const productsWithReviews = await Review.aggregate([
      {
        $match: { status: "approved" }
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    // Update each product with calculated ratings
    let updatedCount = 0;
    for (const productStats of productsWithReviews) {
      await Product.findByIdAndUpdate(productStats._id, {
        averageRating: Math.round(productStats.averageRating * 10) / 10,
        reviewCount: productStats.reviewCount
      });
      updatedCount++;
    }

    // Get summary
    const totalProducts = await Product.countDocuments();
    const productsWithRatings = await Product.countDocuments({ reviewCount: { $gt: 0 } });

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      stats: {
        totalProducts,
        productsUpdatedWithDefaults: updateResult.modifiedCount,
        productsWithCalculatedRatings: updatedCount,
        productsWithRatings,
        productsWithoutRatings: totalProducts - productsWithRatings
      }
    });

  } catch (error: any) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Migration failed" 
      },
      { status: 500 }
    );
  }
}
