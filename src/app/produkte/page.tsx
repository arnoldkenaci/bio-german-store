import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { categories, products, type Category } from "@/lib/products";

export const metadata: Metadata = {
  title: "Alle Produkte",
  description: "Kupferflaschen, Kupferbecher, Sets und Zungenreiniger aus reinem Kupfer – handgefertigt in Indien.",
};

export default function ProductsPage({ searchParams }: PageProps<"/produkte">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-5xl">Unsere Produkte</h1>
      <Suspense fallback={<Grid category={undefined} />}>
        <Filtered searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Filtered({ searchParams }: { searchParams: PageProps<"/produkte">["searchParams"] }) {
  const raw = (await searchParams).kategorie;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const category = value && value in categories ? (value as Category) : undefined;
  return <Grid category={category} />;
}

function Grid({ category }: { category: Category | undefined }) {
  const list = category ? products.filter((p) => p.category === category) : products;
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm ${
      active ? "border-ink bg-ink text-cream" : "border-sand-dark text-ink-soft hover:border-ink"
    }`;

  return (
    <>
      <nav aria-label="Kategorien" className="mt-8 mb-10 flex flex-wrap gap-2">
        <Link href="/produkte" className={chip(!category)}>Alle</Link>
        {(Object.keys(categories) as Category[]).map((c) => (
          <Link key={c} href={`/produkte?kategorie=${c}`} className={chip(category === c)}>
            {categories[c]}
          </Link>
        ))}
      </nav>
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </>
  );
}
