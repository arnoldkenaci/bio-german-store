# Care & Usage Page (`/pflege`)

## Overview
Static content page with usage, cleaning, and safety guidance for copper bottles, cups, and tongue cleaners. Product pages link to it from the "Pflege & Sicherheitshinweise" section.

## Interface
- `Page()` (default export) in `page.tsx`: renders `<TextPage title="Pflege & Anwendung">` from `@/components/text-page`, with the shared notes from `@/lib/care` plus page-only usage tips.
- `metadata`: title "Pflege & Anwendung" plus a description.

## Invariants
- The safety and care lists come from `drinkwareSafetyNotes` and `copperCareNotes` in `@/lib/care`, the same source the product pages use. Change the notes there, not in this page.

## Side Effects
- None

## Verification
- Run: `npm test` (from the repository root; also `npm run lint` and `npm run build`)
