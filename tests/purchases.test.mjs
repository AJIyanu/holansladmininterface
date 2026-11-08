import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
const hooks = registerHooks({
  resolve(s, c, next) {
    return next(
      s === "../sales-invoice/schema" && c.parentURL?.includes("/purchases/")
        ? s + ".ts"
        : s,
      c,
    );
  },
});
const { purchaseTotals, purchaseValuesSchema, defaults } =
  await import("../src/features/purchases/schema.ts");
hooks.deregister();
const values = {
  ...defaults(),
  items: [
    { description: "Switch", quantity: "2", unit: "pcs", unit_price: "50000" },
  ],
};
for (const [tax, wht, expected] of [
  [false, false, 10000000n],
  [true, false, 10750000n],
  [false, true, 9800000n],
  [true, true, 10550000n],
])
  test(`supplier payment tax ${tax}, withholding ${wht}`, () => {
    const t = purchaseTotals({
      ...values,
      tax_enabled: tax,
      withholding_enabled: wht,
    });
    assert.equal(t.paid, expected);
    assert.equal(t.subtotal, 10000000n);
  });
test("fixed and percentage discount produce same pre-tax base", () => {
  for (const [discount_type, discount_value] of [
    ["AMOUNT", "10000"],
    ["PERCENT", "10"],
  ]) {
    const t = purchaseTotals({
      ...values,
      discount_enabled: true,
      discount_type,
      discount_value,
      tax_enabled: true,
      withholding_enabled: true,
    });
    assert.equal(t.subtotal, 9000000n);
    assert.equal(t.tax, 675000n);
    assert.equal(t.withholding, 180000n);
    assert.equal(t.paid, 9495000n);
  }
});
test("adjustable withholding is computed before VAT", () => {
  const t = purchaseTotals({
    ...values,
    tax_enabled: true,
    withholding_enabled: true,
    withholding_percent: "5",
  });
  assert.equal(t.withholding, 500000n);
  assert.equal(t.paid, 10250000n);
});
test("fractional item and percentage rounding is half-up", () => {
  const t = purchaseTotals({
    ...values,
    items: [{ ...values.items[0], quantity: "0.125", unit_price: "25" }],
    tax_enabled: true,
    withholding_enabled: true,
  });
  assert.equal(t.gross, 313n);
  assert.equal(t.tax, 23n);
  assert.equal(t.withholding, 6n);
  assert.equal(t.paid, 330n);
});
test("invalid discounts, rates, quantities and overflow are rejected", () => {
  assert.equal(purchaseValuesSchema.safeParse(values).success, true);
  for (const change of [
    {
      discount_enabled: true,
      discount_type: "AMOUNT",
      discount_value: "100000",
    },
    { discount_enabled: true, discount_type: "PERCENT", discount_value: "101" },
    { tax_percent: "101" },
    { withholding_percent: "100" },
    { items: [] },
    { items: [{ ...values.items[0], quantity: "0" }] },
    {
      tax_enabled: true,
      items: [
        {
          ...values.items[0],
          quantity: "1",
          unit_price: "9999999999999999.99",
        },
      ],
    },
  ])
    assert.equal(
      purchaseValuesSchema.safeParse({ ...values, ...change }).success,
      false,
    );
});
test("copying supplier items can be edited independently", () => {
  const copy = {
    ...values,
    items: values.items.map((row) => ({
      ...row,
      quantity: "1",
      unit_price: "40000",
    })),
  };
  assert.equal(purchaseTotals(copy).subtotal, 4000000n);
  assert.equal(purchaseTotals(values).subtotal, 10000000n);
});
