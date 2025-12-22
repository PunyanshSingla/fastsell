import { generateText } from "ai";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { google } from "@ai-sdk/google";

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

    // Populate product names for top products
    const topProducts = await Promise.all(productSales.map(async (sale) => {
      const product = await Product.findById(sale._id).select("name");
      return {
        id: sale._id,
        name: product?.name || "Unknown",
        totalQuantity: sale.quantity,
        revenue: sale.revenue
      };
    }));

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
    const previousOrderCount = revenuePreviousRaw[0]?.count || 0;

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

    // Helper to calculate days since order
    const getDaysSinceOrder = (createdAt: Date) => {
      const diffTime = now.getTime() - createdAt.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    // Prepare data summary for AI
    const dataSummary = {
      salesTrends: {
        currentWeekRevenue: currentRevenue,
        previousWeekRevenue: previousRevenue,
        revenueChangePercent: revenueChange.toFixed(1),
        currentWeekOrders: currentOrderCount,
        previousWeekOrders: previousOrderCount,
        avgOrderValue: avgOrderValue.toFixed(2),
        topProducts: topProducts.slice(0, 5).map((p) => ({
          name: p.name,
          unitsSold: p.totalQuantity,
          revenue: p.revenue.toFixed(2),
        })),
      },
      inventory: {
        needsRestock: productsInventory
          .filter(p => p.stock <= 5)
          .slice(0, 5)
          .map((p) => ({
            name: p.name,
            stock: p.stock,
            category: (p.category as any)?.title || "Unknown",
          })),
        slowMoving: productsInventory
          .filter(p => p.stock > 10) // Simplified logic
          .slice(0, 5)
          .map((p) => ({
            name: p.name,
            stock: p.stock,
            category: (p.category as any)?.title || "Unknown",
          })),
        totalProducts: productsInventory.length,
        lowStockCount: productsInventory.filter((p) => p.stock <= 5).length,
      },
      operations: {
        statusDistribution,
        unfulfilledOrders: unfulfilledOrders.slice(0, 5).map((o: any) => ({
          orderNumber: o.orderNumber,
          total: o.total,
          daysSinceOrder: getDaysSinceOrder(new Date(o.createdAt)),
          itemCount: o.items.length,
        })),
        urgentOrders: unfulfilledOrders.filter(
          (o: any) => getDaysSinceOrder(new Date(o.createdAt)) > 2
        ).length,
      },
    };

    // Generate AI insights
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `You are an expert e-commerce analytics assistant. Analyze the provided store data and generate actionable insights for the store admin.

Your response must be valid JSON with this exact structure:
{
  "salesTrends": {
    "summary": "2-3 sentence summary of sales performance",
    "highlights": ["highlight 1", "highlight 2", "highlight 3"],
    "trend": "up" | "down" | "stable"
  },
  "inventory": {
    "summary": "2-3 sentence summary of inventory status",
    "alerts": ["alert 1", "alert 2"],
    "recommendations": ["recommendation 1", "recommendation 2"]
  },
  "actionItems": {
    "urgent": ["urgent action 1", "urgent action 2"],
    "recommended": ["recommended action 1", "recommended action 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  }
}

Guidelines:
- Be specific with numbers and product names
- Prioritize actionable insights
- Keep highlights, alerts, and recommendations concise (under 100 characters each)
- Focus on what the admin can do TODAY
- Use ₹ for currency`,
      prompt: `Analyze this e-commerce store data and provide insights:

${JSON.stringify(dataSummary, null, 2)}

Generate insights in the required JSON format.`,
    });

    // Parse AI response
    let insights: any;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      // Fallback insights if parsing fails
      insights = {
        salesTrends: {
          summary: `Revenue this week: ₹${currentRevenue.toFixed(2)} (${revenueChange > 0 ? "+" : ""}${revenueChange.toFixed(1)}% vs last week)`,
          highlights: [
            `${currentOrderCount} orders this week`,
            `Average order value: ₹${avgOrderValue.toFixed(2)}`,
            topProducts[0]
              ? `Top seller: ${topProducts[0].name}`
              : "No sales data yet",
          ],
          trend:
            revenueChange > 5 ? "up" : revenueChange < -5 ? "down" : "stable",
        },
        inventory: {
          summary: `${dataSummary.inventory.needsRestock.length} products need restocking. ${dataSummary.inventory.slowMoving.length} products have no recent sales.`,
          alerts: dataSummary.inventory.needsRestock
            .slice(0, 2)
            .map((p) => `${p.name} has only ${p.stock} left`),
          recommendations: [
            "Review low stock items before the weekend",
            "Consider promotions for slow-moving inventory",
          ],
        },
        actionItems: {
          urgent:
            unfulfilledOrders.length > 0
              ? [`Ship ${unfulfilledOrders.length} pending orders`]
              : ["All orders fulfilled!"],
          recommended: ["Review inventory levels", "Check product listings"],
          opportunities: ["Featured products drive more sales"],
        },
      };
    }

    return Response.json({
      success: true,
      insights,
      rawMetrics: {
        currentRevenue,
        previousRevenue,
        revenueChange: revenueChange.toFixed(1),
        orderCount: currentOrderCount,
        avgOrderValue: avgOrderValue.toFixed(2),
        unfulfilledCount: unfulfilledOrders.length,
        lowStockCount: productsInventory.filter((p) => p.stock <= 5).length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to generate insights:", error);
    return Response.json(
      { success: false, error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
