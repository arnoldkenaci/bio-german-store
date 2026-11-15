# Allgemeine Geschäftsbedingungen Page (`/agb`)

## Overview
Static legal page. It currently shows a placeholder that the shop owner must replace with the real legal text before launch.

## Interface
- `Page()` (default export) in `page.tsx`: renders `<TextPage title="Allgemeine Geschäftsbedingungen">` with `<Placeholder what="AGB" />` from `@/components/text-page`.
- `metadata`: `{ title: "Allgemeine Geschäftsbedingungen" }`.

## Invariants
- The route `/agb` is listed in `sitemap.ts` and linked from the footer (`legal` in `src/components/site-footer.tsx`) and from the Stripe checkout submit text in `/api/checkout`, so it must not be renamed or removed.
- The content is a placeholder (`Placeholder`) until real legal text is added.

## Side Effects
- None

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
