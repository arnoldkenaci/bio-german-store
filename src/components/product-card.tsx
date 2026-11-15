import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatEUR } from "@/lib/shop";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produkte/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">
          <ProductImage product={product} />
        </div>
      </div>
      <h3 className="mt-4 text-xl group-hover:text-copper">{product.name}</h3>
      <p className="mt-1 text-sm text-ink-soft">
        {product.priceCents === null ? "Preis folgt" : formatEUR(product.priceCents)}
      </p>
    </Link>
  );
}
