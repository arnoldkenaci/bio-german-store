import type Stripe from "stripe";
import { buildOrderLines, encodeLines, OrderError, parcelWeightGrams, subtotalCents } from "@/lib/order";
import { shippingCents, shop } from "@/lib/shop";
import { META, stripe, stripeConfigured } from "@/lib/stripe";

/** Creates a Stripe Checkout session from the cart and returns its URL. */
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return Response.json(
      { error: "Die Kasse ist noch nicht eingerichtet (Stripe-Schlüssel fehlt)." },
      { status: 503 },
    );
  }

  let lines;
  try {
    const body = await request.json();
    lines = buildOrderLines(body?.items);
  } catch (err) {
    const message = err instanceof OrderError ? err.message : "Ungültige Anfrage.";
    return Response.json({ error: message }, { status: 400 });
  }

  const subtotal = subtotalCents(lines);
  const shipping = shippingCents(subtotal);
  const taxRate = process.env.STRIPE_TAX_RATE_ID; // inclusive 19 % rate, created once in the dashboard
  const metadata = {
    [META.items]: encodeLines(lines),
    [META.weight]: String(parcelWeightGrams(lines)),
  };

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    locale: "de",
    line_items: lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "eur",
        unit_amount: line.unitCents,
        product_data: { name: line.name, metadata: { key: line.key } },
      },
      ...(taxRate ? { tax_rates: [taxRate] } : {}),
    })),
    shipping_address_collection: { allowed_countries: [...shop.shippingCountries] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: shipping === 0 ? "DHL Paket – kostenlos" : "DHL Paket",
          fixed_amount: { amount: shipping, currency: "eur" },
          delivery_estimate: {
            minimum: { unit: "business_day", value: shop.shipping.deliveryDays.min },
            maximum: { unit: "business_day", value: shop.shipping.deliveryDays.max },
          },
        },
      },
    ],
    // Payment methods (Karte, PayPal, Klarna, Apple Pay, …) are switched on in the Stripe dashboard.
    submit_type: "pay",
    custom_text: {
      submit: {
        message: `Mit Klick auf „Bezahlen“ gibst du eine zahlungspflichtige Bestellung auf. Es gelten unsere AGB (${shop.siteUrl}/agb) und die Widerrufsbelehrung (${shop.siteUrl}/widerrufsrecht).`,
      },
    },
    ...(process.env.STRIPE_INVOICES === "true" ? { invoice_creation: { enabled: true } } : {}),
    metadata,
    payment_intent_data: { metadata },
    success_url: `${shop.siteUrl}/bestellung/erfolg?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${shop.siteUrl}/warenkorb`,
  };

  try {
    const session = await stripe().checkout.sessions.create(params);
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout failed", err);
    return Response.json(
      { error: "Die Kasse ist gerade nicht erreichbar. Bitte versuche es gleich noch einmal." },
      { status: 502 },
    );
  }
}
