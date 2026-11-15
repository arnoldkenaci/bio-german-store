# Product Listing Page (`/produkte`)

## Overview
Catalog listing with category filter chips driven by the `?kategorie=` query parameter. Product detail pages live in the child dynamic segment.

## Interface
- `ProductsPage({ searchParams }: PageProps<"/produkte">)` (default export) in `page.tsx`: renders the heading and `<Suspense fallback={<Grid category={undefined} />}>` around `Filtered`.
- `Filtered` (local async component): resolves `searchParams.kategorie` to a `Category`.
- `Grid({ category })` (local component): renders the category chips and the `ProductCard` grid.
- `metadata`: title "Alle Produkte" plus a description.
- Subdirectory: [./[slug]/README.md](./[slug]/README.md) - product detail page.

## Invariants
- `kategorie` is accepted only if `value in categories`. Any other value shows all products.
- `searchParams` is read only inside `<Suspense>`, as Cache Components requires. The fallback renders the unfiltered grid.

## Side Effects
- None

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
