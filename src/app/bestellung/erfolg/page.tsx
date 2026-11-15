import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearCart } from "@/components/clear-cart";
import { formatEUR } from "@/lib/shop";
import { stripe, stripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = { title: "Danke für deine Bestellung", robots: { index: false } };

export default function SuccessPage({ searchParams }: PageProps<"/bestellung/erfolg">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-copper uppercase">Bestellung erhalten</p>
      <h1 className="text-5xl">Vielen Dank!</h1>
      <Suspense fallback={<p className="mt-6 text-ink-soft">Bestellung wird geladen …</p>}>
        <Details searchParams={searchParams} />
      </Suspense>
      <p className="mt-6 text-ink-soft">
        Du erhältst gleich eine Bestätigung per E-Mail. Sobald dein Paket unterwegs ist, schicken wir dir die
        DHL-Sendungsnummer.
      </p>
      <Link href="/produkte" className="btn btn-outline mt-10">Weiter stöbern</Link>
    </div>
  );
}

async function Details({ searchParams }: { searchParams: PageProps<"/bestellung/erfolg">["searchParams"] }) {
  const raw = (await searchParams).session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;
  if (!sessionId?.startsWith("cs_") || !stripeConfigured()) return null;

  const session = await stripe()
    .checkout.sessions.retrieve(sessionId)
    .catch(() => null);
  if (!session) return null;
  if (session.payment_status !== "paid") {
    return <p className="mt-6 text-ink-soft">Deine Zahlung wird noch verarbeitet.</p>;
  }
  const name = session.collected_information?.shipping_details?.name?.split(" ")[0];
  return (
    <>
      {/* Empty the cart only once Stripe confirms the payment. */}
      <ClearCart />
      <p className="mt-6 text-lg">
        {name ? `${name}, deine` : "Deine"} Bestellung über <strong>{formatEUR(session.amount_total ?? 0)}</strong> ist
        bei uns eingegangen.
      </p>
    </>
  );
}
