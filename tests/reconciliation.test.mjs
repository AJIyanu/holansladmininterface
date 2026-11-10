import test from "node:test";
import assert from "node:assert/strict";
import {
  partyPresentation,
  statementDate,
  cents,
} from "../src/features/reconciliation/presentation.ts";
const base = {
  party: { name: "Example client" },
  company: {},
  currency: "NGN",
  date_from: "2026-01-01",
  date_to: "2026-12-31",
  opening_balance: "0.00",
  closing_balance: "0.00",
  tax: { opening_total: "0.00", closing_total: "0.00" },
  transactions: [],
};
const invoice = {
  id: "invoice",
  date: "2026-01-03",
  type: "INVOICE",
  reference: "HOL-EXA-260103-001",
  description: "Goods",
  debit: "100000.00",
  credit: "0.00",
  balance: "100000.00",
  combined_balance: "107500.00",
  document_vat: "7500.00",
  actual_cash: "0.00",
  wht: "0.00",
};
const receipt = {
  id: "receipt",
  date: "2026-01-04",
  type: "PAYMENT",
  reference: "HOL-EXA-260104-001",
  description: "Payment",
  debit: "0.00",
  credit: "100000.00",
  balance: "0.00",
  combined_balance: "0.00",
  actual_cash: "105500.00",
  wht: "2000.00",
};
function amounts(result) {
  return Object.fromEntries(result.summary.map((r) => [r.label, r.amount]));
}
test("dates use unambiguous short month and padded day", () => {
  assert.equal(statementDate("2026-01-03"), "Jan 03, 2026");
  assert.equal(statementDate("2026-12-31"), "Dec 31, 2026");
});
test("seven summary lines separate invoice VAT, actual receipt and WHT", () => {
  const r = partyPresentation(
    { ...base, transactions: [invoice, receipt] },
    "sales",
  );
  assert.equal(r.summary.length, 7);
  assert.deepEqual(amounts(r), {
    "Prior balance": "0.00",
    "Total invoiced without VAT": "100000.00",
    "Total VAT": "7500.00",
    "Total invoiced with VAT": "107500.00",
    "Total received": "105500.00",
    "Total WHT": "2000.00",
    "Balance due": "0.00",
  });
  assert.equal(r.rows[0].charged, "107500.00");
  assert.equal(r.rows[1].received, "105500.00");
  assert.equal(r.rows[1].reference, receipt.reference);
});
test("advance then delivery uses full delivery VAT without double counting", () => {
  const prepay = {
    ...receipt,
    combined_balance: "-100000.00",
    balance: "-100000.00",
  };
  const delivery = {
    ...invoice,
    combined_balance: "0.00",
    balance: "0.00",
    vat_recognised: "0.00",
  };
  const r = partyPresentation(
    { ...base, transactions: [prepay, delivery] },
    "sales",
  );
  assert.equal(amounts(r)["Total VAT"], "7500.00");
  assert.equal(amounts(r)["Balance due"], "0.00");
  const movement =
    r.rows.reduce(
      (n, row) => n + cents(row.charged) - cents(row.received),
      0n,
    ) - 200000n;
  assert.equal(movement, 0n);
});
test("credits remain visible and reconcile rather than disappearing", () => {
  const credit = {
    ...invoice,
    id: "credit",
    type: "CREDIT",
    debit: "0.00",
    credit: "100000.00",
    document_vat: "-7500.00",
    combined_balance: "0.00",
    balance: "0.00",
  };
  const r = partyPresentation(
    { ...base, transactions: [invoice, credit] },
    "sales",
  );
  assert.equal(amounts(r)["Credits / other adjustments"], "-107500.00");
  assert.equal(r.rows[1].charged, "-107500.00");
});
test("supplier payment uses external receipt number", () => {
  const r = partyPresentation(
    {
      ...base,
      transactions: [
        {
          ...receipt,
          document_reference: "SUP-REC-123",
          combined_balance: "-100000.00",
        },
      ],
    },
    "purchase",
  );
  assert.equal(r.rows[0].reference, "SUP-REC-123");
  assert.equal(amounts(r)["Total paid"], "105500.00");
});
test("legacy and large values preserve exact cents", () => {
  const old = {
    ...base,
    opening_balance: "9999999999999999.99",
    closing_balance: "9999999999999999.99",
    tax: undefined,
  };
  assert.equal(
    amounts(partyPresentation(old, "sales"))["Balance due"],
    "9999999999999999.99",
  );
});
