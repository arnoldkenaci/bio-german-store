# Order Success Page (`/bestellung/erfolg`)

## Overview
Thank-you page that Stripe Checkout redirects to after payment (`success_url` in `/api/checkout`). When Stripe confirms the payment, it shows the order total and clears the client cart.

## Interface
- `SuccessPage({ searchParams }: PageProps<"/bestellung/erfolg">)` (default export) in `page.tsx`: wraps the dynamic `Details` in `<Suspense>`.
- `Details` (local async component): reads `session_id` from `searchParams`, retrieves the session with `stripe().checkout.sessions.retrieve`, and renders `<ClearCart />` from `@/components/clear-cart` for paid sessions.
- `metadata`: title "Danke für deine Bestellung", `robots: { index: false }`.

## Invariants
- Stripe is queried only when `session_id` starts with `cs_` and `stripeConfigured()` is true. Otherwise `Details` renders nothing.
- Retrieval errors are swallowed (`.catch(() => null)`), so the page never fails because of Stripe.
- If `payment_status !== "paid"`, it shows "Deine Zahlung wird noch verarbeitet." instead of the total and does not clear the cart.
- The cart is cleared only for a retrieved session with `payment_status === "paid"`. Without Stripe, an invalid `session_id` or a retrieval error, the cart is kept.
- Only the customer's first name (`collected_information.shipping_details.name`) and `amount_total` (via `formatEUR`) are shown.
- Request-time data (`searchParams`, Stripe) is read only inside `<Suspense>`, as Cache Components requires.

## Side Effects
- Network call to Stripe (`checkout.sessions.retrieve`).
- Client side: `ClearCart` empties the cart for paid sessions. Its behavior is defined in `@/components/clear-cart`.

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
