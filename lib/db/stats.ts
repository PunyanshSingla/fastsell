import dbConnect from "../mongodb";
import Order from "../../models/Order";
import Product from "../../models/Product";
import Customer from "../../models/Customer";
import { serialize } from "./utils";

export async function getAdminInsights() {
  await dbConnect();

  const [totalOrders, totalProducts, totalCustomers, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    Customer.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("customer").lean()
  ]);

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 7 }
  ]);

  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$total" } } }
  ]);

  return serialize({
    totalRevenue: totalRevenue[0]?.total || 0,
    orderCount: totalOrders,
    productCount: totalProducts,
    customerCount: totalCustomers,
    recentOrders,
    salesData: salesData.map((d: any) => ({ date: d._id, revenue: d.revenue }))
  });
}
