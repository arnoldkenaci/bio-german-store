# Cart Page (`/warenkorb`)

## Overview
Cart page shell. The cart UI and checkout trigger live in the client component `CartView`. This route is also the Stripe Checkout `cancel_url`.

## Interface
- `CartPage()` (default export) in `page.tsx`: renders a heading and `<CartView />` from `@/components/cart-view`.
- `metadata`: `{ title: "Warenkorb", robots: { index: false } }`.

## Invariants
- Not indexed (`robots.index: false`; `/warenkorb` is also disallowed in `robots.ts`).
- The path `/warenkorb` is hard-coded as `cancel_url` in `/api/checkout`.

## Side Effects
- None in `page.tsx`. Cart state and the checkout request are handled in `@/components/cart-view`.

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
