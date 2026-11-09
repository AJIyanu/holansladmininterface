import test from "node:test";
import assert from "node:assert/strict";
import {
  requestSchema,
  policySchema,
} from "../src/features/tax-ledger/schema.ts";
import { vatAmount, decimal } from "../src/features/sales-invoice/schema.ts";
const base = {
  action: "REMIT",
  date: "2026-11-09",
  period: "2026-11",
  currency: "NGN",
  tax_type: "VAT",
  amount: "7500",
  authority: "Authority",
  reference: "Payment",
  description: "November payment",
  account_id: "00000000-0000-4000-8000-000000000001",
  document_key: "",
  source_entry: "",
  classification: "AVAILABLE",
  adjust_field: "output_vat",
  decrease: false,
};
test("remittance requires account, authority and reference", () => {
  assert.equal(requestSchema.safeParse(base).success, true);
  for (const field of ["account_id", "authority", "reference"])
    assert.equal(
      requestSchema.safeParse({ ...base, [field]: "" }).success,
      false,
    );
});
test("future tax period and zero cash are rejected", () => {
  assert.equal(
    requestSchema.safeParse({ ...base, period: "2026-12" }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...base, amount: "0.00" }).success,
    false,
  );
});
test("classification and historical opening require source, not amount", () => {
  for (const action of ["CLASSIFY", "OPENING"]) {
    assert.equal(
      requestSchema.safeParse({ ...base, action, amount: "" }).success,
      false,
    );
    assert.equal(
      requestSchema.safeParse({
        ...base,
        action,
        amount: "",
        document_key: "purchase:sample",
      }).success,
      true,
    );
  }
});
test("reversal requires explicit posting", () => {
  assert.equal(
    requestSchema.safeParse({ ...base, action: "REVERSE", amount: "" }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({
      ...base,
      action: "REVERSE",
      amount: "",
      source_entry: base.account_id,
    }).success,
    true,
  );
});
test("versioned percentage calculations round exactly", () => {
  assert.equal(decimal(vatAmount(10000000n, "8")), "8000.00");
  assert.equal(decimal(vatAmount(101n, "7.5")), "0.08");
  assert.equal(decimal(vatAmount(10000000n, "2.5")), "2500.00");
});
test("policies validate rate and audit reason", () => {
  const p = {
    kind: "WHT",
    party_id: "",
    rate: "2.5",
    enabled: true,
    effective_date: "2026-11-09",
    reason: "Approved client rate",
  };
  assert.equal(policySchema.safeParse(p).success, true);
  assert.equal(policySchema.safeParse({ ...p, reason: "" }).success, false);
  assert.equal(policySchema.safeParse({ ...p, rate: "100.5" }).success, false);
});
