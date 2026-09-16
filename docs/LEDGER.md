# Accounts workspace

Routes live under `/dashboard/ledger` and use the existing staff session and assigned
permissions. Next Server Components fetch initial data; interactive forms use the
protected `/api/ledger` proxy, retained idempotency keys, validation, review and retry.
Tokens and private storage paths never enter browser state.

Screens: overview, procurement approvals/submissions, invoices, receipts/payments,
expenses/bills, advances/clearances, credit notes, withholding, account book/journals,
Reconciliation and Statement, analytics, supporting uploads and settings.

Settings creates accounts, account/currency mappings, banks/cash, currencies, years,
posting/VAT policies and client withholding authorizations. Bank/cash custodians may
be assigned later. Staff permissions reuse Administration. Currency/account selectors
filter views; they do not transfer money or perform FX conversion.

Income withholding authorization defaults to 2.5%; each client can receive a different
approved rate with evidence and effective dates. This is a business default, not a
statutory-rate assertion. Invoice VAT and income-tax credits remain separate.

Expenses and bills are obligations: approve/post, then record the linked bank/cash
payment. Receipts are allocated separately to invoices with explicit VAT attribution.
Procurement submissions can be reviewed, used to prepare a financial draft, then
linked to it. Approval inbox decisions retain the exact submitted record and reason.
Invoice cancellation creates a credit note requiring approval/posting; backend guards
protect accepted quantities. PDF/JPG exports download through protected routes.

Deploy the companion backend and reviewed migrations 0010–0012 before enabling these
screens. Automated source/build checks do not replace authenticated browser acceptance
checks or authorize live financial entries. No new application dependency was added.
