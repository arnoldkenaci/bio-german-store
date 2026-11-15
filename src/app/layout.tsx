import type { Metadata } from "next";
// Fonts are self-hosted from npm (no requests to Google → nothing to declare in the privacy policy).
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { shop } from "@/lib/shop";

export const metadata: Metadata = {
  metadataBase: new URL(shop.siteUrl),
  title: {
    default: `${shop.name} – Kupferflaschen & Kupferbecher, handgefertigt in Indien`,
    template: `%s | ${shop.name}`,
  },
  description:
    "Handgefertigte Kupferflaschen, Kupferbecher und Zungenreiniger aus 100 % reinem Kupfer. Versand aus Deutschland, kostenlos ab 49 €.",
  openGraph: { type: "website", locale: "de_DE", siteName: shop.name },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
