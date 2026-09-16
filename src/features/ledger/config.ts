import type {
  Field,
  FormDefinition,
  Resource,
} from "@/features/procurement/types";
const f = (
  name: string,
  label: string,
  type: Field["type"] = "text",
  required = true,
): Field => ({ name, label, type, required });
const choice = (
  name: string,
  label: string,
  options: string[],
  required = true,
): Field => ({ ...f(name, label, "select", required), options });
const lookup = (
  name: string,
  label: string,
  resource: string,
  required = true,
): Field => ({ ...f(name, label, "lookup", required), resource });
const date = f("date", "Accounting date", "date");
const reason = f("reason", "Reason", "textarea");
const currency = lookup("currency", "Currency", "currencies");
const party = lookup("party", "Client / payee", "parties", false);
const evidence = lookup("evidence", "Supporting document", "documents", false);
const common = [
  currency,
  lookup("policy", "Posting policy", "posting-policies"),
  date,
  party,
  f("reference", "Reference", "text", false),
  f("description", "Description", "textarea"),
  evidence,
];
const lineFields = [
  f("description", "Goods description"),
  f("quantity", "Quantity", "decimal"),
  f("unit_price", "Unit price", "decimal"),
  { ...f("unit", "Unit"), defaultValue: "unit" },
  f("discount", "Discount amount", "decimal", false),
  lookup("tax_policy", "VAT policy", "tax-policies", false),
];
const costFields = [
  lookup("account", "Expense category / account", "accounts"),
  f("amount", "Amount", "decimal"),
  f("description", "Description", "textarea"),
  lookup("evidence", "Receipt / supporting document", "documents"),
];
export const resources: Record<string, Resource> = {};
function add(
  key: string,
  title: string,
  model: string,
  fields?: Field[],
  lines?: FormDefinition["lines"],
  columns = ["reference", "party_name", "date", "currency", "amount", "status"],
) {
  resources[key] = {
    title,
    model,
    columns,
    ...(fields
      ? {
          form: {
            title: `Add ${title.toLowerCase()}`,
            fields,
            lines,
            permission: `ledger.${model}.create`,
            endpoint: key,
            destination: key,
          },
        }
      : {}),
  };
}
add(
  "invoices",
  "Invoices",
  "invoice",
  [...common, f("due_date", "Due date", "date", false)],
  { name: "lines", label: "Goods", fields: lineFields },
);
add("receipts", "Receipts", "receipt", [
  ...common,
  f("amount", "Amount received", "decimal"),
  lookup("cash_account", "Receiving bank / cash account", "cash-accounts"),
  choice("purpose", "Receipt purpose", [
    "CLIENT",
    "SUPPLIER_REFUND",
    "ADVANCE_RETURN",
  ]),
  lookup("target", "Related financial record", "payments", false),
]);
add("payments", "Payments", "payment", [
  ...common,
  f("amount", "Amount paid", "decimal"),
  lookup("cash_account", "Paying bank / cash account", "cash-accounts"),
  choice("purpose", "Payment purpose", [
    "BILL",
    "EXPENSE",
    "ADVANCE",
    "TAX_REMITTANCE",
    "CLIENT_REFUND",
  ]),
  lookup(
    "target",
    "Posted record being paid (not needed for client refund)",
    "expenses",
    false,
  ),
]);
add("expenses", "Expenses", "expense", common, {
  name: "cost_lines",
  label: "Expense items",
  fields: costFields,
});
add("supplier-bills", "Supplier bills", "supplierbill", common, {
  name: "cost_lines",
  label: "Bill items",
  fields: costFields,
});
add("advances", "Staff advances", "advance", [
  ...common,
  f("amount", "Advance amount", "decimal"),
  lookup("custodian", "Staff member", "staff"),
]);
add(
  "advance-clearances",
  "Advance clearances",
  "advanceclearance",
  [...common, lookup("advance", "Advance", "advances")],
  { name: "cost_lines", label: "Actual expenses", fields: costFields },
);
add("withholdings", "Withholding records", "withholdingrecord", [
  ...common,
  lookup("line", "Invoice goods line", "invoice-lines"),
  lookup(
    "authorization",
    "Approved client withholding",
    "withholding-authorizations",
  ),
  f("taxable_base", "Net goods value covered (income WHT)", "decimal", false),
  f("amount", "Amount withheld", "decimal"),
  f("certificate_reference", "Deduction certificate reference"),
]);
add("tax-remittances", "Tax remittances", "taxremittance", [
  ...common,
  lookup("tax_policy", "VAT policy", "tax-policies"),
  f("period_from", "Period start", "date"),
  f("period_to", "Period end", "date"),
  f("amount", "Remittance amount", "decimal"),
]);
for (const [key, title, model] of [
  ["manual-journals", "Manual journals", "journalentry"],
  ["opening-balances", "Opening balances", "openingbalance"],
])
  add(key, title, model, common, {
    name: "journal_lines",
    label: "Double-entry lines",
    fields: [
      lookup("account", "Account and currency", "account-currencies"),
      f("debit", "Debit", "decimal", false),
      f("credit", "Credit", "decimal", false),
      lookup("party", "Client (where applicable)", "parties", false),
    ],
  });
