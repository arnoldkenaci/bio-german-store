# Care & Usage Page (`/pflege`)

## Overview
Static content page with usage, cleaning, and safety guidance for copper bottles, cups, and tongue cleaners. Product pages link to it from the "Pflege & Sicherheitshinweise" section.

## Interface
- `Page()` (default export) in `page.tsx`: renders `<TextPage title="Pflege & Anwendung">` from `@/components/text-page`.
- `metadata`: title "Pflege & Anwendung" plus a description.

## Invariants
- Contains safety notices (still water only; no acidic, milk, or carbonated drinks; not for infants; not dishwasher-safe). These must stay consistent with the safety list in `produkte/[slug]/page.tsx`.

## Side Effects
- None

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
