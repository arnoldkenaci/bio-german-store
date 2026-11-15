# Order Routes (`/bestellung`)

## Overview
Route segment for post-checkout pages. It has no page of its own. `robots.ts` disallows `/bestellung` for crawlers.

## Subdirectories & Boundaries
- erfolg: [./erfolg/README.md](./erfolg/README.md) - Stripe `success_url` target. It clears the cart and shows the paid order total for a valid `cs_` session id.
