import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { shop } from "@/lib/shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/produkte", "/pflege", "/versand", "/impressum", "/datenschutz", "/agb", "/widerrufsrecht"];
  return [
    ...pages.map((path) => ({ url: `${shop.siteUrl}${path}` })),
    ...products.map((p) => ({ url: `${shop.siteUrl}/produkte/${p.slug}` })),
  ];
}
