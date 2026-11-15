# API Routes (`/api`)

## Overview
Groups the shop's App Router Route Handlers. It contains a public checkout endpoint and an admin-only area protected by Basic Auth. `robots.ts` disallows `/api` for crawlers.

## Subdirectories & Boundaries
- admin: [./admin/README.md](./admin/README.md) - Admin-only handlers behind the Basic Auth in `src/proxy.ts`. Currently only the DHL label endpoint (`/api/admin/label`).
- checkout: [./checkout/README.md](./checkout/README.md) - `POST /api/checkout` builds a Stripe Checkout Session from the cart, with prices, shipping, and metadata computed on the server, and returns `{ url }`.
