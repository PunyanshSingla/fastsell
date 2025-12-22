import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) {
    console.error("No database connection");
    process.exit(1);
  }
  const orders = await db.collection("orders").find({}).toArray();
  console.log(`DATABASE_RESULT: FOUND ${orders.length} ORDERS`);
  orders.forEach(o => console.log(`- ${o.orderNumber}`));
  process.exit(0);
}

check();
