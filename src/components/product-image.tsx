import Image from "next/image";
import type { Product } from "@/lib/products";

/** Shows the first product photo, or a copper placeholder illustration until photos are added. */
export function ProductImage({
  product,
  index = 0,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  product: Product;
  index?: number;
  priority?: boolean;
  sizes?: string;
}) {
  const src = product.images?.[index];
  if (src) {
    return (
      <Image
        src={src}
        alt={product.name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }
  return <Placeholder product={product} />;
}

function Placeholder({ product }: { product: Product }) {
  const id = `g-${product.slug}`;
  const shape =
    product.category === "pflege" ? (
      <path d="M70 60 Q100 20 130 60 L130 190 M70 60 L70 190" fill="none" stroke={`url(#${id})`} strokeWidth="9" strokeLinecap="round" />
    ) : product.category === "becher" ? (
      <g>
        <rect x="55" y="95" width="60" height="85" rx="6" fill={`url(#${id})`} />
        <path d="M115 115 h12 a14 14 0 0 1 0 40 h-12" fill="none" stroke={`url(#${id})`} strokeWidth="7" />
      </g>
    ) : (
      <g>
        <rect x="88" y="28" width="24" height="14" rx="3" fill={`url(#${id})`} />
        <path d="M84 42 h32 v14 q14 8 14 26 v98 q0 10 -10 10 h-40 q-10 0 -10 -10 v-98 q0 -18 14 -26 Z" fill={`url(#${id})`} />
        <circle cx="100" cy="120" r="14" fill="none" stroke="#f8f3ec" strokeOpacity="0.45" strokeWidth="1.5" />
        <circle cx="100" cy="120" r="7" fill="none" stroke="#f8f3ec" strokeOpacity="0.45" strokeWidth="1.5" />
      </g>
    );
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sand to-sand-dark/70">
      <svg viewBox="0 0 200 210" className="h-3/4 w-3/4" role="img" aria-label={`${product.name} (Foto folgt)`}>
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="0" stopColor="#8f4a1f" />
            <stop offset="0.45" stopColor="#d89a6a" />
            <stop offset="1" stopColor="#a35a29" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="196" rx="55" ry="6" fill="#3a2a1e" opacity="0.12" />
        {shape}
      </svg>
    </div>
  );
}
