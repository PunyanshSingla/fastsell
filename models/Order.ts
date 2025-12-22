import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  items: {
    product: mongoose.Types.ObjectId | any;
    quantity: number;
    priceAtPurchase: number;
  }[];
  total: number;
  status: string;
  customer?: mongoose.Types.ObjectId | any;
  clerkUserId?: string;
  email: string;
  address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  stripePaymentId?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, default: 1 },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, default: "paid" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    clerkUserId: { type: String },
    email: { type: String, required: true },
    address: {
      name: { type: String, required: false, default: "" },
      line1: { type: String, required: false, default: "" },
      line2: { type: String, required: false, default: "" },
      city: { type: String, required: false, default: "" },
      postcode: { type: String, required: false, default: "" },
      country: { type: String, required: false, default: "" },
    },
    stripePaymentId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
