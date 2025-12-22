"use server";

import Stripe from "stripe";
import dbConnect from "../mongodb";
import Customer from "../../models/Customer";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

/**
 * Gets or creates a Stripe customer by email
 * Also syncs the customer to MongoDB database
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  clerkUserId: string
): Promise<{ stripeCustomerId: string; mongoCustomerId: string }> {
  await dbConnect();

  // First, check if customer already exists in MongoDB
  const existingCustomer = await Customer.findOne({ email });

  if (existingCustomer?.stripeCustomerId) {
    // Customer exists, return existing IDs
    return {
      stripeCustomerId: existingCustomer.stripeCustomerId,
      mongoCustomerId: existingCustomer._id.toString(),
    };
  }

  // Check if customer exists in Stripe by email
  const existingStripeCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  let stripeCustomerId: string;

  if (existingStripeCustomers.data.length > 0) {
    // Customer exists in Stripe
    stripeCustomerId = existingStripeCustomers.data[0].id;
  } else {
    // Create new Stripe customer
    const newStripeCustomer = await stripe.customers.create({
      email,
      name,
      metadata: {
        clerkUserId,
      },
    });
    stripeCustomerId = newStripeCustomer.id;
  }

  // Create or update customer in MongoDB
  if (existingCustomer) {
    // Update existing customer with Stripe ID
    existingCustomer.stripeCustomerId = stripeCustomerId;
    existingCustomer.clerkUserId = clerkUserId;
    existingCustomer.name = name;
    await existingCustomer.save();
    
    return {
      stripeCustomerId,
      mongoCustomerId: existingCustomer._id.toString(),
    };
  }

  // Create new customer in MongoDB
  const newCustomer = await Customer.create({
    email,
    name,
    clerkUserId,
    stripeCustomerId,
  });

  return {
    stripeCustomerId,
    mongoCustomerId: newCustomer._id.toString(),
  };
}
