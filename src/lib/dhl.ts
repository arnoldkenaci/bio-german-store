import "server-only";

/**
 * DHL Parcel DE Shipping API v2 (Geschäftskunden-Versand).
 * Docs: https://developer.dhl.com/api-reference/parcel-de-shipping-post-parcel-germany-v2
 *
 * Needs a DHL Geschäftskundenkonto (for production) and an app on
 * developer.dhl.com (for the API key). In sandbox mode the public test
 * credentials from the DHL docs can be used.
 */

const BASE = {
  sandbox: "https://api-sandbox.dhl.com/parcel/de/shipping/v2",
  production: "https://api-eu.dhl.com/parcel/de/shipping/v2",
};

export type Consignee = {
  name: string;
  line1: string;
  line2?: string | null;
  postalCode: string;
  city: string;
  /** ISO-2 country code as delivered by Stripe, e.g. "DE". */
  country: string;
  email?: string | null;
};

export type LabelResult = { shipmentNo: string; labelPdf: Buffer };

export class DhlError extends Error {}

const ISO3: Record<string, string> = { DE: "DEU", AT: "AUT", NL: "NLD", BE: "BEL", FR: "FRA", LU: "LUX", CH: "CHE" };

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new DhlError(`${name} ist nicht gesetzt.`);
  return value;
}

export function dhlConfigured(): boolean {
  return ["DHL_API_KEY", "DHL_USER", "DHL_PASSWORD", "DHL_BILLING_NUMBER", "SHIPPER_NAME"].every(
    (k) => Boolean(process.env[k]),
  );
}

function baseUrl(): string {
  return process.env.DHL_SANDBOX === "false" ? BASE.production : BASE.sandbox;
}

function headers(): HeadersInit {
  const basic = Buffer.from(`${env("DHL_USER")}:${env("DHL_PASSWORD")}`).toString("base64");
  return {
    "dhl-api-key": env("DHL_API_KEY"),
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "de-DE",
  };
}

/** DHL limits name/address fields to 50 characters. */
const clip = (s: string) => s.trim().slice(0, 50);

export function buildShipmentRequest(params: {
  consignee: Consignee;
  weightGrams: number;
  reference: string;
}) {
  const { consignee, weightGrams, reference } = params;
  const country = ISO3[consignee.country.toUpperCase()];
  if (!country) throw new DhlError(`Versand nach ${consignee.country} ist nicht eingerichtet.`);

  return {
    profile: "STANDARD_GRUPPENPROFIL",
    shipments: [
      {
        // V01PAK = DHL Paket national. Use V53WPAK for DHL Paket International.
        product: country === "DEU" ? "V01PAK" : "V53WPAK",
        billingNumber: env("DHL_BILLING_NUMBER"),
        refNo: reference.slice(0, 35).padEnd(8, "-"),
        shipper: {
          name1: clip(env("SHIPPER_NAME")),
          addressStreet: clip(env("SHIPPER_STREET")),
          addressHouse: process.env.SHIPPER_HOUSE ?? "",
          postalCode: env("SHIPPER_POSTAL_CODE"),
          city: clip(env("SHIPPER_CITY")),
          country: "DEU",
          email: process.env.SHIPPER_EMAIL,
        },
        consignee: {
          name1: clip(consignee.name),
          // Stripe delivers "Straße Hausnummer" in one line; DHL v2 accepts that in addressStreet.
          addressStreet: clip(consignee.line1),
          ...(consignee.line2 ? { additionalAddressInformation1: clip(consignee.line2) } : {}),
          postalCode: consignee.postalCode.trim(),
          city: clip(consignee.city),
          country,
          ...(consignee.email ? { email: consignee.email } : {}),
        },
        details: {
          weight: { uom: "g", value: Math.max(100, Math.round(weightGrams)) },
        },
      },
    ],
  };
}

type DhlItem = {
  shipmentNo?: string;
  sstatus?: { title?: string; statusCode?: number; detail?: string };
  label?: { b64?: string };
  validationMessages?: { property?: string; validationMessage?: string; validationState?: string }[];
};

type DhlResponse = { status?: { title?: string; detail?: string }; items?: DhlItem[] };

function describeError(body: DhlResponse | null, httpStatus: number): string {
  const item = body?.items?.[0];
  const messages = item?.validationMessages
    ?.filter((m) => m.validationState === "Error" || !m.validationState)
    .map((m) => [m.property, m.validationMessage].filter(Boolean).join(": "));
  return (
    messages?.join("; ") ||
    item?.sstatus?.detail ||
    body?.status?.detail ||
    body?.status?.title ||
    `DHL-Fehler (HTTP ${httpStatus})`
  );
}

async function parse(res: Response): Promise<DhlResponse | null> {
  try {
    return (await res.json()) as DhlResponse;
  } catch {
    return null;
  }
}

/** Creates a shipment and returns the shipment number + label PDF. */
export async function createLabel(params: {
  consignee: Consignee;
  weightGrams: number;
  reference: string;
}): Promise<LabelResult> {
  const body = buildShipmentRequest(params);
  const url = `${baseUrl()}/orders?includeDocs=include&docFormat=PDF&printFormat=${
    process.env.DHL_PRINT_FORMAT ?? "910-300-700"
  }`;
  const res = await fetch(url, { method: "POST", headers: headers(), body: JSON.stringify(body) });
  const json = await parse(res);
  const item = json?.items?.[0];
  if (!res.ok || !item?.shipmentNo || !item.label?.b64) {
    throw new DhlError(describeError(json, res.status));
  }
  return { shipmentNo: item.shipmentNo, labelPdf: Buffer.from(item.label.b64, "base64") };
}

/** Re-downloads the label of an existing shipment (e.g. to print it again). */
export async function fetchLabel(shipmentNo: string): Promise<Buffer> {
  const url = `${baseUrl()}/orders?shipment=${encodeURIComponent(shipmentNo)}&docFormat=PDF&printFormat=${
    process.env.DHL_PRINT_FORMAT ?? "910-300-700"
  }`;
  const res = await fetch(url, { headers: headers() });
  const json = await parse(res);
  const b64 = json?.items?.[0]?.label?.b64;
  if (!res.ok || !b64) throw new DhlError(describeError(json, res.status));
  return Buffer.from(b64, "base64");
}

export function trackingUrl(shipmentNo: string): string {
  return `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${encodeURIComponent(
    shipmentNo,
  )}`;
}
