import test from "node:test";
import assert from "node:assert/strict";
import {
  invoiceValuesSchema,
  invoiceSubtotal,
  lineAmount,
  decimal,
  vatAmount,
} from "../src/features/sales-invoice/schema.ts";
const row = {
  description: "Switch",
  quantity: "2",
  unit: "each",
  unit_price: "50000.00",
};
const invoice = {
  date: "2026-11-05",
  currency: "NGN",
  billed_to: "Example client",
  billing_address: "",
  recipient_email: "",
  notes: "",
  items: [row],
};
test("document VAT is separate from the goods subtotal", () => {
  const subtotal = invoiceSubtotal([row]);
  assert.equal(decimal(subtotal), "100000.00");
  assert.equal(decimal(vatAmount(subtotal)), "7500.00");
  assert.equal(decimal(subtotal + vatAmount(subtotal)), "107500.00");
});
test("fractional quantities use half-up rounding per item", () => {
  assert.equal(
    decimal(lineAmount({ quantity: "1.25", unit_price: "2.50" })),
    "3.13",
  );
  assert.equal(
    decimal(lineAmount({ quantity: "0.0001", unit_price: "9999.99" })),
    "1.00",
  );
});
test("large monetary values retain precision beyond Number safe integers", () => {
  const subtotal = invoiceSubtotal([
    { quantity: "1", unit_price: "9999999999999999.99" },
  ]);
  assert.equal(decimal(subtotal), "9999999999999999.99");
  assert.equal(decimal(vatAmount(subtotal)), "750000000000000.00");
});
test("removing and reordering items preserves the correct subtotal", () => {
  const rows = [row, { ...row, quantity: "1.25", unit_price: "2.50" }];
  assert.equal(invoiceSubtotal(rows), invoiceSubtotal([...rows].reverse()));
  assert.equal(decimal(invoiceSubtotal(rows.slice(1))), "3.13");
});
test("invalid dates, quantities, missing items and overflow cannot be submitted", () => {
  assert.equal(invoiceValuesSchema.safeParse(invoice).success, true);
  for (const changed of [
    { ...invoice, date: "2026-02-30" },
    { ...invoice, items: [] },
    { ...invoice, items: [{ ...row, quantity: "0" }] },
    {
      ...invoice,
      items: [{ ...row, quantity: "2", unit_price: "9999999999999999.99" }],
    },
  ])
    assert.equal(invoiceValuesSchema.safeParse(changed).success, false);
});

import { discountedLineAmount } from "../src/features/sales-invoice/schema.ts";
import {
  quantityLabel,
  quantityNumber,
  shortUnit,
  invoiceUnits,
} from "../src/features/sales-invoice/units.ts";
test("discount is applied per line before VAT with exact penny rounding", () => {
  assert.equal(decimal(discountedLineAmount(row, "10")), "90000.00");
  const subtotal = invoiceSubtotal([row], "10");
  assert.equal(decimal(vatAmount(subtotal)), "6750.00");
  assert.equal(decimal(subtotal + vatAmount(subtotal)), "96750.00");
  const tiny = { quantity: "1", unit_price: "0.05" };
  assert.equal(decimal(invoiceSubtotal([tiny, tiny], "10")), "0.08");
  assert.equal(invoiceSubtotal([row], "0"), invoiceSubtotal([row]));
});
test("invalid discounts and zero net totals cannot be submitted", () => {
  for (const discount_percent of [
    "-1",
    "100.01",
    "101",
    "NaN",
    "1.001",
    "100",
  ]) {
    assert.equal(
      invoiceValuesSchema.safeParse({ ...invoice, discount_percent }).success,
      false,
    );
  }
  assert.equal(
    invoiceValuesSchema.safeParse({ ...invoice, discount_percent: "12.50" })
      .success,
    true,
  );
});
test("quantity display removes only trailing decimals and preserves custom units", () => {
  assert.equal(quantityLabel("4.0000", "each"), "4 pcs");
  assert.equal(quantityLabel("1.2500", "kilogram"), "1.25 kg");
  assert.equal(quantityLabel("10.0100", "tray"), "10.01 tray");
  assert.equal(quantityLabel("1000", "l"), "1000 L");
  assert.equal(quantityNumber("0.0001"), "0.0001");
  assert.equal(shortUnit("cartons"), "ctn");
  assert.equal(shortUnit("pallets"), "plt");
  for (const unit of ["pcs", "kg", "mm", "L", "ctn", "plt"])
    assert.ok(invoiceUnits.some(([value]) => value === unit));
});
