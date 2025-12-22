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

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
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
  createdAt?: string;
  updatedAt?: string;
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
