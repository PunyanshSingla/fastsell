import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number; // Percentage (0-100) or amount
  minPurchaseAmount?: number;
  expirationDate: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true,
      trim: true 
    },
    type: { 
      type: String, 
      enum: ["PERCENTAGE", "FIXED"], 
      required: true 
    },
    value: { 
      type: Number, 
      required: true,
      min: 0 
    },
    minPurchaseAmount: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    expirationDate: { 
      type: Date, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    usageLimit: { 
      type: Number 
    },
    usedCount: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

// Index for faster lookups
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, expirationDate: 1 });

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
