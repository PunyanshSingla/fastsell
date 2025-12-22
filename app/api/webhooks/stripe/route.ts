import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // Handle the event
  console.log(`🔔 Webhook received! Event type: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`🛒 Processing checkout.session.completed for session: ${session.id}`);
      await handleCheckoutCompleted(session);
      break;
    }
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripePaymentId = session.payment_intent as string;
  console.log(`💰 Payment Intent: ${stripePaymentId}`);

  try {
    await dbConnect();
    console.log("✅ Database connected in webhook");

    // Idempotency check: prevent duplicate processing on webhook retries
    const existingOrder = await Order.findOne({ stripePaymentId });

    if (existingOrder) {
      console.log(
        `⚠️ Webhook already processed for payment ${stripePaymentId}, skipping`
      );
      return;
    }

    // Extract metadata
    const metadata = session.metadata ?? {};
    console.log("📝 Metadata received:", JSON.stringify(metadata, null, 2));

    const {
      clerkUserId,
      userEmail,
      mongoCustomerId,
      productIds: productIdsString,
      quantities: quantitiesString,
    } = metadata;

    if (!clerkUserId || !productIdsString || !quantitiesString) {
      console.error("❌ Missing metadata in checkout session:", {
        clerkUserId: !!clerkUserId,
        productIds: !!productIdsString,
        quantities: !!quantitiesString
      });
      return;
    }

    const productIds = productIdsString.split(",");
    const quantities = quantitiesString.split(",").map(Number);

    console.log(`📦 Fetching line items for session ${session.id}...`);
    // Get line items from Stripe
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    console.log(`✅ Fetched ${lineItems.data.length} line items`);

    // Build order items array
    const orderItems = productIds.map((productId, index) => ({
      product: productId,
      quantity: quantities[index],
      priceAtPurchase: lineItems.data[index]?.amount_total
        ? lineItems.data[index].amount_total / 100
        : 0,
    }));

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Extract shipping address
    const shippingAddress = session.customer_details?.address;
    const customerName = session.customer_details?.name;
    
  const address = {
  name:
    session.customer_details?.name ||
    userEmail ||
    "Guest Customer",

  line1: session.customer_details?.address?.line1 || "",
  line2: session.customer_details?.address?.line2 || "",
  city: session.customer_details?.address?.city || "",
  postcode: session.customer_details?.address?.postal_code || "",
  country: session.customer_details?.address?.country || "",
};


    console.log(`🔨 Creating order ${orderNumber} in MongoDB...`, {
      customer: mongoCustomerId,
      clerkUserId,
      itemCount: orderItems.length,
      total: (session.amount_total ?? 0) / 100
    });

    let order;
    try {
      // Create order in MongoDB
      order = await Order.create({
        orderNumber,
        customer: (mongoCustomerId && mongoCustomerId.length === 24) ? mongoCustomerId : undefined, 
        clerkUserId,
        email: userEmail ?? session.customer_details?.email ?? "",
        items: orderItems,
        total: (session.amount_total ?? 0) / 100,
        status: "paid",
        stripePaymentId,
        address,
      });
      console.log(`✨ Order saved successfully: ${order._id} (${orderNumber})`);
    } catch (dbError: any) {
      console.error("❌ Mongoose Order.create failed:", {
        message: dbError.message,
        errors: dbError.errors ? Object.keys(dbError.errors) : "none",
        details: dbError.errors ? JSON.stringify(dbError.errors) : dbError
      });
      throw dbError;
    }

    // Decrease stock for all products
    console.log("📉 Updating product stock levels...");
    const stockUpdates = productIds.map((productId, i) => ({
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { stock: -quantities[i] } },
      },
    }));

    await Product.bulkWrite(stockUpdates);
    console.log(`✅ Stock updated for ${productIds.length} products`);
  } catch (error) {
    console.error("❌ Error handling checkout.session.completed:", error);
    throw error; // Re-throw to return 500 and trigger Stripe retry
  }
}
