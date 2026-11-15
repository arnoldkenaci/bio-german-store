# India House – Online-Shop

Custom shop for India House copper products (Germany). Next.js 16 + Stripe Checkout + DHL Parcel DE API.
No database, no paid platform: **Stripe is the order database**, products live in one file.

## How it works

| Part | Where |
|---|---|
| Products, prices, texts | `src/lib/products.ts` (prices in cents, gross) |
| Shipping cost, free-shipping threshold | `src/lib/shop.ts` |
| Cart | browser `localStorage` (`src/components/cart.tsx`) |
| Checkout | `POST /api/checkout` → Stripe Checkout (cards, PayPal, Klarna, Apple/Google Pay) |
| Order confirmation e-mail | sent by Stripe (enable *Settings → Customer emails → Successful payments*) |
| Orders | `/admin` (Basic Auth) lists paid Checkout sessions from Stripe |
| Shipping | "Label erstellen" in `/admin` → DHL label PDF, shipment number saved on the Stripe payment, tracking e-mail via SMTP |
| Refunds | Stripe dashboard (link in `/admin`) |
| Legal pages | `src/app/{impressum,datenschutz,agb,widerrufsrecht}/page.tsx` – paste your texts |

## Local development

```bash
npm install
cp .env.example .env.local   # fill in at least STRIPE_SECRET_KEY (test key) and ADMIN_*
npm run dev                  # http://localhost:3000
npm test                     # unit tests (order logic, DHL mapping)
npm run lint && npm run build
```

Test payments: Stripe test card `4242 4242 4242 4242`, any future date, any CVC.

## Going live – checklist

1. **Product data**: fill the `TODO`s in `src/lib/products.ts` (prices, variants, specs) and put photos in
   `public/products/<slug>/` (square or 4:5, ≥ 1600 px, JPG/WebP).
2. **Stripe**: activate the account, turn on payment methods (PayPal, Klarna, Apple Pay, Google Pay) under
   *Settings → Payment methods*, create an inclusive 19 % tax rate → `STRIPE_TAX_RATE_ID`, enable customer receipts,
   set your business details (they appear on receipts).
3. **DHL**: Geschäftskundenkonto → API user + billing number (EKP + `0101` for DHL Paket); app on
   developer.dhl.com → API key. Test with `DHL_SANDBOX=true` first, then `false`.
4. **SMTP**: mailbox of your domain for the tracking e-mail.
5. **Legal texts** in the four legal pages.
6. **Deploy** (below), set `NEXT_PUBLIC_SITE_URL` to the real domain, place a test order, create a sandbox label.

## Hosting (cheap)

The app builds to a self-contained Node server (`output: "standalone"`).

- **Recommended – own small VPS in Germany** (e.g. Hetzner CX22, ~4–5 €/month): install Docker,
  `docker build --build-arg NEXT_PUBLIC_SITE_URL=https://www.your-domain.de -t india-house .`,
  `docker run -d --env-file .env -p 3000:3000 --restart unless-stopped india-house`, and put
  [Caddy](https://caddyserver.com) in front for automatic HTTPS (`your-domain.de { reverse_proxy localhost:3000 }`).
- Alternatives: Render / Railway / Fly.io (Docker). Note: Vercel's free Hobby plan does not allow commercial use.

## Notes

- Payment methods and receipts are configured in the Stripe dashboard, not in code.
- The checkout button on Stripe reads "Bezahlen"; the hint text below it states that the order is binding
  (`custom_text.submit` in `src/app/api/checkout/route.ts`).
- Unknown product URLs show the 404 page with `noindex` but HTTP status 200 (Next.js streaming).
- No tracking or analytics is built in; the only browser storage is the cart (localStorage). Adding analytics later needs a consent banner.
- Stock is not tracked. Remove a product or set `priceCents: null` when it is sold out.
