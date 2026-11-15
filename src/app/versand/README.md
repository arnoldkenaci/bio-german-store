# Shipping & Payment Page (`/versand`)

## Overview
Static information page about shipping (DHL Paket) and payment (Stripe). Its values are rendered from the shop configuration.

## Interface
- `Page()` (default export) in `page.tsx`: renders `<TextPage title="Versand & Zahlung">` from `@/components/text-page`.
- `metadata`: `{ title: "Versand & Zahlung" }`.

## Invariants
- Delivery days, shipping cost, and the free-shipping threshold come from `shop.shipping.deliveryDays.min/max`, `shop.shipping.costCents`, and `shop.shipping.freeFromCents` in `@/lib/shop`, formatted with `formatEUR`. Do not hard-code them.
- The list of payment methods is static text. It must match the methods enabled in the Stripe dashboard.

## Side Effects
- None

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
