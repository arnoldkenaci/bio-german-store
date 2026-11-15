# App Router (`src/app`)

## Overview
Next.js 16 App Router tree (Cache Components enabled) for a German-language shop selling copper bottles, cups, and tongue cleaners. It holds the root layout, home page, SEO metadata routes, catalog pages, the cart, Stripe checkout, the post-payment page, static legal and info pages, and a Basic-Auth-protected admin area for DHL label fulfilment. Shared UI lives in `src/components`, and domain logic (products, orders, Stripe, DHL, mail, and shop config) lives in `src/lib`.

## Interface
- `layout.tsx`: `RootLayout({ children }: LayoutProps<"/">)` (default export) renders `<html lang="de">` and wraps all pages in `CartProvider`, `SiteHeader`, and `SiteFooter` from `@/components/*`. `metadata` sets `metadataBase` to `shop.siteUrl`, a title template `%s | ${shop.name}`, and OpenGraph locale `de_DE`. It imports self-hosted `@fontsource` fonts and `./globals.css`.
- `page.tsx`: `Home()` (default export) renders the hero, the featured `products` (`p.featured`) as `ProductCard`s, the shop promises, and the ritual section.
- `not-found.tsx`: `NotFound()` (default export) renders the 404 page with a link to `/produkte`.
- `robots.ts`: `robots(): MetadataRoute.Robots` allows `/`, disallows `/admin`, `/api`, `/warenkorb`, and `/bestellung`, and points to the sitemap at `${shop.siteUrl}/sitemap.xml`.
- `sitemap.ts`: `sitemap(): MetadataRoute.Sitemap` lists the static pages `""`, `/produkte`, `/pflege`, `/versand`, `/impressum`, `/datenschutz`, `/agb`, and `/widerrufsrecht`, plus `/produkte/<slug>` for every product.

| Route | Contract | Role |
| --- | --- | --- |
| `/admin` | [./admin/README.md](./admin/README.md) | Live Stripe order list and DHL label actions (Basic Auth) |
| `/agb` | [./agb/README.md](./agb/README.md) | Terms and conditions (placeholder) |
| `/api/*` | [./api/README.md](./api/README.md) | Route Handlers: checkout and admin label |
| `/bestellung/*` | [./bestellung/README.md](./bestellung/README.md) | Post-checkout success page |
| `/datenschutz` | [./datenschutz/README.md](./datenschutz/README.md) | Privacy policy (placeholder) |
| `/impressum` | [./impressum/README.md](./impressum/README.md) | Legal notice (placeholder) |
| `/pflege` | [./pflege/README.md](./pflege/README.md) | Care and safety guide |
| `/produkte` | [./produkte/README.md](./produkte/README.md) | Catalog with `?kategorie=` filter, and the `[slug]` detail pages |
| `/versand` | [./versand/README.md](./versand/README.md) | Shipping and payment info from `shop.shipping` |
| `/warenkorb` | [./warenkorb/README.md](./warenkorb/README.md) | Cart (`CartView`) and Stripe `cancel_url` |
| `/widerrufsrecht` | [./widerrufsrecht/README.md](./widerrufsrecht/README.md) | Right of withdrawal (placeholder) |

## Invariants
- Request-time data (`searchParams`, `connection()`, live Stripe) is read only inside `<Suspense>` boundaries (`produkte`, `bestellung/erfolg`, `admin`), as Cache Components requires.
- `/admin` and `/api/admin/*` have no authentication in their own code. They rely on the `proxy` Basic Auth in `src/proxy.ts` (`matcher: ["/admin/:path*", "/api/admin/:path*"]`).
- Prices, shipping, and weights for payment are computed on the server in `/api/checkout` from `@/lib/order` and `@/lib/shop`, never trusted from the client.
- Checkout flow: `/warenkorb` -> `POST /api/checkout` -> Stripe Checkout -> `/bestellung/erfolg?session_id=...` (success) or `/warenkorb` (cancel). Fulfilment: `/admin` -> `POST /api/admin/label`.
- Shipping text and amounts come from `shop.shipping` (`@/lib/shop`), not hard-coded values.
- Fonts are self-hosted via `@fontsource` (no requests to Google Fonts), as noted in `layout.tsx`.
- Non-public routes are excluded from indexing in both `robots.ts` and per-page `robots` metadata (`admin`, `warenkorb`, `bestellung/erfolg`).

## Side Effects
- None in the root-level files.
- Subtree side effects: Stripe API (checkout session create and retrieve; order listing and PaymentIntent metadata updates), DHL API (label purchase and fetch), and SMTP email (shipping notification). See the child contracts.

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
