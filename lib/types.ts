export interface Category {
  _id: string;
  title: string;
  slug: string;
  image?: {
    asset: {
      url: string;
    };
  };
}

export interface Variant {
  _id?: string;
  size?: string;
  color?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  attributes?: { name: string; value: string }[];
  variantName?: string;
  image?: string;
}

export interface Product {
  attributes?: { name: string; value: string }[];
  _id: string;
  name: string;
  slug: string;
  description: string;
  features?: string[];
  price: number;
  discountPrice?: number;
  category: Category;
  material?: string;
  color?: string;
  dimensions?: string;
  images: {
    _key?: string;
    asset: {
      url: string;
    };
  }[];
  stock: number;
  featured: boolean;
  assemblyRequired: boolean;
  hasVariants?: boolean;
  variants?: Variant[];
  averageRating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  product: string | Product;
  customer: string;
  clerkUserId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  helpfulCount: number;
  notHelpfulCount: number;
  helpfulVotes?: { userId: string; helpful: boolean }[];
  createdAt: string;
  updatedAt: string;
}


export interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  email: string;
  customer?: any;
  address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  items: {
    product: Product;
    quantity: number;
    priceAtPurchase: number;
    _id: string;
  }[];
  clerkUserId: string;
  createdAt: string;
  updatedAt?: string;
  // Computed fields from DB functions
  itemCount?: number;
  itemNames?: string[];
  itemImages?: string[];
}
