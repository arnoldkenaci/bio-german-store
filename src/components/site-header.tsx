import Link from "next/link";
import { formatEUR, shop } from "@/lib/shop";
import { CartLink } from "./cart-link";
import { Logo } from "./logo";

const nav = [
  { href: "/produkte", label: "Alle Produkte" },
  { href: "/produkte?kategorie=flaschen", label: "Kupferflaschen" },
  { href: "/produkte?kategorie=sets", label: "Sets" },
  { href: "/pflege", label: "Pflege & Anwendung" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-sand-dark/60 bg-cream/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center text-xs tracking-wide text-cream">
        Kostenloser Versand ab {formatEUR(shop.shipping.freeFromCents)} · Versand aus Deutschland mit DHL
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label={`${shop.name} – Startseite`}>
          <Logo />
        </Link>
        <nav aria-label="Hauptnavigation" className="hidden gap-7 text-sm md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink-soft hover:text-copper">
              {item.label}
            </Link>
          ))}
        </nav>
        <CartLink />
      </div>
      <nav
        aria-label="Hauptnavigation mobil"
        className="flex gap-5 overflow-x-auto px-4 pb-3 text-sm whitespace-nowrap md:hidden"
      >
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="text-ink-soft hover:text-copper">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
