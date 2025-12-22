import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category";
import Product from "../models/Product";
import Customer from "../models/Customer";
import Order from "../models/Order";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});

    const data = fs.readFileSync("sample-data.ndjson", "utf-8")
      .split("\n")
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    const categoryMap = new Map();

    // 1. Seed Categories
    const categoriesData = data.filter(item => item._type === "category");
    for (const cat of categoriesData) {
      const imageUrl = cat.image?._sanityAsset?.split("@")[1] || "";
      const newCat = await Category.create({
        title: cat.title,
        slug: cat.slug.current,
        image: imageUrl ? { asset: { url: imageUrl } } : undefined
      });
      categoryMap.set(cat._id, newCat._id);
      console.log(`Created category: ${newCat.title}`);
    }

    // 2. Seed Products
    const productsData = data.filter(item => item._type === "product");
    const productMap = new Map();
    for (const prod of productsData) {
      const newProd = await Product.create({
        name: prod.name,
        slug: prod.slug.current,
        description: prod.description,
        price: prod.price,
        category: categoryMap.get(prod.category._ref),
        material: prod.material,
        color: prod.color,
        dimensions: prod.dimensions,
        stock: prod.stock,
        featured: prod.featured || false,
        assemblyRequired: prod.assemblyRequired || false,
        images: prod.images?.map((img: any, idx: number) => ({
          _key: img._key || `img_${idx}`,
          asset: {
            url: img._sanityAsset?.split("@")[1] || ""
          }
        })) || []
      });
      productMap.set(prod._id, newProd._id);
      console.log(`Created product: ${newProd.name}`);
    }

    // 3. Seed Customers
    const customersData = data.filter(item => item._type === "customer");
    const customerMap = new Map();
    for (const cust of customersData) {
      const newCust = await Customer.create({
        email: cust.email,
        name: cust.name,
        createdAt: cust.createdAt
      });
      customerMap.set(cust._id, newCust._id);
      console.log(`Created customer: ${newCust.email}`);
    }

    // 4. Seed Orders
    const ordersData = data.filter(item => item._type === "order");
    for (const order of ordersData) {
      await Order.create({
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        email: order.email,
        customer: customerMap.get(order.customer?._ref),
        address: {
          name: order.address.name,
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          postcode: order.address.postcode,
          country: order.address.country
        },
        items: order.items.map((item: any) => ({
          product: productMap.get(item.product._ref),
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase
        })),
        createdAt: order.createdAt
      });
      console.log(`Created order: ${order.orderNumber}`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
