"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { lineKey } from "@/lib/products";
import { shop } from "@/lib/shop";

export type CartLine = { slug: string; variantId?: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (slug: string, variantId?: string, quantity?: number) => void;
  setQuantity: (slug: string, variantId: string | undefined, quantity: number) => void;
  remove: (slug: string, variantId?: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "ih-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function load(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((l) => typeof l?.slug === "string") : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage once on mount
    setLines(load());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setLines(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private mode – cart lives in memory only */
    }
  }, [lines, ready]);

  const add = useCallback((slug: string, variantId?: string, quantity = 1) => {
    setLines((prev) => {
      const key = lineKey(slug, variantId);
      const existing = prev.find((l) => lineKey(l.slug, l.variantId) === key);
      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...l, quantity: Math.min(shop.maxQuantityPerLine, l.quantity + quantity) } : l,
        );
      }
      return [...prev, { slug, variantId, quantity }];
    });
  }, []);

  const setQuantity = useCallback((slug: string, variantId: string | undefined, quantity: number) => {
    const key = lineKey(slug, variantId);
    setLines((prev) =>
      prev
        .map((l) =>
          lineKey(l.slug, l.variantId) === key
            ? { ...l, quantity: Math.max(0, Math.min(shop.maxQuantityPerLine, quantity)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const remove = useCallback((slug: string, variantId?: string) => {
    const key = lineKey(slug, variantId);
    setLines((prev) => prev.filter((l) => lineKey(l.slug, l.variantId) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, count: lines.reduce((n, l) => n + l.quantity, 0), ready, add, setQuantity, remove, clear }),
    [lines, ready, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
