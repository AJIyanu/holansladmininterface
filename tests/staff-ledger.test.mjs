import test from "node:test";
import assert from "node:assert/strict";
import {
  editorSchema,
  cents,
  expenseTotal,
  retirementBalance,
} from "../src/features/staff-ledger/schema.ts";
const id = "00000000-0000-4000-8000-000000000001";
const base = {
  kind: "PAY",
  date: "2026-11-08",
  currency: "NGN",
  description: "Site visit",
  reference: "",
  category: "ADVANCE",
  amount: "100000.00",
  account_id: id,
  related_entry: "",
  items: [],
};
test("expense totals preserve decimal precision", () => {
  assert.equal(expenseTotal([{ amount: "0.10" }, { amount: "0.20" }]), "0.30");
  assert.equal(cents("9999999999999999.99"), 999999999999999999n);
});
test("retirement previews change and overspend separately", () => {
  assert.deepEqual(retirementBalance("100000", "75000"), {
    change: "25000.00",
    reimbursement: "0.00",
  });
  assert.deepEqual(retirementBalance("100000", "120000"), {
    change: "0.00",
    reimbursement: "20000.00",
  });
  assert.deepEqual(retirementBalance("50000", "75000"), {
    change: "0.00",
    reimbursement: "25000.00",
  });
});
test("cash movements require valid account, category and positive amount", () => {
  assert.equal(editorSchema.safeParse(base).success, true);
  for (const change of [
    { account_id: "" },
    { category: "LOAN_REPAYMENT" },
    { amount: "0" },
    { amount: "-5" },
    { amount: "1.001" },
  ])
    assert.equal(editorSchema.safeParse({ ...base, ...change }).success, false);
});
test("repayments and reimbursements require linked source", () => {
  for (const [kind, category] of [
    ["PAY", "ADVANCE_REIMBURSEMENT"],
    ["RECEIVE", "ADVANCE_RETURN"],
    ["RECEIVE", "LOAN_REPAYMENT"],
  ]) {
    assert.equal(
      editorSchema.safeParse({ ...base, kind, category }).success,
      false,
    );
    assert.equal(
      editorSchema.safeParse({ ...base, kind, category, related_entry: id })
        .success,
      true,
    );
  }
  assert.equal(
    editorSchema.safeParse({ ...base, category: "SALARY", related_entry: id })
      .success,
    false,
  );
});
test("retirement needs ordered positive expenses and rejects oversized total", () => {
  const item = {
    date: base.date,
    category: "TRANSPORT",
    description: "Travel",
    amount: "75000.00",
  };
  const draft = {
    ...base,
    kind: "RETIRE",
    account_id: "",
    amount: "",
    related_entry: id,
    items: [item],
  };
  assert.equal(editorSchema.safeParse(draft).success, true);
  assert.equal(editorSchema.safeParse({ ...draft, items: [] }).success, false);
  assert.equal(
    editorSchema.safeParse({
      ...draft,
      items: [{ ...item, date: "2026-11-09" }],
    }).success,
    false,
  );
  assert.equal(
    editorSchema.safeParse({
      ...draft,
      items: [
        { ...item, amount: "9999999999999999.99" },
        { ...item, amount: "1" },
      ],
    }).success,
    false,
  );
  const reordered = {
    ...draft,
    items: [
      { ...item, description: "Second" },
      { ...item, description: "First" },
    ],
  };
  assert.deepEqual(
    editorSchema.parse(reordered).items.map((i) => i.description),
    ["Second", "First"],
  );
});
