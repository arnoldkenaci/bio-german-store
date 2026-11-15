# Product Detail Page (`/produkte/[slug]`)

## Overview
Statically generated product detail page with an image gallery, add-to-cart, description, contents, specs, care notes, related products, and schema.org Product JSON-LD.

## Interface
- `generateStaticParams()` in `page.tsx`: returns one `{ slug }` for each entry in `products` (`@/lib/products`).
- `generateMetadata({ params })` in `page.tsx`: sets title, description (`tagline`), canonical `/produkte/<slug>`, and an OpenGraph image (the first image). Returns `{}` for an unknown slug.
- `ProductPage({ params }: PageProps<"/produkte/[slug]">)` (default export) in `page.tsx`.
- Uses `AddToCart` (`@/components/add-to-cart`), `ProductCard` (`@/components/product-card`), `ProductImage` (`@/components/product-image`), `categories`, `getProduct`, `products` (`@/lib/products`), and `formatEUR`, `shop` (`@/lib/shop`).

## Invariants
- An unknown slug calls `notFound()`.
- JSON-LD `offers` is included only when `product.priceCents !== null`. The price is `priceCents / 100` with 2 decimals, in EUR. JSON is escaped with `.replace(/</g, "\\u003c")` before `dangerouslySetInnerHTML`.
- Related products: up to 3 other products with `featured` set.
- Drinkware-specific safety notes are shown only when `product.drinkware` is true.
- The free-shipping threshold comes from `shop.shipping.freeFromCents`.

## Side Effects
- None (build-time static generation from in-repo catalog data).

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
