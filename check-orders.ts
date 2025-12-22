import dbConnect from "./lib/mongodb";
import Order from "./models/Order";
import Product from "./models/Product";
import Customer from "./models/Customer";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkOrders() {
  await dbConnect();
  const orders = await Order.find().populate("customer").populate("items.product");
  console.log(`Found ${orders.length} orders in database:`);
  orders.forEach((o: any) => {
    console.log(`- Order ${o.orderNumber}: ${o.email}, Total: ₹${o.total}, Items: ${o.items.length}`);
  });
  process.exit(0);
}

checkOrders();
