import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { buildShipmentRequest, createLabel, DhlError, fetchLabel } from "../src/lib/dhl";

const ENV = {
  DHL_API_KEY: "key",
  DHL_USER: "user-valid",
  DHL_PASSWORD: "SandboxPasswort2023!",
  DHL_BILLING_NUMBER: "33333333330101",
  SHIPPER_NAME: "India House",
  SHIPPER_STREET: "Musterweg",
  SHIPPER_HOUSE: "1",
  SHIPPER_POSTAL_CODE: "10115",
  SHIPPER_CITY: "Berlin",
};

const consignee = {
  name: "Erika Mustermann",
  line1: "Hauptstraße 5",
  line2: "Hinterhaus",
  postalCode: "53113",
  city: "Bonn",
  country: "DE",
  email: "erika@example.de",
};

const realFetch = globalThis.fetch;
beforeEach(() => Object.assign(process.env, ENV));
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("maps a Stripe address to a DHL v2 shipment", () => {
  const body = buildShipmentRequest({ consignee, weightGrams: 1234.4, reference: "pi_123" });
  const s = body.shipments[0];
  assert.equal(s.product, "V01PAK");
  assert.equal(s.billingNumber, "33333333330101");
  assert.equal(s.consignee.country, "DEU");
  assert.equal(s.consignee.addressStreet, "Hauptstraße 5");
  assert.equal(s.consignee.additionalAddressInformation1, "Hinterhaus");
  assert.deepEqual(s.details.weight, { uom: "g", value: 1234 });
  assert.ok(s.refNo.length >= 8);
});

test("rejects countries we do not ship to", () => {
  assert.throws(() => buildShipmentRequest({ consignee: { ...consignee, country: "US" }, weightGrams: 500, reference: "pi_1" }), DhlError);
});

test("createLabel calls the sandbox with auth headers and returns the PDF", async () => {
  let seen: { url: string; init: RequestInit } | undefined;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    seen = { url, init };
    return Response.json({ items: [{ shipmentNo: "00340434161094042557", label: { b64: Buffer.from("%PDF-1.4").toString("base64") } }] });
  }) as typeof fetch;

  const result = await createLabel({ consignee, weightGrams: 900, reference: "pi_123" });
  assert.equal(result.shipmentNo, "00340434161094042557");
  assert.equal(result.labelPdf.toString(), "%PDF-1.4");
  assert.ok(seen!.url.startsWith("https://api-sandbox.dhl.com/parcel/de/shipping/v2/orders?includeDocs=include"));
  const headers = seen!.init.headers as Record<string, string>;
  assert.equal(headers["dhl-api-key"], "key");
  assert.equal(headers.Authorization, `Basic ${Buffer.from("user-valid:SandboxPasswort2023!").toString("base64")}`);
});

test("createLabel surfaces DHL validation messages", async () => {
  globalThis.fetch = (async () =>
    Response.json(
      { status: { title: "Bad Request" }, items: [{ validationMessages: [{ property: "consignee.postalCode", validationMessage: "Ungültige PLZ", validationState: "Error" }] }] },
      { status: 400 },
    )) as typeof fetch;
  await assert.rejects(createLabel({ consignee, weightGrams: 900, reference: "pi_1" }), /consignee.postalCode: Ungültige PLZ/);
});

test("production URL is used when DHL_SANDBOX=false", async () => {
  process.env.DHL_SANDBOX = "false";
  let url = "";
  globalThis.fetch = (async (u: string) => {
    url = u;
    return Response.json({ items: [{ label: { b64: "JVBERg==" } }] });
  }) as typeof fetch;
  await fetchLabel("00340434161094042557");
  delete process.env.DHL_SANDBOX;
  assert.ok(url.startsWith("https://api-eu.dhl.com/parcel/de/shipping/v2/orders?shipment=00340434161094042557"));
});
