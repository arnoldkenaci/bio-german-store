"use client";

import Link from "next/link";
import { useState } from "react";
import { getProduct, lineKey, variantPrice } from "@/lib/products";
import { formatEUR, shippingCents, shop } from "@/lib/shop";
import { useCart } from "./cart";
import { ProductImage } from "./product-image";

export function CartView() {
  const { lines, ready, setQuantity, remove } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <p className="text-ink-soft">Warenkorb wird geladen …</p>;

  const rows = lines.flatMap((line) => {
    const product = getProduct(line.slug);
    const unit = product ? variantPrice(product, line.variantId) : null;
    if (!product || unit === null) return [];
    const variant = product.variants?.find((v) => v.id === line.variantId);
    return [{ line, product, variant, unit }];
  });

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl bg-sand p-10 text-center">
        <p className="text-lg">Dein Warenkorb ist noch leer.</p>
        <Link href="/produkte" className="btn btn-primary mt-6">Produkte entdecken</Link>
      </div>
    );
  }

  const subtotal = rows.reduce((sum, r) => sum + r.unit * r.line.quantity, 0);
  const shipping = shippingCents(subtotal);
  const missingForFree = shop.shipping.freeFromCents - subtotal;

  async function checkout() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: rows.map((r) => r.line) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Die Kasse ist gerade nicht erreichbar.");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-sand-dark/70 border-y border-sand-dark/70">
        {rows.map(({ line, product, variant, unit }) => (
          <li key={lineKey(line.slug, line.variantId)} className="flex gap-4 py-5">
            <Link href={`/produkte/${product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sand">
              <ProductImage product={product} sizes="96px" />
            </Link>
            <div className="flex flex-1 flex-col justify-between gap-2">
              <div className="flex justify-between gap-4">
                <div>
                  <Link href={`/produkte/${product.slug}`} className="font-serif text-xl hover:text-copper">{product.name}</Link>
                  {variant && <p className="text-sm text-ink-soft">{variant.name}</p>}
                </div>
                <p className="font-medium whitespace-nowrap">{formatEUR(unit * line.quantity)}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center rounded-full border border-sand-dark">
                  <button type="button" aria-label="Weniger" className="px-3 py-1" onClick={() => setQuantity(line.slug, line.variantId, line.quantity - 1)}>−</button>
                  <span className="w-6 text-center" aria-label="Menge">{line.quantity}</span>
                  <button type="button" aria-label="Mehr" className="px-3 py-1" onClick={() => setQuantity(line.slug, line.variantId, line.quantity + 1)}>+</button>
                </div>
                <button type="button" className="text-ink-soft underline hover:text-copper" onClick={() => remove(line.slug, line.variantId)}>
                  Entfernen
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-3xl bg-sand p-6">
        {missingForFree > 0 ? (
          <div className="mb-5">
            <p className="text-sm">Noch <strong>{formatEUR(missingForFree)}</strong> bis zum kostenlosen Versand</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream">
              <div className="h-full bg-copper" style={{ width: `${Math.min(100, (subtotal / shop.shipping.freeFromCents) * 100)}%` }} />
            </div>
          </div>
        ) : (
          <p className="mb-5 text-sm text-copper-dark">✓ Kostenloser Versand</p>
        )}
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>Zwischensumme</dt><dd>{formatEUR(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Versand (DHL)</dt><dd>{shipping === 0 ? "kostenlos" : formatEUR(shipping)}</dd></div>
          <div className="flex justify-between border-t border-sand-dark pt-3 text-base font-semibold">
            <dt>Gesamt</dt><dd>{formatEUR(subtotal + shipping)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-xs text-ink-soft">inkl. 19 % MwSt.</p>
        <button type="button" onClick={checkout} disabled={pending} className="btn btn-primary mt-6 w-full">
          {pending ? "Weiter zur Kasse …" : "Zur Kasse"}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <p className="mt-4 text-center text-xs text-ink-soft">Sicher bezahlen mit Karte, PayPal, Klarna, Apple Pay & Google Pay</p>
      </aside>
    </div>
  );
}
