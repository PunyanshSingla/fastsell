
import { createReview } from "@/lib/db/reviews";
import Product from "@/models/Product";
import Review from "@/models/Review";
import dbConnect from "@/lib/mongodb";

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

  const initialCount = product.reviewCount || 0;

  // 2. Create a review with explicit APPROVED status (simulating Admin or Verified Purchase logic update)
  console.log("Creating review with status: 'approved'...");
  const review = await createReview({
    productId: product._id.toString(),
    clerkUserId: "msg_user_" + Date.now(),
    customerName: "Verification User",
    rating: 4,
    title: "Verification Review",
    comment: "Review to verify stats update.",
    status: "approved" // This is the new field we added
  });
  
  console.log("Review created:", review._id, "Status:", review.status);

  // 3. Fetch product again to see immediate update
  const updatedProduct = await Product.findById(product._id);
  console.log(`Updated Product: Rating: ${updatedProduct.averageRating}, Count: ${updatedProduct.reviewCount}`);

  if (updatedProduct.reviewCount === initialCount + 1) {
      console.log("SUCCESS: Review count incremented!");
  } else {
      console.error("FAILURE: Review count did not increment.");
  }

  // Cleanup
  await Review.findByIdAndDelete(review._id);
  
  // Re-calculate stats to restore original state
  const { updateProductRatingStats } = await import("@/lib/db/reviews");
  await updateProductRatingStats(product._id.toString());
  
  console.log("Cleanup done");
}

main().catch(console.error).finally(() => process.exit());
