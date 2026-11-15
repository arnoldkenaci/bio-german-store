/** Shop-wide settings. Change values here, not scattered across components. */
export const shop = {
  name: "India House",
  tagline: "Reines Kupfer. Handgefertigt in Indien.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "kontakt@example.de",
  /** Countries we ship to (ISO-2, as Stripe expects). */
  shippingCountries: ["DE"] as const,
  shipping: {
    /** DHL Paket, gross, in cents. */
    costCents: 495,
    /** Free shipping from this cart total (gross, in cents). */
    freeFromCents: 4900,
    /** Extra grams for the outer carton and padding. */
    packagingGrams: 250,
    deliveryDays: { min: 1, max: 3 },
  },
  maxQuantityPerLine: 10,
};

export function shippingCents(subtotalCents: number): number {
  return subtotalCents >= shop.shipping.freeFromCents ? 0 : shop.shipping.costCents;
}

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function formatEUR(cents: number): string {
  return eur.format(cents / 100);
}
