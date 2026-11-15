# components

## Overview

Shared React 19 UI components for the Next.js App Router storefront. The
directory holds the client-side cart state (`CartProvider` / `useCart`, saved
to `localStorage`), the cart and checkout UI (`AddToCart`, `CartView`,
`CartLink`, `ClearCart`), and server-renderable presentational components
(site chrome, product cards and images, legal text pages). The UI copy is in
German.

Files that start with `"use client"`: `cart.tsx`, `add-to-cart.tsx`,
`cart-link.tsx`, `cart-view.tsx`, `clear-cart.tsx`. The other files have no
directive. They render as Server Components unless a client component imports
them (`cart-view.tsx` imports `ProductImage`).

## Interface

### Cart state (`cart.tsx`, client)

- `type CartLine = { slug: string; variantId?: string; quantity: number }`.
- `CartProvider({ children })`: context provider. Mounted in
  `src/app/layout.tsx`.
- `useCart(): CartContextValue` returns `{ lines, count, ready, add(slug,
  variantId?, quantity = 1), setQuantity(slug, variantId, quantity),
  remove(slug, variantId?), clear() }`.
  - `count` is the sum of `quantity` across all `lines`.
  - `ready` becomes `true` after the first mount effect has loaded the cart from
    storage.
  - `CartContextValue` itself is not exported.

### Cart UI (client)

- `AddToCart({ product: Product })` (`add-to-cart.tsx`): variant radio group,
  quantity stepper, and an "In den Warenkorb" button that calls
  `add(product.slug, variantId, quantity)`.
  - When `variantPrice(product, variantId) === null`, it shows a "coming soon"
    message with a `mailto:` link to `shop.contactEmail` instead.
- `CartLink()` (`cart-link.tsx`): a link to `/warenkorb` with a count badge,
  shown only when `ready && count > 0`.
- `CartView()` (`cart-view.tsx`): the cart page body (used by
  `src/app/warenkorb/page.tsx`). It shows line items, subtotal, shipping
  (`shippingCents`), a free-shipping progress bar
  (`shop.shipping.freeFromCents`), and the checkout button.
- `ClearCart()` (`clear-cart.tsx`): renders `null` and calls `clear()` once
  `ready`. Used by `src/app/bestellung/erfolg/page.tsx`.

### Presentational

- `ProductImage({ product, index = 0, priority = false, sizes })`
  (`product-image.tsx`): a `next/image` with `fill`, using
  `product.images[index]`.
  - With no image, it falls back to a private `Placeholder` SVG. The SVG shape
    depends on `product.category` (`"pflege"`, `"becher"`, or the default
    bottle).
- `ProductCard({ product })` (`product-card.tsx`): a link to
  `/produkte/{slug}` that shows the image, name, and price.
  - When `product.priceCents === null`, it shows "Preis folgt" instead of a
    price.
- `SiteHeader()` (`site-header.tsx`): sticky header.
  - It has a free-shipping banner, `Logo`, `CartLink`, and desktop and mobile
    navigation built from the module constant `nav`.
- `SiteFooter()` (`site-footer.tsx`): footer.
  - It has `Logo`, `shop.tagline`, shop links, legal links from the module
    constant `legal` (`/impressum`, `/datenschutz`, `/agb`, `/widerrufsrecht`,
    `/versand`), and the VAT notice.
- `Logo()` (`logo.tsx`): an inline SVG tree mark with the text "India House".
- `TextPage({ title, children })` (`text-page.tsx`): layout wrapper for legal
  and info pages.
- `Placeholder({ what })` (`text-page.tsx`, exported): a dashed notice marking
  legal text that still has to be pasted in.
  - This is a different symbol from the private `Placeholder` in
    `product-image.tsx`.

### Dependencies (outside this package)

- `src/lib/products.ts`: `Product`, `lineKey`, `variantPrice`, `getProduct`.
- `src/lib/shop.ts`: `shop`, `formatEUR`, `shippingCents`.
- `src/app/api/checkout`: the HTTP endpoint that `CartView` calls.

## Invariants

- `useCart` throws `"useCart must be used inside <CartProvider>"` when called
  outside the provider (`cart.tsx:useCart`). Every cart UI component must render
  under `CartProvider`.
- Cart lines are identified by `lineKey(slug, variantId)`, which is `slug`, or
  `slug:variantId` when a variant is set (`src/lib/products.ts:lineKey`). At
  most one line exists per key (`cart.tsx:add` merges into an existing line).
- Quantity limits:
  - `add` caps a merged line at `shop.maxQuantityPerLine` (currently 10).
    It does not cap the quantity of a newly appended line. Callers such as
    `AddToCart` cap their own input to `[1, shop.maxQuantityPerLine]`.
  - `setQuantity` clamps to `[0, shop.maxQuantityPerLine]` and removes lines
    whose quantity reaches `0`. It never creates a line.
- Writes to `localStorage` are skipped until `ready` is `true`
  (`cart.tsx` second `useEffect`). This keeps the initial empty state from
  overwriting a stored cart.
- `load()` accepts only arrays and drops entries whose `slug` is not a string.
  Parse errors return `[]`.
- Consumers should check `ready` before showing cart-dependent UI:
  - `CartView` shows a loading message until `ready`.
  - `CartLink` hides the badge until `ready`.
  - `ClearCart` clears only once `ready`.
- `CartView` silently skips lines whose product is unknown (`getProduct`) or
  has no price (`variantPrice === null`). Only those resolved rows are sent to
  checkout.
- Prices are integer cents, formatted with `formatEUR`.

## Side Effects

- `localStorage` key `"ih-cart-v1"` (`cart.tsx:STORAGE_KEY`):
  - The cart is read on mount and written whenever `lines` changes after
    `ready`.
  - Write errors (for example in private mode) are swallowed, so the cart then
    exists only in memory.
- `window` `"storage"` event listener (`cart.tsx:CartProvider`): reloads the
  cart when another tab changes `STORAGE_KEY`. It is removed on unmount.
- `CartView.checkout` sends `POST /api/checkout` with JSON
  `{ items: CartLine[] }`.
  - On success it expects `{ url }` and calls `window.location.assign(url)`.
  - On a non-OK response or a missing `url`, it shows `data.error` or a
    fallback message.
- `ClearCart` empties the cart, and so the stored `localStorage` cart, when it
  mounts on the order-success page.

## Verification

- Run: `npm test` (from `/home/user/bio-german-store`; runs `tests/*.test.ts`
  with `tsx --test`)
- Also: `npm run lint` and `npm run build`
