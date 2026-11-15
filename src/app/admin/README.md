# Admin Order Dashboard (`/admin`)

## Overview
Server-rendered dashboard for the shop owner. It lists paid orders live from Stripe, shows whether Stripe, DHL, and SMTP are configured, and offers per-order DHL label creation, re-printing, and tracking links. Access is protected by HTTP Basic Auth in `src/proxy.ts` (`config.matcher` includes `/admin/:path*`).

## Interface
- `AdminPage()` (default export) in `page.tsx`: renders the static header and `<Suspense>` around `Orders`.
- `Orders` (local async component): calls `await connection()` from `next/server`, renders the status bar (`stripeConfigured`, `dhlConfigured`, `mailConfigured`), then calls `listOrders()` from `@/lib/orders` and renders the order table.
- `itemLabel(key)` (local): resolves a line key through `parseLineKey` and `getProduct` from `@/lib/products` to "Product – Variant".
- `metadata`: title "Bestellungen", `robots: { index: false, follow: false }`.
- UI contract with [../api/admin/label/README.md](../api/admin/label/README.md): the form `POST /api/admin/label` sends the hidden field `sessionId`, and the re-print link is `GET /api/admin/label?shipment=<shipmentNo>`. Both open in a new tab (`target="_blank"`).

## Invariants
- Always rendered at request time (`await connection()` inside `<Suspense>`), never prerendered with live Stripe data.
- If `stripeConfigured()` is false, only the status bar is rendered and Stripe is not queried. A `listOrders()` failure is logged and an error message is shown.
- "Open" orders are those with neither `shipmentNo` nor `refunded`.
- Per-row shipping cell: refunded shows "Erstattet"; with `shipmentNo` it shows the tracking link (`trackingUrl`) and a re-print link; otherwise it shows the "Label erstellen" form, disabled when `dhlConfigured()` is false.
- Dates are formatted in `de-DE` with `timeZone: "Europe/Berlin"`, and totals with `formatEUR`.
- Not indexed (`robots` metadata; `/admin` is also disallowed in `robots.ts`). Authentication is enforced only by `src/proxy.ts`.

## Side Effects
- Network calls to Stripe via `listOrders()` (read-only on this page).
- `console.error` when loading orders fails.
- Label purchase and email happen only in `/api/admin/label`, not in this page.

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
