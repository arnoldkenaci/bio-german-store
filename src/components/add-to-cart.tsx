"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { variantPrice } from "@/lib/products";
import { formatEUR, shop } from "@/lib/shop";
import { useCart } from "./cart";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const price = variantPrice(product, variantId);

  if (price === null) {
    return (
      <div className="rounded-2xl bg-sand p-5 text-sm text-ink-soft">
        Dieses Produkt ist bald im Shop erhältlich. Schreib uns gern an{" "}
        <a className="text-copper underline" href={`mailto:${shop.contactEmail}`}>{shop.contactEmail}</a>.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-3xl font-medium">
        {formatEUR(price)}
        <span className="ml-2 align-middle text-xs font-normal text-ink-soft">inkl. MwSt., zzgl. <Link href="/versand" className="underline">Versand</Link></span>
      </p>

      {variants.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{product.variantLabel ?? "Variante"}</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <label
                key={v.id}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm ${
                  v.id === variantId ? "border-ink bg-ink text-cream" : "border-sand-dark hover:border-ink"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={v.id === variantId}
                  onChange={() => setVariantId(v.id)}
                  className="sr-only"
                />
                {v.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="qty">Menge</label>
        <div className="flex items-center rounded-full border border-sand-dark">
          <button type="button" aria-label="Weniger" className="px-4 py-3" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
          <input
            id="qty"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setQuantity(Number.isNaN(n) ? 1 : Math.max(1, Math.min(shop.maxQuantityPerLine, n)));
            }}
            className="w-10 bg-transparent text-center"
          />
          <button type="button" aria-label="Mehr" className="px-4 py-3" onClick={() => setQuantity((q) => Math.min(shop.maxQuantityPerLine, q + 1))}>+</button>
        </div>
        <button
          type="button"
          className="btn btn-primary flex-1"
          onClick={() => {
            add(product.slug, variantId, quantity);
            setAdded(true);
          }}
        >
          In den Warenkorb
        </button>
      </div>

      {added && (
        <p role="status" className="text-sm text-copper-dark">
          Hinzugefügt! <Link href="/warenkorb" className="underline">Zum Warenkorb</Link>
        </p>
      )}
    </div>
  );
}
