# lib

## Overview

Server-side logic for the India House copper shop: the product catalog
and shop settings, cart and order validation, the Stripe client (Stripe
also serves as the order database), DHL Parcel DE Shipping API v2 label
creation, and SMTP shipping-notice mail.

`products.ts`, `shop.ts` and `order.ts` have no `server-only` import and
can be used from client and server code. `stripe.ts`, `orders.ts`,
`dhl.ts` and `mail.ts` start with `import "server-only"` and must only be
imported from server code.

## Interface

### `products.ts` (product catalog, the single source of truth for what is sold)

- `type Variant` = `{ id, name, priceCents? }`
- `type Category` = `"flaschen" | "sets" | "becher" | "pflege"`
- `type Product`: `slug`, `name`, `category`, `tagline`, `description[]`,
  `priceCents: number | null`, `weightGrams`, `images?`, `variants?`,
  `variantLabel?`, `specs[]`, `included?`, `drinkware`, `featured?`
- `categories: Record<Category, string>`: display labels for each category
- `products: Product[]`: the static catalog
- `getProduct(slug): Product | undefined`
- `variantPrice(product, variantId?): number | null`: the variant's
  `priceCents` override, or the product's `priceCents` if there is no override
- `lineKey(slug, variantId?): string`: `"<slug>"` or `"<slug>:<variantId>"`
- `parseLineKey(key): { slug, variantId? }`

### `shop.ts` (shop-wide settings)

- `shop`: `name`, `tagline`, `siteUrl` (`NEXT_PUBLIC_SITE_URL`, default
  `http://localhost:3000`), `contactEmail` (`NEXT_PUBLIC_CONTACT_EMAIL`),
  `shippingCountries` (`["DE"]`), `shipping.{costCents: 495,
  freeFromCents: 4900, packagingGrams: 250, deliveryDays}`,
  `maxQuantityPerLine: 10`
- `shippingCents(subtotalCents): number`: `0` when the subtotal is at least
  `freeFromCents`, otherwise `costCents`
- `formatEUR(cents): string`: `de-DE` EUR currency format

### `order.ts` (cart validation and order encoding)

- `type CartItemInput` = `{ slug, variantId?, quantity }`
- `type OrderLine` = `{ key, name, unitCents, quantity, weightGrams }`
- `class OrderError extends Error`
- `buildOrderLines(items: unknown): OrderLine[]`: checks an untrusted cart
  against the catalog and merges lines that share a key
- `subtotalCents(lines): number`
- `parcelWeightGrams(lines): number`: sum of line weights plus
  `shop.shipping.packagingGrams`
- `encodeLines(lines): string`: `"key*qty|key*qty"` for Stripe metadata
- `decodeLines(value?): { key, quantity }[]`

### `stripe.ts` (server-only)

- `stripeConfigured(): boolean`: true when `STRIPE_SECRET_KEY` is set
- `stripe(): Stripe`: lazily created singleton client
- `META`: PaymentIntent metadata keys `order_items`, `parcel_weight_g`,
  `dhl_shipment_no`, `dhl_label_created_at`

### `orders.ts` (server-only, admin order view built from Stripe)

- `type AdminOrder`: `sessionId`, `paymentIntentId`, `created`, `email`,
  `name`, `address`, `totalCents`, `items`, `weightGrams`, `shipmentNo`,
  `refunded`
- `listOrders(limit = 50): Promise<AdminOrder[]>`
- `getOrder(sessionId): Promise<AdminOrder | null>`
- `markShipped(paymentIntentId, shipmentNo): Promise<void>`

### `dhl.ts` (server-only, DHL Parcel DE Shipping API v2)

- `type Consignee` = `{ name, line1, line2?, postalCode, city, country, email? }`
- `type LabelResult` = `{ shipmentNo: string; labelPdf: Buffer }`
- `class DhlError extends Error`
- `dhlConfigured(): boolean`: true when `DHL_API_KEY`, `DHL_USER`,
  `DHL_PASSWORD`, `DHL_BILLING_NUMBER` and `SHIPPER_NAME` are all set
- `buildShipmentRequest({ consignee, weightGrams, reference })`: builds the
  request body; a pure function apart from reading environment variables
- `createLabel({ consignee, weightGrams, reference }): Promise<LabelResult>`
- `fetchLabel(shipmentNo): Promise<Buffer>`
- `trackingUrl(shipmentNo): string`: dhl.de tracking link

### `mail.ts` (server-only, SMTP)

