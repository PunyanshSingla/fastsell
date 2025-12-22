import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  email: string;
  name?: string;
  clerkUserId?: string;
  stripeCustomerId?: string;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    clerkUserId: { type: String },
    stripeCustomerId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
