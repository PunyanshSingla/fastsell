/**
 * Migration Script: Add averageRating and reviewCount to existing products
 * 
 * This script:
 * 1. Updates all products to have averageRating: 0 and reviewCount: 0 if they don't have these fields
 * 2. Recalculates ratings for products that have approved reviews
 * 
 * Run with: npx tsx scripts/migrate-product-ratings.ts
 */

import dbConnect from "../lib/mongodb";
import Product from "../models/Product";
import Review from "../models/Review";
import mongoose from "mongoose";

async function migrateProductRatings() {
  try {
    console.log("🔄 Connecting to database...");
    await dbConnect();

    console.log("📊 Step 1: Adding default rating fields to all products...");
    
    // Update all products that don't have averageRating or reviewCount
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

    console.log(`✅ Updated ${updateResult.modifiedCount} products with default rating fields`);

    console.log("\n📊 Step 2: Recalculating ratings for products with reviews...");
    
    // Get all products that have approved reviews
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

    console.log(`📈 Found ${productsWithReviews.length} products with approved reviews`);

    // Update each product with calculated ratings
    let updatedCount = 0;
    for (const productStats of productsWithReviews) {
      await Product.findByIdAndUpdate(productStats._id, {
        averageRating: Math.round(productStats.averageRating * 10) / 10,
        reviewCount: productStats.reviewCount
      });
      updatedCount++;
    }

    console.log(`✅ Updated ${updatedCount} products with calculated ratings`);

    // Show summary
    console.log("\n📋 Summary:");
    const totalProducts = await Product.countDocuments();
    const productsWithRatings = await Product.countDocuments({ reviewCount: { $gt: 0 } });
    const productsWithoutRatings = totalProducts - productsWithRatings;

    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Products with ratings: ${productsWithRatings}`);
    console.log(`   Products without ratings: ${productsWithoutRatings}`);

    console.log("\n✨ Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the migration
migrateProductRatings()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
