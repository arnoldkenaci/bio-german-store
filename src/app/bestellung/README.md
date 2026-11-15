# Order Routes (`/bestellung`)

## Overview
Route segment for post-checkout pages. It has no page of its own. `robots.ts` disallows `/bestellung` for crawlers.

## Subdirectories & Boundaries
- erfolg: [./erfolg/README.md](./erfolg/README.md) - Stripe `success_url` target. For a paid `cs_` session it shows the order total and clears the cart.
