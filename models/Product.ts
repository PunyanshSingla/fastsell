import mongoose, { Schema, Document } from "mongoose";

export interface IVariant {
  _id?: string;
  size?: string;
  color?: string;
  sku: string;
  price: number;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  features?: string[];
  price: number;
  discountPrice?: number;
  category: mongoose.Types.ObjectId | any;
  attributes: { name: string; value: string }[]; // Dynamic attributes
  images: { 
    _key?: string;
    asset: { 
      url: string 
    } 
  }[];
  stock: number;
  featured: boolean;
  assemblyRequired: boolean;
  hasVariants: boolean;
  averageRating: number;
  reviewCount: number;
  variants: {
    _id?: string;
    variantName: string; // e.g., "Blue / XL" or "16GB / 1TB"
    attributes: { name: string; value: string }[]; // Specific attributes for this variant
    sku: string;
    price: number;
    discountPrice?: number;
    stock: number;
    image?: string;
  }[];
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    
    // Dynamic Product Attributes (e.g. Dimensions, Material, Brand, etc.)
    attributes: [{
      name: { type: String, required: true },
      value: { type: String, required: true }
    }],

    images: [{ 
      _key: String,
      asset: { 
        url: String 
      } 
    }],
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    assemblyRequired: { type: Boolean, default: false },
    hasVariants: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    
    // Product Features (Bullet points)
    features: [{ type: String }],
    
    // Flexible Variants
    variants: [
      {
        variantName: String,
        attributes: [{
          name: { type: String, required: true },
          value: { type: String, required: true }
        }],
        sku: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        stock: { type: Number, default: 0 },
        image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Performance indexes for filtering and search
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ category: 1, name: 1 });
ProductSchema.index({ "attributes.value": 1 }); // Index on dynamic attributes
ProductSchema.index({ stock: 1 });
ProductSchema.index({ featured: 1, stock: 1 }); 
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ averageRating: -1, reviewCount: -1 }); // Sort by rating/popularity
ProductSchema.index({ category: 1, averageRating: -1 }); // Category + rating filter

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
