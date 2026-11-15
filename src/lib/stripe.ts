import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt.");
  client ??= new Stripe(key);
  return client;
}

/** Metadata keys we write on the PaymentIntent — Stripe is our order database. */
export const META = {
  items: "order_items",
  weight: "parcel_weight_g",
  shipmentNo: "dhl_shipment_no",
  labelAt: "dhl_label_created_at",
} as const;
