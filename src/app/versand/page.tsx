import type { Metadata } from "next";
import { TextPage } from "@/components/text-page";
import { formatEUR, shop } from "@/lib/shop";

export const metadata: Metadata = { title: "Versand & Zahlung" };

export default function Page() {
  return (
    <TextPage title="Versand & Zahlung">
      <h2>Versand</h2>
      <p>
        Wir versenden innerhalb Deutschlands mit DHL Paket. Die Lieferzeit beträgt {shop.shipping.deliveryDays.min}–
        {shop.shipping.deliveryDays.max} Werktage nach Zahlungseingang.
      </p>
      <ul>
        <li>Versandkosten: {formatEUR(shop.shipping.costCents)}</li>
        <li>Kostenloser Versand ab einem Bestellwert von {formatEUR(shop.shipping.freeFromCents)}</li>
      </ul>
      <p>Sobald dein Paket unterwegs ist, erhältst du die DHL-Sendungsnummer per E-Mail.</p>
      <h2>Zahlung</h2>
      <p>
        Die Zahlung wird sicher über unseren Zahlungsdienstleister Stripe abgewickelt. Du kannst mit Kredit- oder Debitkarte,
        PayPal, Klarna, Apple Pay oder Google Pay bezahlen. Alle Preise enthalten die gesetzliche Mehrwertsteuer.
      </p>
    </TextPage>
  );
}
