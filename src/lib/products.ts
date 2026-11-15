/**
 * Produktkatalog — the single source of truth for everything sold in the shop.
 *
 * Edit this file to change products, prices or texts. Prices are in cents
 * and include 19 % VAT. A product with `priceCents: null` is shown as
 * "Preis folgt" and cannot be added to the cart.
 *
 * Images: put files in /public/products/<slug>/ and list them in `images`
 * (e.g. "/products/kupferflasche-7-chakra/1.jpg"). Without images a neutral
 * copper placeholder is shown.
 */

export type Variant = {
  /** Stable id, used in the cart and on the DHL/Stripe order (e.g. "natur"). */
  id: string;
  /** Label shown to customers (e.g. "Beutel Natur"). */
  name: string;
  /** Optional price override in cents. */
  priceCents?: number;
};

export type Category = "flaschen" | "sets" | "becher" | "pflege";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  /** One sentence for cards and meta description. */
  tagline: string;
  /** Paragraphs for the product page. */
  description: string[];
  /** Gross price in cents (incl. 19 % MwSt.), or null if not yet set. */
  priceCents: number | null;
  /** Shipping weight incl. product packaging, in grams. Used for the DHL label. */
  weightGrams: number;
  images?: string[];
  variants?: Variant[];
  /** Label for the variant picker, e.g. "Farbe des Beutels". */
  variantLabel?: string;
  /** Key facts shown as a table. Only filled rows are displayed. */
  specs: { label: string; value: string }[];
  /** What is in the box. */
  included?: string[];
  /** Show the food-contact usage notes (bottles, cups, mugs). */
  drinkware: boolean;
  featured?: boolean;
};

export const categories: Record<Category, string> = {
  flaschen: "Kupferflaschen",
  sets: "Sets",
  becher: "Becher",
  pflege: "Körperpflege",
};

