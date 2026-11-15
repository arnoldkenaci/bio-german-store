import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { categories, getProduct, products } from "@/lib/products";
import { formatEUR, shop } from "@/lib/shop";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produkte/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    alternates: { canonical: `/produkte/${product.slug}` },
    openGraph: { title: product.name, description: product.tagline, images: product.images?.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/produkte/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== product.slug && p.featured).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    brand: { "@type": "Brand", name: shop.name },
    material: "Kupfer",
    image: product.images?.map((src) => `${shop.siteUrl}${src}`),
    ...(product.priceCents !== null && {
      offers: {
        "@type": "Offer",
        price: (product.priceCents / 100).toFixed(2),
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: `${shop.siteUrl}/produkte/${product.slug}`,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Brotkrumen" className="mb-6 text-sm text-ink-soft">
        <Link href="/produkte" className="hover:text-copper">Produkte</Link>
        <span className="mx-2">/</span>
        <Link href={`/produkte?kategorie=${product.category}`} className="hover:text-copper">
          {categories[product.category]}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-14">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-sand">
            <ProductImage product={product} priority sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((src, i) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-sand">
                  <ProductImage product={product} index={i + 1} sizes="12vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg text-ink-soft">{product.tagline}</p>
          <div className="mt-8">
            <AddToCart product={product} />
          </div>
          <ul className="mt-6 space-y-1 text-sm text-ink-soft">
            <li>✓ Versand aus Deutschland mit DHL, 1–3 Werktage</li>
            <li>✓ Kostenloser Versand ab {formatEUR(shop.shipping.freeFromCents)}</li>
            <li>✓ 14 Tage Widerrufsrecht</li>
          </ul>

          <div className="mt-10 space-y-4 leading-relaxed text-ink-soft">
            {product.description.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          {product.included && product.included.length > 0 && (
            <section className="mt-8">
              <h2 className="text-2xl">Lieferumfang</h2>
              <ul className="mt-2 list-disc pl-5 text-ink-soft">
                {product.included.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          )}

          {product.specs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-2xl">Details</h2>
              <dl className="mt-3 divide-y divide-sand-dark/70 border-y border-sand-dark/70 text-sm">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-ink-soft">{s.label}</dt>
                    <dd className="text-right">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <details className="mt-8 rounded-2xl bg-sand p-5">
            <summary className="cursor-pointer font-medium">Pflege & Sicherheitshinweise</summary>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
              {product.drinkware && (
                <>
                  <li>Nur für stilles Wasser. Keine säurehaltigen Getränke (Saft, Zitronenwasser), Milch oder kohlensäurehaltige Getränke einfüllen.</li>
                  <li>Nicht für Säuglinge und Kleinkinder.</li>
                </>
              )}
              <li>Nicht spülmaschinengeeignet. Von Hand reinigen und gut trocknen lassen.</li>
              <li>Dunkle Verfärbungen (Patina) sind natürlich und lassen sich mit Zitrone und Salz entfernen.</li>
            </ul>
            <Link href="/pflege" className="mt-3 inline-block text-sm text-copper underline">Ausführliche Pflegeanleitung</Link>
          </details>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-3xl">Das könnte dir auch gefallen</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
