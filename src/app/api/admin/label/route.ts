import { createLabel, DhlError, dhlConfigured, fetchLabel, trackingUrl } from "@/lib/dhl";
import { sendShippingMail } from "@/lib/mail";
import { getOrder, markShipped } from "@/lib/orders";

// Access is protected by src/proxy.ts (HTTP Basic Auth for /admin and /api/admin).

function pdf(buffer: Buffer, shipmentNo: string): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="DHL-${shipmentNo}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

function fail(message: string, status: number): Response {
  return new Response(`Fehler: ${message}`, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Creates the DHL label for a paid order, stores the shipment number in Stripe and mails the customer. */
export async function POST(request: Request) {
  if (!dhlConfigured()) return fail("DHL-Zugangsdaten fehlen (siehe .env.example).", 503);

  const form = await request.formData();
  const sessionId = String(form.get("sessionId") ?? "");
  if (!sessionId.startsWith("cs_")) return fail("Ungültige Bestellung.", 400);

  const order = await getOrder(sessionId);
  if (!order || !order.paymentIntentId) return fail("Bestellung nicht gefunden oder nicht bezahlt.", 404);
  if (order.refunded) return fail("Bestellung wurde erstattet.", 409);
  if (!order.address?.line1 || !order.address.postal_code || !order.address.city || !order.address.country) {
    return fail("Lieferadresse unvollständig.", 422);
  }

  // Never buy a second label by accident: re-print the existing one instead.
  if (order.shipmentNo) {
    try {
      return pdf(await fetchLabel(order.shipmentNo), order.shipmentNo);
    } catch (err) {
      return fail(err instanceof DhlError ? err.message : "Label konnte nicht geladen werden.", 502);
    }
  }

  try {
    const { shipmentNo, labelPdf } = await createLabel({
      consignee: {
        name: order.name,
        line1: order.address.line1,
        line2: order.address.line2,
        postalCode: order.address.postal_code,
        city: order.address.city,
        country: order.address.country,
        email: order.email,
      },
      weightGrams: order.weightGrams,
      reference: order.paymentIntentId,
    });

    await markShipped(order.paymentIntentId, shipmentNo);

    if (order.email) {
      try {
        await sendShippingMail({
          to: order.email,
          name: order.name,
          shipmentNo,
          trackingUrl: trackingUrl(shipmentNo),
        });
      } catch (err) {
        console.error("Versandmail fehlgeschlagen", err); // label is valid; don't block printing
      }
    }

    return pdf(labelPdf, shipmentNo);
  } catch (err) {
    console.error("DHL label failed", err);
    return fail(err instanceof DhlError ? err.message : "Label konnte nicht erstellt werden.", 502);
  }
}

/** Re-print: GET /api/admin/label?shipment=00340434… */
export async function GET(request: Request) {
  if (!dhlConfigured()) return fail("DHL-Zugangsdaten fehlen.", 503);
  const shipmentNo = new URL(request.url).searchParams.get("shipment") ?? "";
  if (!/^[0-9A-Za-z]{8,40}$/.test(shipmentNo)) return fail("Ungültige Sendungsnummer.", 400);
  try {
    return pdf(await fetchLabel(shipmentNo), shipmentNo);
  } catch (err) {
    return fail(err instanceof DhlError ? err.message : "Label konnte nicht geladen werden.", 502);
  }
}
