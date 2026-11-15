"use client";

import { useEffect } from "react";
import { useCart } from "./cart";

/** Empties the cart once the customer lands on the success page. */
export function ClearCart() {
  const { ready, clear } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
