import dbConnect from "../mongodb";
import Category from "../../models/Category";
import { serialize } from "./utils";
import { cache, CACHE_KEYS } from "../cache";

import { Category as CategoryType } from "../types";

export async function getAllCategories(): Promise<CategoryType[]> {
  // Check cache first
  const cached = cache.get<CategoryType[]>(CACHE_KEYS.CATEGORIES);
  if (cached) return cached;

  await dbConnect();
  const categories = await Category.find().sort({ title: 1 }).lean();
  const result = serialize(categories) as CategoryType[];
  
  // Cache for 5 minutes
  cache.set(CACHE_KEYS.CATEGORIES, result);
  return result;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryType | null> {
  // Check cache first
  const cacheKey = CACHE_KEYS.CATEGORY_BY_SLUG(slug);
  const cached = cache.get<CategoryType>(cacheKey);
  if (cached) return cached;

  await dbConnect();
  const category = await Category.findOne({ slug }).lean();
  const result = serialize(category) as CategoryType;
  
  // Cache for 5 minutes
  cache.set(cacheKey, result);
  return result;
}

