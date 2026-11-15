# Datenschutzerklärung Page (`/datenschutz`)

## Overview
Static legal page. It currently shows a placeholder that the shop owner must replace with the real legal text before launch.

## Interface
- `Page()` (default export) in `page.tsx`: renders `<TextPage title="Datenschutzerklärung">` with `<Placeholder what="Datenschutzerklärung" />` from `@/components/text-page`.
- `metadata`: `{ title: "Datenschutzerklärung" }`.

## Invariants
- The route `/datenschutz` is listed in `sitemap.ts` and linked from the footer (`legal` in `src/components/site-footer.tsx`), so it must not be renamed or removed.
- The content is a placeholder (`Placeholder`) until real legal text is added.

## Side Effects
- None

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
