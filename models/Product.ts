import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId | any;
  material?: string;
  color?: string;
  dimensions?: string;
  images: { 
    _key?: string;
    asset: { 
      url: string 
    } 
  }[];
  stock: number;
  featured: boolean;
  assemblyRequired: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    material: { type: String },
    color: { type: String },
    dimensions: { type: String },
    images: [{ 
      _key: String,
      asset: { 
        url: String 
      } 
    }],
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    assemblyRequired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Performance indexes for filtering and search
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ category: 1, name: 1 });
ProductSchema.index({ color: 1 });
ProductSchema.index({ material: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ featured: 1, stock: 1 }); 
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
