import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  clerkUserId: string;
  customerName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  helpfulCount: number;
  notHelpfulCount: number;
  helpfulVotes: {
    userId: string;
    helpful: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulVotes: [
      {
        userId: { type: String, required: true },
        helpful: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
ReviewSchema.index({ product: 1, status: 1, createdAt: -1 }); // Fetch approved reviews for a product
ReviewSchema.index({ customer: 1, product: 1 }, { unique: true }); // Prevent duplicate reviews
ReviewSchema.index({ status: 1, createdAt: -1 }); // Admin moderation queue
ReviewSchema.index({ rating: 1, createdAt: -1 }); // Filter by rating
ReviewSchema.index({ verifiedPurchase: 1, status: 1 }); // Filter verified purchases
ReviewSchema.index({ helpfulCount: -1 }); // Sort by most helpful

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);
