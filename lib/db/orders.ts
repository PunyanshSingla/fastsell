import dbConnect from "../mongodb";
import Order from "../../models/Order";
import Product from "../../models/Product";
import { serialize } from "./utils";

export async function getOrderById(id: string) {
  await dbConnect();
  const order = await Order.findById(id).populate("items.product").populate("customer").lean();
  if (!order) return null;

  // Ensure items have the correct structure for the UI
  // The UI expects item.product.image.asset.url
  // Our model has item.product.images[0].asset.url
  const formattedOrder = {
    ...order,
    items: order.items.map((item: any) => ({
      ...item,
      product: {
        ...item.product,
        image: item.product?.images?.[0]
      }
    }))
  };

  return serialize(formattedOrder);
}

export async function getOrdersByCustomer(clerkUserId: string) {
  await dbConnect();
  const orders = await Order.find({ clerkUserId })
    .sort({ createdAt: -1 })
    .populate("items.product")
    .lean();

  const formattedOrders = orders.map((order: any) => ({
    ...order,
    itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    itemNames: order.items.map((item: any) => item.product?.name),
    itemImages: order.items.map((item: any) => item.product?.images?.[0]?.asset?.url)
  }));

  return serialize(formattedOrders);
}

export async function getAllOrders() {
  await dbConnect();
  const orders = await Order.find().sort({ createdAt: -1 }).populate("customer").lean();
  return serialize(orders);
}

export async function createOrder(orderData: any) {
  try {
    await dbConnect();
    const order = await Order.create(orderData);
    const plainObject = Array.isArray(order) ? (order[0] as any).toObject() : (order as any).toObject();
    return serialize(plainObject);
  } catch (error: any) {
    console.error("❌ createOrder failed:", error.message);
    throw error;
  }
}
