import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendOrderConfirmationEmail } from "@/lib/emails/sendOrderConfirmation";

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

    const existingOrder = await Order.findOne({ stripePaymentId });
    if (existingOrder) {
      console.log(`⚠️ Webhook already processed for payment ${stripePaymentId}, skipping`);
      return;
    }

    const metadata = session.metadata ?? {};
    const {
      clerkUserId,
      userEmail,
      mongoCustomerId,
      productIds: productIdsString,
      quantities: quantitiesString,
      variantSkus: variantSkusString,
    } = metadata;

    if (!clerkUserId || !productIdsString || !quantitiesString) {
      console.error("❌ Missing metadata in checkout session");
      return;
    }

    const productIds = productIdsString.split(",");
    const quantities = quantitiesString.split(",").map(Number);
    const variantSkus = variantSkusString ? variantSkusString.split(",") : [];

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // Build order items array
    const orderItems = await Promise.all(productIds.map(async (productId, index) => {
      const sku = variantSkus[index];
      let variantDetails = undefined;

      if (sku) {
        // Fetch product to get size/color for the order record
        const product = await Product.findById(productId);
        const variant = product?.variants?.find((v: any) => v.sku === sku);
        if (variant) {
          variantDetails = {
            sku,
            size: variant.size,
            color: variant.color
          };
        }
      }

      return {
        product: productId,
        quantity: quantities[index],
        priceAtPurchase: lineItems.data[index]?.amount_total
          ? lineItems.data[index].amount_total / 100
          : 0,
        variant: variantDetails
      };
    }));

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const address = {
      name: session.customer_details?.name || userEmail || "Guest Customer",
      line1: session.customer_details?.address?.line1 || "",
      line2: session.customer_details?.address?.line2 || "",
      city: session.customer_details?.address?.city || "",
      postcode: session.customer_details?.address?.postal_code || "",
      country: session.customer_details?.address?.country || "",
    };

    const order = await Order.create({
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

    console.log(`✨ Order saved: ${orderNumber}`);

    // Update stock levels
    console.log("📉 Updating stock levels...");
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      const quantity = quantities[i];
      const sku = variantSkus[i];

      if (sku) {
        // Decrease stock for specific variant
        await Product.updateOne(
          { _id: productId, "variants.sku": sku },
          { $inc: { "variants.$.stock": -quantity } }
        );
      } else {
        // Decrease base product stock
        await Product.updateOne(
          { _id: productId },
          { $inc: { stock: -quantity } }
        );
      }
    }
    console.log("✅ Stock updates completed");
    console.log("📧 Sending order confirmation email...");
    const populatedOrder = await Order.findById(order._id)
      .populate("items.product", "name images")
      .lean();
    console.log(populatedOrder.items[0].product.images[0].asset.url, "populatedOrder");

    await sendOrderConfirmationEmail({
      email: order.email,
      redirectId: order._id,
      firstName: order.address.name.split(" ")[0],
      orderId: order.orderNumber,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      items: populatedOrder.items.map((item: any) => ({
        name: item.product?.name ?? "Product",
        image: item.product?.images?.[0].asset.url ?? "",
        price: item.priceAtPurchase,
        quantity: item.quantity,
        variant: item.variant?.size || item.variant?.color,
      })),
      subtotal: order.total,
      shippingCost: 0,
      totalAmount: order.total,
      shippingAddress: {
        street: order.address.line1,
        city: order.address.city,
        state: "",
        zip: order.address.postcode,
        country: order.address.country,
      },
    });

    console.log("✅ Order confirmation email sent");
  } catch (error) {
    console.error("❌ Error in handleCheckoutCompleted:", error);
    throw error;
  }
}
