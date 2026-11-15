import { getProduct, lineKey, variantPrice } from "./products";
import { shop } from "./shop";

export type CartItemInput = { slug: string; variantId?: string; quantity: number };

export type OrderLine = {
  key: string;
  name: string;
  unitCents: number;
  quantity: number;
  weightGrams: number;
};

export class OrderError extends Error {}

/**
 * Validates a cart sent by the browser against the catalog. Prices and
 * weights always come from the server-side catalog, never from the client.
 */
export function buildOrderLines(items: unknown): OrderLine[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError("Der Warenkorb ist leer.");
  }
  if (items.length > 50) throw new OrderError("Zu viele Positionen.");

  const merged = new Map<string, OrderLine>();
  for (const raw of items as CartItemInput[]) {
    const product = typeof raw?.slug === "string" ? getProduct(raw.slug) : undefined;
    if (!product) throw new OrderError("Ein Artikel ist nicht mehr verfügbar.");

    const variantId = typeof raw.variantId === "string" ? raw.variantId : undefined;
    const variant = product.variants?.find((v) => v.id === variantId);
    if (product.variants?.length && !variant) {
      throw new OrderError(`Bitte eine Variante für „${product.name}“ wählen.`);
    }
    if (variantId && !variant) throw new OrderError("Unbekannte Variante.");

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > shop.maxQuantityPerLine) {
      throw new OrderError("Ungültige Menge.");
    }

    const unitCents = variantPrice(product, variant?.id);
    if (unitCents === null) {
      throw new OrderError(`„${product.name}“ ist noch nicht bestellbar.`);
    }

    const key = lineKey(product.slug, variant?.id);
    const existing = merged.get(key);
    const total = (existing?.quantity ?? 0) + quantity;
    if (total > shop.maxQuantityPerLine) throw new OrderError("Ungültige Menge.");

    merged.set(key, {
      key,
      name: variant ? `${product.name} – ${variant.name}` : product.name,
      unitCents,
      quantity: total,
      weightGrams: product.weightGrams,
    });
  }
  return [...merged.values()];
}

export function subtotalCents(lines: OrderLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0);
}

export function parcelWeightGrams(lines: OrderLine[]): number {
  return lines.reduce((sum, l) => sum + l.weightGrams * l.quantity, shop.shipping.packagingGrams);
}

/**
 * Compact order summary stored in Stripe metadata (max 500 chars per value),
 * e.g. "kupferflasche-7-chakra:natur*2|zungenreiniger-kupfer*1".
 */
export function encodeLines(lines: OrderLine[]): string {
  return lines.map((l) => `${l.key}*${l.quantity}`).join("|");
}

export function decodeLines(value: string | undefined): { key: string; quantity: number }[] {
  if (!value) return [];
  return value.split("|").map((part) => {
    const [key, qty] = part.split("*");
    return { key, quantity: Number(qty) || 1 };
  });
}
