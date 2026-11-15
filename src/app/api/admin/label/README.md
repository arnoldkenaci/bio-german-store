# DHL Label API (`/api/admin/label`)

## Overview
Admin-only Route Handler that buys DHL shipping labels for paid Stripe orders and re-prints existing labels as PDFs. It is the action target of the "Label erstellen" form and the "Label erneut drucken" link on the admin order page (`/admin`). Access control is not implemented here: it relies on HTTP Basic Auth in `src/proxy.ts` (`config.matcher` includes `/api/admin/:path*`).

## Interface
- `POST(request: Request)` in `route.ts`: reads form field `sessionId` (a Stripe Checkout Session id), creates a DHL label via `createLabel` from `@/lib/dhl`, records the shipment number via `markShipped` from `@/lib/orders`, emails tracking info via `sendShippingMail` from `@/lib/mail`, and returns the label PDF.
- `GET(request: Request)` in `route.ts`: re-print endpoint, `GET /api/admin/label?shipment=<shipmentNo>`, returns the existing label PDF via `fetchLabel`.
- Local helpers (not exported): `pdf(buffer, shipmentNo)` builds an `application/pdf` response with `Content-Disposition: inline; filename="DHL-<shipmentNo>.pdf"` and `Cache-Control: no-store`; `fail(message, status)` builds a `text/plain` response prefixed with `Fehler: `.

| Method | Status codes returned by the handler |
| --- | --- |
| `POST` | 200 (PDF), 400 invalid `sessionId`, 404 order missing or no `paymentIntentId`, 409 refunded, 422 incomplete address, 502 DHL error, 503 DHL not configured |
| `GET` | 200 (PDF), 400 invalid `shipment`, 502 DHL error, 503 DHL not configured |

## Invariants
- Both handlers return 503 when `dhlConfigured()` is false, before any other work.
- `POST` only accepts a `sessionId` that starts with `cs_`.
- `POST` requires `order.paymentIntentId`, rejects orders with `order.refunded`, and requires `address.line1`, `postal_code`, `city`, and `country`.
- No duplicate labels: if `order.shipmentNo` is already set, `POST` re-prints it via `fetchLabel` and does not call `createLabel` again.
- The DHL `reference` is the order's `paymentIntentId`; `weightGrams` comes from the order.
- `GET` only accepts a `shipment` value matching `/^[0-9A-Za-z]{8,40}$/`.
- If the shipping email fails, the error is logged and the PDF is still returned, because the label is already valid.
- Authentication is enforced only by `src/proxy.ts`. Moving or renaming this route outside `/api/admin` removes that protection.

## Side Effects
- Network calls to the DHL API (`createLabel`, `fetchLabel` in `@/lib/dhl`). `createLabel` buys a paid label.
- Network calls to Stripe: `getOrder` reads the order; `markShipped` updates the PaymentIntent metadata with the shipment number and label timestamp (`META.shipmentNo`, `META.labelAt`).
- Sends an SMTP email to the customer (`sendShippingMail`) with `trackingUrl(shipmentNo)`, when `order.email` is set.
- `console.error` logging on DHL or mail failure.

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
