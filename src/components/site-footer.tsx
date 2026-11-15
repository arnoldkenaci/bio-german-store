import Link from "next/link";
import { shop } from "@/lib/shop";
import { Logo } from "./logo";

const legal = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerrufsrecht", label: "Widerrufsrecht" },
  { href: "/versand", label: "Versand & Zahlung" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-sand-dark/60 bg-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-ink-soft">{shop.tagline}</p>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-xs font-semibold tracking-widest text-ink-soft uppercase">Shop</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/produkte" className="hover:text-copper">Alle Produkte</Link></li>
            <li><Link href="/pflege" className="hover:text-copper">Pflege & Anwendung</Link></li>
            <li><a href={`mailto:${shop.contactEmail}`} className="hover:text-copper">{shop.contactEmail}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-xs font-semibold tracking-widest text-ink-soft uppercase">Rechtliches</h2>
          <ul className="space-y-2 text-sm">
            {legal.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-copper">{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-sand-dark/60 px-4 py-4 text-center text-xs text-ink-soft">
        Alle Preise inkl. 19 % MwSt., zzgl. Versandkosten. © {shop.name}
      </p>
    </footer>
  );
}
