import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildOrderLines,
  decodeLines,
  encodeLines,
  OrderError,
  parcelWeightGrams,
  subtotalCents,
} from "../src/lib/order";
import { shippingCents, shop } from "../src/lib/shop";

test("prices come from the catalog, not the client", () => {
  const lines = buildOrderLines([{ slug: "kupferflasche-7-chakra", quantity: 2, priceCents: 1 }]);
  assert.equal(lines[0].unitCents, 5599);
  assert.equal(subtotalCents(lines), 11198);
});

test("duplicate lines are merged", () => {
  const lines = buildOrderLines([
    { slug: "kupferflasche-nahtlos", quantity: 1 },
    { slug: "kupferflasche-nahtlos", quantity: 2 },
  ]);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 3);
});

test("rejects unknown products, products without price and bad quantities", () => {
  assert.throws(() => buildOrderLines([]), OrderError);
  assert.throws(() => buildOrderLines([{ slug: "gibts-nicht", quantity: 1 }]), OrderError);
  assert.throws(() => buildOrderLines([{ slug: "kupferflasche-klassik", quantity: 1 }]), /noch nicht bestellbar/);
  for (const quantity of [0, -1, 1.5, shop.maxQuantityPerLine + 1, "2; drop"]) {
    assert.throws(() => buildOrderLines([{ slug: "kupferflasche-nahtlos", quantity }]), OrderError);
  }
  assert.throws(
    () => buildOrderLines([{ slug: "kupferflasche-nahtlos", variantId: "fake", quantity: 1 }]),
    OrderError,
  );
});

test("shipping is free from the threshold", () => {
  assert.equal(shippingCents(shop.shipping.freeFromCents - 1), shop.shipping.costCents);
  assert.equal(shippingCents(shop.shipping.freeFromCents), 0);
});

test("metadata encoding round-trips and fits Stripe's 500 char limit", () => {
  const lines = buildOrderLines([
    { slug: "kupferflasche-7-chakra", quantity: 2 },
    { slug: "kupferflasche-nahtlos", quantity: 1 },
  ]);
  const encoded = encodeLines(lines);
  assert.ok(encoded.length < 500);
  assert.deepEqual(decodeLines(encoded), [
    { key: "kupferflasche-7-chakra", quantity: 2 },
    { key: "kupferflasche-nahtlos", quantity: 1 },
  ]);
  assert.equal(parcelWeightGrams(lines), 700 * 2 + 700 + shop.shipping.packagingGrams);
});
