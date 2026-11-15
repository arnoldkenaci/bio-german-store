import "server-only";
import type Stripe from "stripe";
import { decodeLines } from "./order";
import { META, stripe } from "./stripe";

export type AdminOrder = {
  sessionId: string;
  paymentIntentId: string | null;
  created: Date;
  email: string | null;
  name: string;
  address: Stripe.Address | null;
  totalCents: number;
  items: { key: string; quantity: number }[];
  weightGrams: number;
  shipmentNo: string | null;
  refunded: boolean;
};

function toOrder(session: Stripe.Checkout.Session): AdminOrder | null {
  if (session.payment_status !== "paid") return null;
  const pi = typeof session.payment_intent === "object" ? session.payment_intent : null;
  const meta = pi?.metadata ?? session.metadata ?? {};
  const shipping = session.collected_information?.shipping_details;
  const latestCharge = pi && typeof pi.latest_charge === "object" ? pi.latest_charge : null;

  return {
    sessionId: session.id,
    paymentIntentId: pi?.id ?? (typeof session.payment_intent === "string" ? session.payment_intent : null),
    created: new Date(session.created * 1000),
    email: session.customer_details?.email ?? null,
    name: shipping?.name ?? session.customer_details?.name ?? "",
    address: shipping?.address ?? null,
    totalCents: session.amount_total ?? 0,
    items: decodeLines(meta[META.items]),
    weightGrams: Number(meta[META.weight]) || 1000,
    shipmentNo: meta[META.shipmentNo] || null,
    refunded: Boolean(latestCharge?.refunded),
  };
}

/** Latest paid orders straight from Stripe (no own database needed). */
export async function listOrders(limit = 50): Promise<AdminOrder[]> {
  const sessions = await stripe().checkout.sessions.list({
    limit,
    status: "complete",
    expand: ["data.payment_intent", "data.payment_intent.latest_charge"],
  });
  return sessions.data.map(toOrder).filter((o): o is AdminOrder => o !== null);
}

export async function getOrder(sessionId: string): Promise<AdminOrder | null> {
  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "payment_intent.latest_charge"],
  });
  return toOrder(session);
}

export async function markShipped(paymentIntentId: string, shipmentNo: string): Promise<void> {
  await stripe().paymentIntents.update(paymentIntentId, {
    metadata: { [META.shipmentNo]: shipmentNo, [META.labelAt]: new Date().toISOString() },
  });
}
