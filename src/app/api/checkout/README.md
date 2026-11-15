# Checkout API (`/api/checkout`)

## Overview
Public Route Handler that turns the client cart into a Stripe Checkout Session and returns the hosted checkout URL. Prices, weights, and shipping are computed on the server from the product catalog. Client-supplied prices are never used.

## Interface
- `POST(request: Request)` in `route.ts`: expects a JSON body `{ items }`. Responds `{ url: string }` (the Stripe session URL) on success, or `{ error: string }` with status 400, 502, or 503.
- Depends on `buildOrderLines`, `encodeLines`, `OrderError`, `parcelWeightGrams`, and `subtotalCents` from `@/lib/order`; `shippingCents` and `shop` from `@/lib/shop`; and `META`, `stripe`, and `stripeConfigured` from `@/lib/stripe`.

## Invariants
- Returns 503 when `stripeConfigured()` is false.
- Line items come only from `buildOrderLines(body?.items)`. An `OrderError` message, or `"Ungültige Anfrage."` for any other parse error, is returned with status 400.
- Session parameters: `mode: "payment"`, `locale: "de"`, currency `eur`, `submit_type: "pay"`, and `shipping_address_collection.allowed_countries` taken from `shop.shippingCountries`.
- There is one fixed-amount shipping option, `shippingCents(subtotalCents(lines))`. Its display name is "DHL Paket – kostenlos" when the amount is 0, otherwise "DHL Paket". The delivery estimate comes from `shop.shipping.deliveryDays`.
- `metadata` (`META.items` = `encodeLines(lines)`, `META.weight` = `parcelWeightGrams(lines)`) is set on both the session and `payment_intent_data`. The admin order and label flows read this data back.
- `tax_rates: [STRIPE_TAX_RATE_ID]` is added per line only if the `STRIPE_TAX_RATE_ID` environment variable is set. `invoice_creation` is enabled only if `STRIPE_INVOICES === "true"`.
- `success_url` is `${shop.siteUrl}/bestellung/erfolg?session_id={CHECKOUT_SESSION_ID}` and `cancel_url` is `${shop.siteUrl}/warenkorb`.
- The submit text links to `/agb` and `/widerrufsrecht`.

## Side Effects
- Network call to Stripe: `stripe().checkout.sessions.create(params)`. On failure it logs `console.error("Stripe checkout failed", ...)` and returns 502.
- Reads the environment variables `STRIPE_TAX_RATE_ID` and `STRIPE_INVOICES`.

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
