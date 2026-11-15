# India House Shop (`src`) Blueprint

## System Overview

Source of the India House online shop for copper bottles, cups and tongue
cleaners, sold in Germany. It is a Next.js 16 App Router app with Cache
Components enabled. It has no database of its own:

- The product catalog is a static file (`lib/products.ts`).
- The cart lives in the browser (`localStorage`).
- Payment runs through Stripe Checkout, and paid Checkout Sessions with their
  PaymentIntent metadata serve as the order store.
- Fulfilment buys DHL Parcel DE labels from a Basic-Auth admin page and sends
  an SMTP shipping notice.

```text
Browser cart (components/cart.tsx, localStorage)
  └─ POST /api/checkout ──► lib/order.ts (catalog prices) ──► Stripe Checkout
                                                               ├─ success → /bestellung/erfolg
                                                               └─ cancel  → /warenkorb
Admin (/admin, Basic Auth in proxy.ts)
  └─ lib/orders.ts ──► Stripe (list paid sessions)
  └─ POST /api/admin/label ──► lib/dhl.ts (DHL label) ──► lib/orders.ts:markShipped (Stripe metadata)
                                                     └──► lib/mail.ts (SMTP tracking mail)
```

## Local Interface & Invariants

- `proxy.ts:proxy(request)`: HTTP Basic Auth for the admin area (Next.js 16
  "proxy", formerly middleware). `config.matcher` is
  `["/admin/:path*", "/api/admin/:path*"]`.
- If `ADMIN_USER` or `ADMIN_PASSWORD` is unset, it returns 503 (the admin is
  disabled). If the credentials are missing or wrong, it returns 401 with a
  `WWW-Authenticate: Basic` header.
- Credentials are compared with `safeEqual`, which compares in constant time.
- The proxy is the only access control for `/admin` and `/api/admin/*`. The
  route code in those folders does not check authentication itself.

## Subdirectories & System Boundaries

- app: [./app/README.md](./app/README.md) - App Router routes: home, catalog,
  product pages, cart, Stripe checkout and success pages, legal and info pages,
  the admin dashboard and Route Handlers, plus `robots.ts` and `sitemap.ts`.
- components: [./components/README.md](./components/README.md) - React UI. The
  client cart state (`CartProvider`/`useCart`, `localStorage` key
  `ih-cart-v1`), the cart and checkout UI, and the presentational site
  components.
- lib: [./lib/README.md](./lib/README.md) - Domain and integration logic:
  catalog and shop settings, order validation and encoding, the Stripe client
  and order view, the DHL Parcel DE Shipping API v2 client, and SMTP mail.
  `stripe.ts`, `orders.ts`, `dhl.ts` and `mail.ts` are `server-only`.

## Global Invariants

- Payment amounts are calculated only on the server from `lib/products.ts` and
  `lib/shop.ts` (`lib/order.ts:buildOrderLines`). Client-supplied prices are
  ignored.
- Prices are integer gross cents including 19 % VAT. `priceCents: null` means
  the product cannot be ordered.
- Order state lives only in Stripe. `META` keys (`lib/stripe.ts`) on the
  PaymentIntent link an order to its items, parcel weight and DHL shipment
  number.
- A DHL label is bought at most once per order. A second request re-prints the
  stored shipment (`app/api/admin/label`).
- Request-time data is read only inside `<Suspense>`, or after `connection()`,
  as Cache Components requires.

## Global Side Effects

- Stripe API: create and retrieve Checkout Sessions, list them, and update
  PaymentIntent metadata.
- DHL Parcel DE Shipping API v2: buys labels (paid) and fetches labels again.
  The sandbox is used unless `DHL_SANDBOX=false`.
- SMTP: shipping notice e-mails to customers.
- Browser `localStorage`: the cart.
- Configuration comes only from environment variables (see `/.env.example`).

## System Verification

- Run: `npm test` (from the repository root; also `npm run lint` and
  `npm run build`)
