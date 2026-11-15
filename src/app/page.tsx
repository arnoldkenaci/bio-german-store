import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";
import { formatEUR, shop } from "@/lib/shop";

const promises = [
  { title: "100 % reines Kupfer", text: "Gefertigt aus massivem Kupfer – langlebig und mit warmem Glanz." },
  { title: "Handgefertigt in Indien", text: "Von Kunsthandwerkern gefertigt – jedes Stück ein Unikat." },
  { title: "Versand aus Deutschland", text: `In 1–3 Werktagen bei dir, kostenlos ab ${formatEUR(shop.shipping.freeFromCents)}.` },
  { title: "Schön verpackt", text: "Mit Tragebeutel und Geschenkverpackung – bereit zum Verschenken." },
];

export default function Home() {
  const featured = products.filter((p) => p.featured);

  return (
    <>
      <section className="relative overflow-hidden bg-sand">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-copper uppercase">Ayurvedische Tradition</p>
            <h1 className="text-5xl sm:text-6xl">
              Reines Kupfer.
              <br />
              <em className="text-copper">Reines Gleichgewicht.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink-soft">
              Handgefertigte Kupferflaschen und -becher für dein tägliches Ritual – zeitlos schön und gemacht für viele Jahre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/produkte" className="btn btn-primary">Jetzt entdecken</Link>
              <Link href="/pflege" className="btn btn-outline">Pflege & Anwendung</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-6 rounded-full bg-cream" />
            {/* Replace with a brand photo: <Image src="/hero.jpg" fill … /> */}
            <svg viewBox="0 0 200 220" className="relative h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="hero-cu" x1="0" x2="1">
                  <stop offset="0" stopColor="#8f4a1f" />
                  <stop offset="0.45" stopColor="#e0a679" />
                  <stop offset="1" stopColor="#a35a29" />
                </linearGradient>
              </defs>
              <ellipse cx="100" cy="200" rx="50" ry="6" fill="#3a2a1e" opacity="0.15" />
              <rect x="86" y="22" width="28" height="16" rx="4" fill="url(#hero-cu)" />
              <path d="M82 38 h36 v14 q16 9 16 30 v104 q0 12 -12 12 h-44 q-12 0 -12 -12 v-104 q0 -21 16 -30 Z" fill="url(#hero-cu)" />
              {[70, 90, 110, 130, 150, 170].map((y) => (
                <circle key={y} cx="100" cy={y} r="6" fill="none" stroke="#f8f3ec" strokeOpacity="0.5" strokeWidth="1.2" />
              ))}
            </svg>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="text-4xl">Unsere Lieblinge</h2>
          <Link href="/produkte" className="text-sm text-copper hover:underline">Alle Produkte →</Link>
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-sand-dark/60 bg-cream">
        <ul className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {promises.map((p) => (
            <li key={p.title}>
              <h3 className="text-2xl">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
        <div className="rounded-3xl bg-sand p-10">
          <p className="font-serif text-3xl leading-snug italic">
            „Am Abend füllen, am Morgen genießen – ein kleines Ritual, das den Tag bewusst beginnen lässt.“
          </p>
        </div>
        <div>
          <h2 className="text-4xl">Dein Morgenritual</h2>
          <p className="mt-4 text-ink-soft">
            In Indien wird Wasser seit Generationen in Kupfergefäßen aufbewahrt. Fülle deine Flasche am Abend mit stillem Wasser,
            lass sie über Nacht stehen und starte mit einem Glas in den Tag. Kombiniert mit dem Zungenreiniger aus Kupfer
            wird daraus deine tägliche ayurvedische Morgenroutine.
          </p>
          <Link href="/pflege" className="btn btn-outline mt-6">So pflegst du Kupfer</Link>
        </div>
      </section>
    </>
  );
}
