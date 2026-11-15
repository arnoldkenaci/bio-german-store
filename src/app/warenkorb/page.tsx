import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Warenkorb", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="mb-10 text-5xl">Warenkorb</h1>
      <CartView />
    </div>
  );
}