add(
  "currencies",
  "Currencies",
  "currency",
  [
    f("code", "Three-letter code"),
    f("name", "Currency name"),
    f("symbol", "Symbol"),
    { ...f("minor_units", "Decimal places", "decimal"), defaultValue: "2" },
  ],
  undefined,
  ["code", "name", "symbol", "minor_units", "active"],
);
add(
  "accounts",
  "Chart of accounts",
  "ledgeraccount",
  [
    f("code", "Account code"),
    f("name", "Account name"),
    choice("classification", "Classification", [
      "ASSET",
      "LIABILITY",
      "EQUITY",
      "INCOME",
      "EXPENSE",
    ]),
    lookup("parent", "Parent account", "accounts", false),
  ],
  undefined,
  ["code", "name", "classification", "active"],
);
add(
  "account-currencies",
  "Account currency mappings",
  "accountcurrency",
  [
    lookup("account", "Account", "accounts"),
    lookup("currency", "Currency", "currency-ids"),
  ],
  undefined,
  ["account_id", "currency_id"],
);
add(
  "cash-accounts",
  "Bank and cash accounts",
  "cashaccount",
  [
    f("name", "Account name"),
    choice("kind", "Type", ["BANK", "CASH"]),
    lookup("account", "Account currency mapping", "account-currencies"),
  ],
  undefined,
  ["name", "kind", "active"],
);
add(
  "financial-years",
  "Financial years",
  "financialyear",
  [f("year", "Year", "decimal")],
  undefined,
  ["year", "start", "end"],
);
add("periods", "Monthly periods", "accountingperiod", undefined, undefined, [
  "start",
  "end",
  "closed",
  "version",
]);
add(
  "posting-policies",
  "Posting policies",
  "postingpolicyversion",
  [
    f("name", "Policy name"),
    ...[
      ["receivable", "Client receivables"],
      ["payable", "Supplier payables"],
      ["deferred_revenue", "Sales awaiting acceptance"],
      ["revenue", "Earned sales"],
      ["advance", "Staff advances"],
      ["opening_equity", "Opening equity"],
    ].map(([k, n]) => lookup(k, n, "accounts")),
  ],
  undefined,
  ["name", "recognition", "self_approval"],
);
add(
  "tax-types",
  "Tax types",
  "taxtype",
  [
    f("code", "Tax code"),
    f("name", "Tax name"),
    f("authority", "Tax authority"),
  ],
  undefined,
  ["code", "name", "authority"],
);
add(
  "tax-policies",
  "VAT policies",
  "taxpolicyversion",
  [
    lookup("tax_type", "Tax type", "tax-types"),
    f("effective_from", "Effective from", "date"),
    f("effective_to", "Effective until", "date", false),
    { ...f("rate", "VAT percentage", "decimal"), defaultValue: "7.5" },
    lookup("liability_account", "VAT liability account", "accounts"),
    {
      ...choice("treatment", "Treatment", ["CLIENT_REMITTANCE"]),
      defaultValue: "CLIENT_REMITTANCE",
    },
    f("verified_reference", "Verified applicability / source", "textarea"),
  ],
  undefined,
  ["rate", "effective_from", "effective_to", "treatment"],
);
add(
  "withholding-authorizations",
  "Client withholding approvals",
  "clientwithholdingauthorization",
  [
    lookup("party", "Client", "parties"),
    lookup("tax_type", "Tax type", "tax-types"),
    {
      ...choice("treatment", "Withholding type", ["INCOME_WHT", "VAT"]),
      defaultValue: "INCOME_WHT",
    },
    {
      ...f("rate", "Approved withholding percentage", "decimal"),
      defaultValue: "2.5",
      max: 100,
    },
    lookup(
      "credit_account",
      "Income WHT credit asset account",
      "accounts",
      false,
    ),
    f("effective_from", "Effective from", "date"),
    f("effective_to", "Effective until", "date", false),
    reason,
    lookup("evidence", "Supporting authorization evidence", "documents"),
  ],
  undefined,
  ["party_id", "treatment", "rate", "effective_from", "revoked_from"],
);
resources["withholding-authorizations"].form!.permission =
  "ledger.clientwithholdingauthorization.authorize";
