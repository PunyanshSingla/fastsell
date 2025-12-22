import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  title: string;
  slug: string;
  image?: {
    asset: {
      url: string;
    }
  };
}

const CategorySchema = new Schema<ICategory>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: {
      asset: {
        url: String,
      },
    },
  },
  { timestamps: true }
);

// Performance index for slug lookups
CategorySchema.index({ slug: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