- `mailConfigured(): boolean`: true when `SMTP_HOST` and `MAIL_FROM` are set
- `sendShippingMail({ to, name, trackingUrl, shipmentNo }): Promise<boolean>`

## Invariants

- Prices and weights always come from the server-side catalog, never from
  the client (`order.ts:buildOrderLines`). `CartItemInput` only supplies the
  slug, variant and quantity.
- Prices are integer cents, gross and include 19 % VAT
  (`products.ts:Product.priceCents`). A product with `priceCents: null`
  cannot be ordered: `buildOrderLines` throws
  `OrderError("… ist noch nicht bestellbar.")`.
- `buildOrderLines` throws `OrderError` when:
  - the cart is not an array or is empty
  - the cart has more than 50 lines
  - a slug is unknown
  - the product has variants but none was chosen
  - the `variantId` is unknown
  - the quantity is not an integer from 1 to `shop.maxQuantityPerLine` (10)
  - the merged quantity for one line key is above 10
- A line key has the format `"<slug>"` or `"<slug>:<variantId>"`
  (`products.ts:lineKey` / `parseLineKey`). Slugs and variant ids must
  therefore not contain `:`. The encoded form `encodeLines` uses `|` and `*`
  as separators, and Stripe metadata values are limited to 500 characters.
- `decodeLines` uses quantity `1` when a quantity cannot be parsed.
  `orders.ts:toOrder` uses weight `1000` g when `parcel_weight_g` metadata
  is missing.
- Only Checkout Sessions with `payment_status === "paid"` count as orders
  (`orders.ts:toOrder`). `listOrders` lists only sessions with
  `status: "complete"`. Metadata is read from the PaymentIntent first and
  falls back to the session metadata.
- `stripe()` throws if `STRIPE_SECRET_KEY` is missing.
- DHL:
  - Uses the sandbox base URL unless `DHL_SANDBOX === "false"`.
  - Only the countries in `ISO3` (DE, AT, NL, BE, FR, LU, CH) are accepted;
    any other country throws `DhlError`.
  - Product `V01PAK` is used for DEU and `V53WPAK` for every other country.
  - Name and address fields are trimmed and cut to 50 characters (`clip`).
  - `refNo` is cut to 35 characters and padded with `-` to at least 8.
  - The weight is rounded, with a minimum of 100 g.
  - A required environment variable that is missing throws `DhlError`
    (`env`).
  - `createLabel` throws `DhlError` if the HTTP request fails or the
    response has no `shipmentNo` or label; `fetchLabel` throws if the HTTP
    request fails or the response has no label.
- `sendShippingMail` returns `false` and sends nothing when
  `mailConfigured()` is false. Order confirmations are sent by Stripe, not
  by this module.

## Side Effects

- Stripe API (`orders.ts`): `checkout.sessions.list` and
  `checkout.sessions.retrieve` (both expand `payment_intent` and
  `latest_charge`). `markShipped` calls `paymentIntents.update` to write
  `dhl_shipment_no` and `dhl_label_created_at`. There is no local database:
  Stripe metadata is the order store.
- `stripe.ts` keeps a module-level `client` singleton.
- DHL HTTP (`dhl.ts`) uses Basic auth plus the `dhl-api-key` header:
  - `createLabel` sends `POST {base}/orders?includeDocs=include&docFormat=PDF&printFormat=…`.
  - `fetchLabel` sends `GET {base}/orders?shipment=…`.
  - The print format comes from `DHL_PRINT_FORMAT` (default `910-300-700`).
- SMTP (`mail.ts`): `nodemailer.createTransport` reads `SMTP_HOST`,
  `SMTP_PORT` (default 465; secure when the port is 465), `SMTP_USER` and
  `SMTP_PASSWORD`. `sendMail` sends from `MAIL_FROM` with
  `replyTo: shop.contactEmail`.
- Environment variables read:
  - Stripe: `STRIPE_SECRET_KEY`
  - DHL: `DHL_*`, `SHIPPER_NAME`, `SHIPPER_STREET`, `SHIPPER_HOUSE`,
    `SHIPPER_POSTAL_CODE`, `SHIPPER_CITY`, `SHIPPER_EMAIL`
  - Mail: `SMTP_*`, `MAIL_FROM`
  - Shop: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`
- `products.ts`, `shop.ts` and `order.ts` have no I/O.

## Verification

- Run: `npm test` (tests in `/tests/order.test.ts` and `/tests/dhl.test.ts`)
- Also: `npm run lint` and `npm run build`
