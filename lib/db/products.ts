import dbConnect from "../mongodb";
import Product from "../../models/Product";
import Category from "../../models/Category";
import { serialize } from "./utils";

import { Product as ProductType } from "../types";

export async function getAllProducts(): Promise<ProductType[]> {
  await dbConnect();
  const products = await Product.find().populate("category").sort({ name: 1 }).lean();
  return serialize(products) as ProductType[];
}

export async function getFeaturedProducts(): Promise<ProductType[]> {
  await dbConnect();
  const products = await Product.find({ featured: true, stock: { $gt: 0 } })
    .select('name slug price stock images category color material featured')
    .populate("category", "title slug")
    .sort({ name: 1 })
    .limit(6)
    .lean();
  return serialize(products) as ProductType[];
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductType[]> {
  await dbConnect();
  const category = await Category.findOne({ slug: categorySlug }).lean();
  if (!category) return [];
  const products = await Product.find({ category: category._id })
    .select('name slug price stock images category color material featured')
    .sort({ name: 1 })
    .lean();
  return serialize(products) as ProductType[];
}

export async function getProductBySlug(slug: string): Promise<ProductType | null> {
  await dbConnect();
  const product = await Product.findOne({ slug }).populate("category").lean();
  return serialize(product) as ProductType;
}

export async function getProductsByIds(ids: string[]): Promise<ProductType[]> {
  await dbConnect();
  const products = await Product.find({ _id: { $in: ids } }).lean();
  return serialize(products) as ProductType[];
}

export async function searchProducts(searchQuery: string, filters: any = {}): Promise<{
  products: ProductType[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}> {
  await dbConnect();
  const { 
    categorySlug, 
    color, 
    material, 
    minPrice, 
    maxPrice, 
    inStock, 
    sort,
    page = 1,
    limit = 12
  } = filters;

  const query: any = {};

  if (searchQuery) {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length >= 3) {
      query.$text = { $search: trimmedQuery };
    } else {
      query.name = { $regex: trimmedQuery, $options: "i" };
    }
  }

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).lean();
    if (category) query.category = category._id;
  }

  if (color) query.color = color;
  if (material) query.material = material;
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  if (inStock) {
    query.stock = { $gt: 0 };
  }

  let sortOption: any = { name: 1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Execute search with pagination
  const [products, total] = await Promise.all([
    Product.find(query)
      .select('name slug price stock images category color material featured')
      .populate("category", "title slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);
    
  return {
    products: serialize(products) as ProductType[],
    total,
    page: Number(page),
    limit: Number(limit),
    hasMore: total > skip + products.length
  };
}

export async function getLowStockProducts(threshold: number = 10): Promise<ProductType[]> {
  await dbConnect();
  const products = await Product.find({ stock: { $gt: 0, $lte: threshold } })
    .sort({ stock: 1 })
    .lean();
  return serialize(products) as ProductType[];
}

export async function getOutOfStockProducts(): Promise<ProductType[]> {
  await dbConnect();
  const products = await Product.find({ stock: 0 }).sort({ name: 1 }).lean();
  return serialize(products) as ProductType[];
}
