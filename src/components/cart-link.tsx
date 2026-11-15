"use client";

import Link from "next/link";
import { useCart } from "./cart";

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/warenkorb"
      className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-sand"
      aria-label={`Warenkorb${ready && count ? `, ${count} Artikel` : ""}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span className="hidden sm:inline">Warenkorb</span>
      {ready && count > 0 && (
        <span className="absolute -top-0.5 left-6 flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
