"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { getProductsByIds } from "../db/products";
import { getOrCreateStripeCustomer } from "@/lib/actions/customer";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

// Types
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    sku: string;
    size?: string;
    color?: string;
  };
}

interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

import Coupon from "@/models/Coupon";

/**
 * Creates a Stripe Checkout Session from cart items
 * Validates stock and prices against MongoDB before creating session
 */
export async function createCheckoutSession(
  items: CartItem[],
  couponCode?: string
): Promise<CheckoutResult> {
  try {
    // 1. Verify user is authenticated
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: "Please sign in to checkout" };
    }

    // 2. Validate cart is not empty
    if (!items || items.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    // 3. Fetch current product data from MongoDB to validate prices/stock
    const productIds = items.map((item) => item.productId);
    const products = await getProductsByIds(productIds);

    // 4. Validate each item
    const validationErrors: string[] = [];
    const validatedItems: {
      product: any;
      quantity: number;
      variant?: any;
      finalPrice: number;
    }[] = [];

    for (const item of items) {
      const product = products.find(
        (p: any) => p._id.toString() === item.productId
      );

      if (!product) {
        validationErrors.push(`Product "${item.name}" is no longer available`);
        continue;
      }

      // Handle Variants
      if (product.hasVariants && item.variant) {
        const variant = product?.variants?.find((v: any) => v.sku === item.variant?.sku);
        if (!variant) {
          validationErrors.push(`Variant ${item.variant.sku} for "${product.name}" not found`);
          continue;
        }

        if ((variant.stock ?? 0) === 0) {
          validationErrors.push(`"${product.name}" (${variant.size}${variant.color ? ` / ${variant.color}` : ""}) is out of stock`);
          continue;
        }

        if (item.quantity > (variant.stock ?? 0)) {
          validationErrors.push(`Only ${variant.stock} of "${product.name}" variant available`);
          continue;
        }

        validatedItems.push({ 
          product, 
          quantity: item.quantity, 
          variant, 
          finalPrice: variant.price 
        });
      } else {
        // Base product validation
        if ((product.stock ?? 0) === 0) {
          validationErrors.push(`"${product.name}" is out of stock`);
          continue;
        }

        if (item.quantity > (product.stock ?? 0)) {
          validationErrors.push(
            `Only ${product.stock} of "${product.name}" available`
          );
          continue;
        }

        validatedItems.push({ 
          product, 
          quantity: item.quantity, 
          finalPrice: product.price 
        });
      }
    }

    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(". ") };
    }

    // 5. Create Stripe line items with validated prices
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      validatedItems.map(({ product, quantity, variant, finalPrice }) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: variant 
              ? `${product.name} - ${variant.size}${variant.color ? ` / ${variant.color}` : ""}`
              : product.name ?? "Product",
            images: product.images?.[0]?.asset?.url ? [product.images[0].asset.url] : [],
            metadata: {
              productId: product._id.toString(),
              sku: variant?.sku || "",
            },
          },
          unit_amount: Math.round((finalPrice ?? 0) * 100), // Convert to paise
        },
        quantity,
      }));

    // Handle Coupon Logic
    let stripeCouponId: string | undefined;
    
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(), 
        isActive: true 
      });

      if (coupon) {
        // Validation checks
        const subtotal = validatedItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
        
        if (coupon.expirationDate > new Date() && 
            (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
            (!coupon.minPurchaseAmount || subtotal >= coupon.minPurchaseAmount)) {
          
          // Create or retrieve Stripe Coupon
          try {
             // We create a new coupon in Stripe every time to ensure it matches our DB params exactly
             // In a real optimized app, we would sync these or cache the stripe ID
             const couponParams: Stripe.CouponCreateParams = {
               name: coupon.code,
               currency: 'inr',
             };

             if (coupon.type === 'PERCENTAGE') {
               couponParams.percent_off = coupon.value;
             } else {
               couponParams.amount_off = Math.round(coupon.value * 100);
             }

             const stripeCoupon = await stripe.coupons.create(couponParams);
             stripeCouponId = stripeCoupon.id;
          } catch (err) {
             console.error("Stripe coupon creation failed", err);
             // Proceed without coupon or handle error? Proceeding prevents checkout blocking
          }
        }
      }
    }

    // 6. Get or create Stripe customer
    const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
    const userName =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || userEmail;

    const { stripeCustomerId, mongoCustomerId } =
      await getOrCreateStripeCustomer(userEmail, userName, userId);

    // 7. Prepare metadata for webhook
    const metadata = {
      clerkUserId: userId,
      userEmail,
      mongoCustomerId,
      productIds: validatedItems.map((i) => i.product._id.toString()).join(","),
      quantities: validatedItems.map((i) => i.quantity).join(","),
      variantSkus: validatedItems.map((i) => i.variant?.sku || "").join(","),
      couponCode: couponCode || "",
    };

    // 8. Create Stripe Checkout Session
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer: stripeCustomerId,
      shipping_address_collection: {
        allowed_countries: ["IN", "US", "GB", "CA", "AU"],
      },
      metadata,
      discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    return { success: true, url: session.url ?? undefined };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Retrieves a checkout session by ID (for success page)
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details"],
    });

    // Verify the session belongs to this user
    if (session.metadata?.clerkUserId !== userId) {
      return { success: false, error: "Session not found" };
    }

    return {
      success: true,
      session: {
        id: session.id,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        amountTotal: session.amount_total,
        paymentStatus: session.payment_status,
        shippingAddress: session.customer_details?.address,
        lineItems: session.line_items?.data.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          amount: item.amount_total,
        })),
      },
    };
  } catch (error) {
    console.error("Get session error:", error);
    return { success: false, error: "Could not retrieve order details" };
  }
}
