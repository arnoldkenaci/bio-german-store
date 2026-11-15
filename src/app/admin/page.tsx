import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { dhlConfigured, trackingUrl } from "@/lib/dhl";
import { mailConfigured } from "@/lib/mail";
import { listOrders } from "@/lib/orders";
import { getProduct, parseLineKey } from "@/lib/products";
import { formatEUR } from "@/lib/shop";
import { stripeConfigured } from "@/lib/stripe";

// Protected by src/proxy.ts (Basic Auth).
export const metadata: Metadata = { title: "Bestellungen", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl">Bestellungen</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Bezahlte Bestellungen direkt aus Stripe. „Label erstellen“ bucht ein DHL-Label, speichert die Sendungsnummer in
        Stripe und schickt dem Kunden die Sendungsverfolgung. Erstattungen machst du im Stripe-Dashboard. Nach dem Drucken diese Seite neu laden.
      </p>
      <Suspense fallback={<p className="mt-8">Lade Bestellungen …</p>}>
        <Orders />
      </Suspense>
    </div>
  );
}

function itemLabel(key: string): string {
  const { slug, variantId } = parseLineKey(key);
  const product = getProduct(slug);
  const variant = product?.variants?.find((v) => v.id === variantId);
  return [product?.name ?? slug, variant?.name].filter(Boolean).join(" – ");
}

async function Orders() {
  await connection(); // always render at request time (env + live Stripe data)
  const status = [
    { label: "Stripe", ok: stripeConfigured() },
    { label: "DHL", ok: dhlConfigured() },
    { label: "E-Mail (SMTP)", ok: mailConfigured() },
  ];
  const statusBar = (
    <ul className="mt-6 flex flex-wrap gap-2 text-xs">
      {status.map((s) => (
        <li key={s.label} className={`rounded-full px-3 py-1 ${s.ok ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
          {s.label}: {s.ok ? "verbunden" : "nicht eingerichtet"}
        </li>
      ))}
    </ul>
  );

  if (!stripeConfigured()) return statusBar;

  let orders;
  try {
    orders = await listOrders();
  } catch (err) {
    console.error(err);
    return (
      <>
        {statusBar}
        <p className="mt-8 text-red-700">Bestellungen konnten nicht von Stripe geladen werden.</p>
      </>
    );
  }

  const open = orders.filter((o) => !o.shipmentNo && !o.refunded).length;

  return (
    <>
      {statusBar}
      <p className="mt-6 text-sm">
        <strong>{open}</strong> offene Bestellung{open === 1 ? "" : "en"} · {orders.length} insgesamt (neueste zuerst)
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-sand-dark/70 bg-white/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-sand text-xs tracking-wide text-ink-soft uppercase">
            <tr>
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Kunde & Adresse</th>
              <th className="px-4 py-3">Artikel</th>
              <th className="px-4 py-3">Summe</th>
              <th className="px-4 py-3">Versand</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-dark/60">
            {orders.map((o) => (
              <tr key={o.sessionId} className="align-top">
                <td className="px-4 py-3 whitespace-nowrap">
                  {o.created.toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Berlin" })}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.name}</p>
                  {o.address && (
                    <p className="text-ink-soft">
                      {o.address.line1}
                      {o.address.line2 ? `, ${o.address.line2}` : ""}, {o.address.postal_code} {o.address.city}
                    </p>
                  )}
                  {o.email && <p className="text-ink-soft">{o.email}</p>}
                </td>
                <td className="px-4 py-3">
                  <ul>
                    {o.items.map((i) => (
                      <li key={i.key}>{i.quantity}× {itemLabel(i.key)}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatEUR(o.totalCents)}
                  {o.paymentIntentId && (
                    <a
                      className="block text-xs text-copper underline"
                      href={`https://dashboard.stripe.com/payments/${o.paymentIntentId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      In Stripe öffnen
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">
                  {o.refunded ? (
                    <span className="rounded-full bg-sand px-2 py-1 text-xs">Erstattet</span>
                  ) : o.shipmentNo ? (
                    <div className="space-y-1">
                      <a href={trackingUrl(o.shipmentNo)} target="_blank" rel="noreferrer" className="block text-copper underline">
                        {o.shipmentNo}
                      </a>
                      <a href={`/api/admin/label?shipment=${o.shipmentNo}`} target="_blank" className="text-xs underline">
                        Label erneut drucken
                      </a>
                    </div>
                  ) : (
                    <form action="/api/admin/label" method="post" target="_blank">
                      <input type="hidden" name="sessionId" value={o.sessionId} />
                      <button className="btn btn-primary px-4 py-2 text-xs" disabled={!dhlConfigured()}>
                        Label erstellen
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">Noch keine bezahlten Bestellungen.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