add(
  "documents",
  "Supporting documents",
  "ledgerdocument",
  [f("file", "Upload evidence", "file"), party],
  undefined,
  ["filename", "created_at", "created_by_name"],
);
add(
  "allocations",
  "Allocate receipt",
  "receipt",
  [
    f("source", "Receipt settlement reference"),
    lookup("invoice", "Invoice", "invoices-for-allocation"),
    currency,
    date,
    f("amount", "Amount to allocate", "decimal"),
  ],
  {
    name: "tax_lines",
    label: "VAT included in this allocation",
    fields: [
      lookup("line", "Invoice line", "invoice-lines"),
      f("amount", "VAT collected (zero for untaxed line)", "decimal"),
    ],
  },
);
resources["allocations"].form!.permission = "ledger.receipt.allocate";
resources["allocations"].form!.fields = resources[
  "allocations"
].form!.fields.filter((x) => x.name !== "currency");
resources["allocations"].form!.destination = "receipts/";
add(
  "approval-requests",
  "Approval inbox",
  "approvalrequest",
  undefined,
  undefined,
  ["status", "created_at", "created_by_name"],
);
add(
  "finance-submissions",
  "Procurement finance submissions",
  "financesubmission",
  undefined,
  undefined,
  ["source_id", "record_id", "created_at"],
);
add(
  "journals",
  "Journal and account book",
  "journalentry",
  undefined,
  undefined,
  ["date", "reference", "description", "currency"],
);
export const settings = [
  "accounts",
  "cash-accounts",
  "currencies",
  "account-currencies",
  "financial-years",
  "periods",
  "posting-policies",
  "tax-types",
  "tax-policies",
  "withholding-authorizations",
  "opening-balances",
];
export const financial = [
  "invoices",
  "receipts",
  "payments",
  "expenses",
  "supplier-bills",
  "advances",
  "advance-clearances",
  "withholdings",
  "tax-remittances",
  "manual-journals",
  "opening-balances",
];
export function actionForm(
  key: string,
  id: string,
  action: string,
): FormDefinition | undefined {
  const resource = resources[key];
  if (!resource) return;
  if (key === "finance-submissions" && action === "prepare")
    return {
      title: "Link prepared financial record",
      endpoint: `finance-submissions/${id}/prepare`,
      destination: "finance-submissions/",
      permission: "ledger.financesubmission.edit",
      fields: [
        lookup(
          "record",
          "Prepared draft financial record",
          "financial-records",
        ),
        reason,
      ],
    };
  if (key === "invoices" && action === "cancel")
    return {
      title: "Cancel eligible invoice quantities",
      endpoint: `invoices/${id}/cancel`,
      destination: "credit-notes",
      permission: "ledger.invoice.cancel",
      notice:
        "Accepted goods cannot be cancelled. This prepares a credit note for approval and posting.",
      fields: [
        f("expected_version", "Record version", "decimal"),
        date,
        reason,
      ],
      lines: {
        name: "lines",
        label: "Quantities to cancel",
        fields: [
          lookup("line", "Invoice line", "invoice-lines"),
          f("quantity", "Quantity", "decimal"),
        ],
      },
    };

  const version = f("expected_version", "Record version", "decimal");
  const base = {
    title: action.replaceAll("-", " "),
    endpoint: `${key}/${id}/${action}`,
    destination: `${key}/${id}`,
    permission: `ledger.${resource.model}.edit`,
    fields: [] as Field[],
  };
  if (
    action === "edit" &&
    ["currencies", "accounts", "cash-accounts", "tax-types"].includes(key)
  )
    return {
      ...base,
      fields: [
        f("name", "Name"),
        ...(key === "cash-accounts"
          ? [
              lookup(
                "custodian",
                "Cash holder / responsible staff",
                "staff",
                false,
              ),
            ]
          : []),
        ...(key === "currencies" ? [f("symbol", "Symbol")] : []),
        ...(["currencies", "accounts", "cash-accounts"].includes(key)
          ? [f("active", "Active", "boolean")]
          : []),
        reason,
      ],
    };
  if (key === "periods" && ["close", "reopen"].includes(action))
    return {
      ...base,
      destination: "periods/",
      permission: `ledger.accountingperiod.${action}`,
      fields: [version, reason],
    };
  if (key === "withholding-authorizations" && action === "revoke")
    return {
      ...base,
      destination: "withholding-authorizations/",
      permission: "ledger.clientwithholdingauthorization.authorize",
      fields: [date, reason],
    };
  if (
    financial.includes(key) &&
    ["submit", "approve", "reject", "post"].includes(action)
  )
    return {
      ...base,
      permission: `ledger.${resource.model}.${action === "submit" ? "edit" : action === "reject" ? "approve" : action}`,
      fields: [
        version,
        ...(["approve", "reject"].includes(action) ? [reason] : []),
      ],
    };
  if (financial.includes(key) && action === "edit")
    return {
      ...base,
      fields: [
        version,
        f("reference", "Reference", "text", false),
        f("description", "Description", "textarea"),
      ],
    };
  if (key === "invoices" && action === "recognize")
    return {
      ...base,
      endpoint: "recognize-revenue",
      permission: "ledger.invoice.post",
      fields: [
        lookup("line", "Accepted invoice line", "invoice-lines"),
        f("quantity", "Accepted quantity", "decimal"),
        date,
      ],
    };
  if (financial.includes(key) && action === "generate")
    return {
      ...base,
      permission: "ledger.financialrecord.generate",
      fields: [choice("format", "File format", ["PDF", "JPG"])],
    };
}
export const statementForm: FormDefinition = {
  title: "Reconciliation and Statement",
  permission: "ledger.clientstatement.view",
  endpoint: "client-statements",
  destination: "client-statements",
  fields: [
    lookup("client", "Client", "parties"),
    currency,
    f("date_from", "From", "date"),
    f("date_to", "Through", "date"),
  ],
};

