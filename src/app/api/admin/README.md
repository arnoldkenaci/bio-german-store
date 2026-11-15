# Admin API (`/api/admin`)

## Overview
Groups the admin-only Route Handlers. Everything under `/api/admin/:path*` is protected by HTTP Basic Auth in `src/proxy.ts`, which returns 503 if `ADMIN_USER` or `ADMIN_PASSWORD` is unset and 401 if the credentials are missing or wrong.

## Subdirectories & Boundaries
- label: [./label/README.md](./label/README.md) - `POST` creates a DHL label for a paid Stripe order, or re-prints the existing one, then stores the shipment number in Stripe metadata and emails the customer. `GET ?shipment=` re-prints a label PDF.
