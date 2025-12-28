import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();
    // Calculate date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Recent Orders (last 7 days)
    const recentOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).populate("items.product").lean();

    // 2. Status Distribution
    const statusDistributionRaw = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusDistribution = {
      paid: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    statusDistributionRaw.forEach(item => {
      if (item._id in statusDistribution) {
        (statusDistribution as any)[item._id] = item.count;
      }
    });

    // 3. Top Selling Products
    const productSales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] } }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]);
    // 4. Products Inventory (for restock and slow moving)
    const productsInventory = await Product.find().populate("category").lean();

    // 5. Unfulfilled Orders
    const unfulfilledOrders = await Order.find({
      status: { $in: ["paid", "shipped"] }
    }).sort({ createdAt: 1 }).lean();

    // 6. Revenue for current vs previous period
    const revenueCurrentRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
    ]);
    const revenuePreviousRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
    ]);

    const currentRevenue = revenueCurrentRaw[0]?.total || 0;
    const previousRevenue = revenuePreviousRaw[0]?.total || 0;
    const currentOrderCount = revenueCurrentRaw[0]?.count || 0;

    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    const avgOrderValue =
      recentOrders.length > 0
        ? recentOrders.reduce((sum, o: any) => sum + (o.total || 0), 0) /
          recentOrders.length
        : 0;


    return Response.json({
      success: true,
      insights: {
        inventory: {
          needsRestock: productsInventory
            .filter(p => p.stock <= 5)
            .slice(0, 5)
            .map(p => ({
              _id: p._id,
              name: p.name,
              stock: p.stock,
              images: p.images,
              category: p.category,
            }))
        },
      },
      rawMetrics: {
        totalProductsCount: productsInventory.length,
        orderCount: currentOrderCount,
        lowStockCount: productsInventory.filter((p) => p.stock <= 5).length,
        recentOrders: recentOrders.slice(0, 5).map(o => ({
          _id: o._id,
          orderNumber: (o as any).orderNumber,
          customer: (o as any).customer,
          email: o.email,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
        })),
        currentRevenue,
        previousRevenue,
        revenueChange: revenueChange.toFixed(1),
        avgOrderValue: avgOrderValue.toFixed(2),
        unfulfilledCount: unfulfilledOrders.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch insights:", error);
    return Response.json(
      { success: false, error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