resources["credit-notes"] = {
  title: "Credit notes and cancellations",
  model: "creditnote",
  columns: ["reference", "party_name", "date", "currency", "amount", "status"],
};
financial.push("credit-notes");
resources["cash-accounts"].form!.fields.push(
  lookup("custodian", "Cash holder / responsible staff", "staff", false),
);
for (const key of financial)
  if (resources[key].form)
    resources[key].form!.fields.push(
      lookup("request", "Procurement request", "requests", false),
    );
resources["account-currencies"].columns = ["account_name", "currency"];
resources["cash-accounts"].columns = [
  "name",
  "kind",
  "currency",
  "custodian_name",
  "active",
];
resources["withholding-authorizations"].columns = [
  "client_name",
  "treatment",
  "rate",
  "effective_from",
  "revoked_from",
];
resources["expenses"].form!.notice =
  "Record the expense and supporting receipts, then submit it for approval and post it. Record the bank or cash payment separately using Record payment on the posted expense.";
resources["withholdings"].form!.notice =
  "Only an approved client can withhold. For income WHT, enter the net goods value excluding VAT and its deduction at the client's approved percentage. The business default is 2.5%.";

resources["invoices"].form!.lines!.fields.push(
  lookup("item", "Procurement request item", "request-items", false),
  lookup(
    "po_line",
    "Existing purchase order line (if already ordered)",
    "order-lines",
    false,
  ),
);
resources["invoices"].form!.fields = resources["invoices"].form!.fields.map(
  (field) =>
    field.name === "party"
      ? { ...field, required: true, label: "Client" }
      : field,
);

add("client-codes", "Client document codes", "financialrecord", [
  lookup("party", "Client", "parties"),
  f("code", "Unique 3–4 uppercase letter code"),
]);
resources["client-codes"].form!.permission = "ledger.financialrecord.generate";
resources["client-codes"].form!.destination = "settings/";
add("approval-routing", "Approval task routing", "approvalroutingpolicy", [
  f("enabled", "Create dashboard approval tasks", "boolean"),
  reason,
]);
resources["approval-routing"].form!.destination = "settings/";
settings.push("client-codes", "approval-routing");
