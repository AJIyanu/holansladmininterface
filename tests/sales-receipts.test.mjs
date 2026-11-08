import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import {
  invoiceSubtotal,
  decimal,
} from "../src/features/sales-invoice/schema.ts";
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "../sales-invoice/schema" &&
      context.parentURL?.includes("/sales-receipt/")
    )
      return nextResolve(specifier + ".ts", context);
    return nextResolve(specifier, context);
  },
});
const { receiptTotals, receiptValuesSchema } =
  await import("../src/features/sales-receipt/schema.ts");
hooks.deregister();
const values = {
  date: "2026-11-07",
  currency: "NGN",
  billed_to: "Example client",
  billing_address: "",
  recipient_email: "",
  notes: "",
  account_id: "00000000-0000-4000-8000-000000000001",
  payment_method: "CASH",
  bank_name: "",
  payment_reference: "",
  vat_paid: false,
  withholding_applied: false,
  items: [
    { description: "Switch", quantity: "2", unit: "pcs", unit_price: "50000" },
  ],
};
for (const [vat, wht, expected] of [
  [false, false, "100000.00"],
  [true, false, "107500.00"],
  [false, true, "98000.00"],
  [true, true, "105500.00"],
]) {
  test(`receipt totals: VAT ${vat}, withholding ${wht}`, () => {
    const result = receiptTotals(invoiceSubtotal(values.items), vat, wht);
    assert.equal(decimal(result.received), expected);
    assert.equal(decimal(result.subtotal), "100000.00");
    if (vat) assert.equal(decimal(result.vat), "7500.00");
    if (wht) assert.equal(decimal(result.withholding), "2000.00");
  });
}
test("fractional items and tax round half-up without floating point", () => {
  const subtotal = invoiceSubtotal([{ quantity: "0.125", unit_price: "25" }]);
  assert.equal(decimal(subtotal), "3.13");
  const result = receiptTotals(subtotal, true, true);
  assert.equal(decimal(result.vat), "0.23");
  assert.equal(decimal(result.withholding), "0.06");
  assert.equal(decimal(result.received), "3.30");
});
test("receipt form requires bank name, valid account and positive items", () => {
  assert.equal(receiptValuesSchema.safeParse(values).success, true);
  for (const change of [
    { payment_method: "BANK_TRANSFER" },
    { account_id: "" },
    { items: [] },
    { items: [{ ...values.items[0], quantity: "0" }] },
  ])
    assert.equal(
      receiptValuesSchema.safeParse({ ...values, ...change }).success,
      false,
    );
  assert.equal(
    receiptValuesSchema.safeParse({
      ...values,
      payment_method: "BANK_TRANSFER",
      bank_name: "Example bank",
    }).success,
    true,
  );
});
test("receipt can retain an editable copied invoice link", () => {
  const modified = {
    ...values,
    invoice_id: "00000000-0000-4000-8000-000000000002",
    invoice_version: 3,
    items: [
      {
        ...values.items[0],
        description: "Edited switch",
        quantity: "1",
        unit_price: "40000",
      },
    ],
  };
  assert.equal(receiptValuesSchema.safeParse(modified).success, true);
  assert.equal(decimal(invoiceSubtotal(modified.items)), "40000.00");
  assert.equal(decimal(invoiceSubtotal(values.items)), "100000.00");
});
test("tax-inclusive cash overflow is rejected before confirmation", () => {
  const large = {
    ...values,
    vat_paid: true,
    items: [
      { ...values.items[0], quantity: "1", unit_price: "9999999999999999.99" },
    ],
  };
  assert.equal(receiptValuesSchema.safeParse(large).success, false);
  assert.equal(
    receiptValuesSchema.safeParse({ ...large, vat_paid: false }).success,
    true,
  );
});