export const products: Product[] = [
  {
    slug: "kupferflasche-7-chakra",
    name: "Kupferflasche 7 Chakra",
    category: "flaschen",
    tagline:
      "Handgefertigte Flasche aus reinem Kupfer mit eingravierten Chakra-Symbolen – inklusive gehäkeltem Tragebeutel.",
    description: [
      "Unsere Kupferflasche wird in Indien aus 100 % reinem Kupfer von Hand gefertigt. Die sieben Chakra-Symbole sind fein in die Oberfläche graviert – jedes Stück ist ein kleines Unikat.",
      "In der ayurvedischen Tradition wird Wasser seit Jahrhunderten in Kupfergefäßen aufbewahrt. Fülle die Flasche am Abend mit stillem Wasser und genieße es am Morgen.",
      "Geliefert wird sie mit einem handgehäkelten Tragebeutel aus Baumwolle – ideal für unterwegs, Yoga oder als Geschenk.",
    ],
    priceCents: 5599,
    weightGrams: 700,
    variantLabel: "Farbe des Beutels",
    // TODO: echte Varianten aus Amazon übernehmen (5 Farben laut Brand Store)
    variants: [],
    specs: [
      { label: "Material", value: "100 % reines Kupfer" },
      { label: "Herstellung", value: "Handgefertigt in Indien" },
      // TODO: Füllmenge, Maße und Gewicht ergänzen
    ],
    included: ["Kupferflasche", "Gehäkelter Tragebeutel", "Geschenkverpackung"],
    drinkware: true,
    featured: true,
  },
  {
    slug: "kupferflasche-nahtlos",
    name: "Nahtlose Kupferflasche, auslaufsicher",
    category: "flaschen",
    tagline:
      "Aus einem Stück gefertigt, ohne Schweißnaht – auslaufsicher verschlossen, mit Tragebeutel und Geschenkrolle.",
    description: [
      "Diese Kupferflasche ist nahtlos aus einem Stück gefertigt. Ohne Schweißnaht ist sie besonders robust und leicht zu reinigen.",
      "Der Schraubverschluss mit Dichtung hält die Flasche zuverlässig dicht – für Tasche, Büro und Yogamatte.",
      "Geliefert in einer Geschenkrolle aus Kraftpapier mit gehäkeltem Tragebeutel.",
    ],
    priceCents: 4899,
    weightGrams: 700,
    variantLabel: "Farbe des Beutels",
    variants: [], // TODO: Varianten ergänzen
    specs: [
      { label: "Material", value: "100 % reines Kupfer" },
      { label: "Verarbeitung", value: "Nahtlos, ohne Schweißnaht" },
    ],
    included: ["Kupferflasche", "Gehäkelter Tragebeutel", "Geschenkrolle"],
    drinkware: true,
    featured: true,
  },
  {
    slug: "kupferflasche-klassik",
    name: "Kupferflasche Klassik",
    category: "flaschen",
    tagline: "Schlichte, glatte Kupferflasche – zeitlos und auslaufsicher.",
    description: [
      "Die klassische Form mit glatter Oberfläche bringt den warmen Glanz des Kupfers zur Geltung.",
      "Handgefertigt aus 100 % reinem Kupfer, mit auslaufsicherem Schraubverschluss.",
    ],
    priceCents: null, // TODO: Preis eintragen
    weightGrams: 650,
    specs: [{ label: "Material", value: "100 % reines Kupfer" }],
    included: ["Kupferflasche", "Gehäkelter Tragebeutel"],
    drinkware: true,
  },
  {
    slug: "kupferflasche-graviert",
    name: "Handgravierte Kupferflasche",
    category: "flaschen",
    tagline: "Mit filigranem, von Hand graviertem Muster rundum – ein echtes Schmuckstück.",
    description: [
      "Das umlaufende Ornament wird von Kunsthandwerkern von Hand in das Kupfer graviert. Dadurch ist jede Flasche ein Unikat.",
      "Ein besonderes Geschenk für alle, die schöne Dinge im Alltag lieben.",
    ],
    priceCents: null, // TODO: Preis eintragen
    weightGrams: 700,
    specs: [
      { label: "Material", value: "100 % reines Kupfer" },
      { label: "Verzierung", value: "Handgraviert" },
    ],
    included: ["Kupferflasche", "Gehäkelter Tragebeutel"],
    drinkware: true,
    featured: true,
  },
  {
    slug: "kupferflaschen-set",
    name: "Kupferflaschen-Set mit 2 Bechern",
    category: "sets",
    tagline: "Kupferflasche und zwei passende Becher – das Geschenkset für zwei.",
    description: [
      "Flasche und zwei Becher aus reinem Kupfer mit passenden Gravuren – schön auf dem Tisch, im Yogaraum oder auf dem Nachttisch.",
      "Ein stimmiges Geschenk zu Weihnachten, Hochzeit oder Einzug.",
    ],
    priceCents: null, // TODO: Preis eintragen
    weightGrams: 1100,
    specs: [{ label: "Material", value: "100 % reines Kupfer" }],
    included: ["Kupferflasche", "2 Kupferbecher"],
    drinkware: true,
    featured: true,
  },
  {
    slug: "kupferbecher-set",
    name: "Kupferbecher-Set (2 Stück)",
    category: "becher",
    tagline: "Zwei Becher aus reinem Kupfer mit Henkel – schwer, robust, zeitlos.",
    description: [
      "Zwei Becher aus massivem Kupfer mit stabilem Henkel. Sie liegen gut in der Hand und entwickeln mit der Zeit eine schöne Patina.",
    ],
    priceCents: null, // TODO: Preis eintragen
    weightGrams: 900,
    specs: [{ label: "Material", value: "100 % reines Kupfer" }],
    included: ["2 Kupferbecher"],
    drinkware: true,
  },
  {
    slug: "zungenreiniger-kupfer",
    name: "Zungenreiniger aus Kupfer",
    category: "pflege",
    tagline: "Der traditionelle Zungenschaber aus Kupfer für die tägliche Mundpflege.",
    description: [
      "Das Zungenschaben ist fester Bestandteil der ayurvedischen Morgenroutine. Unser Zungenreiniger ist aus einem Stück Kupfer gefertigt und mit griffigen Enden versehen.",
      "Nach jeder Anwendung mit warmem Wasser abspülen und trocknen lassen.",
    ],
    priceCents: null, // TODO: Preis eintragen
    weightGrams: 80,
    specs: [{ label: "Material", value: "Kupfer" }],
    included: ["Zungenreiniger"],
    drinkware: false,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function variantPrice(product: Product, variantId?: string): number | null {
  const variant = product.variants?.find((v) => v.id === variantId);
  return variant?.priceCents ?? product.priceCents;
}

/** Cart line key: "<slug>" or "<slug>:<variantId>". */
export function lineKey(slug: string, variantId?: string): string {
  return variantId ? `${slug}:${variantId}` : slug;
}

export function parseLineKey(key: string): { slug: string; variantId?: string } {
  const [slug, variantId] = key.split(":");
  return { slug, variantId: variantId || undefined };
}
