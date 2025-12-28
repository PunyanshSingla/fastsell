
import { createReview, updateProductRatingStats } from "@/lib/db/reviews";
import Product from "@/models/Product";
import Review from "@/models/Review";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

async function main() {
  await dbConnect();
  console.log("Connected to DB");

  // 1. Find a product
  const product = await Product.findOne({});
  if (!product) {
    console.log("No product found");
    return;
  }
  console.log(`Product found: ${product.name} (${product._id}) - Rating: ${product.averageRating}, Count: ${product.reviewCount}`);

  // 2. Create a dummy review (approved) to see if stats update
  const reviewData = {
    productId: product._id.toString(),
    clerkUserId: "test_user_" + Date.now(),
    customerName: "Test User",
    rating: 5,
    title: "Test Review",
    comment: "This is a test review for debugging stats updates.",
  };

  // Temporarily force approved status by manually creating review instead of using createReview which might set it to pending
  // But let's verify createReview behavior first.
  
  // We'll mimic createReview's verified match logic by ensuring we pass a verified purchase true if we went down that path
  // taking a shortcut: Create raw review with approved status
  
  const review = await Review.create({
    product: product._id,
    customer: new mongoose.Types.ObjectId("000000000000000000000000"), // Dummy customer ID if needed, or create one
    clerkUserId: reviewData.clerkUserId,
    customerName: reviewData.customerName,
    rating: reviewData.rating,
    title: reviewData.title,
    comment: reviewData.comment,
    verifiedPurchase: true,
    status: "approved",
  });
  
  console.log("Review created manually with status 'approved':", review._id);

  // 3. Run update logic
  console.log("Running updateProductRatingStats...");
  const stats = await updateProductRatingStats(product._id.toString());
  console.log("Stats returned:", stats);

  // 4. Fetch product again
  const updatedProduct = await Product.findById(product._id);
  console.log(`Updated Product: Rating: ${updatedProduct.averageRating}, Count: ${updatedProduct.reviewCount}`);

  // Cleanup
  await Review.findByIdAndDelete(review._id);
  await updateProductRatingStats(product._id.toString()); // Revert stats
  console.log("Cleanup done");
}

main().catch(console.error).finally(() => process.exit());
