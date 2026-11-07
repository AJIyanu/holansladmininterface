# Ledger — current non-tax workspace

## Itemized sales invoices — 2026-11-05

This section supersedes earlier immediate sales-invoice posting and document limitations.
Sales Ledger **Add invoice** creates an editable, undelivered invoice outside the
financial ledger. Confirmation allocates `HOL-{client code}-{YYMMDD}-{daily SN}`
using the Lagos confirmation date, a unique three-letter client code and a company-wide
daily sequence. Items append `.1`, `.2`, etc. Editing invalidates confirmation;
previous confirmed revisions remain immutable and printable. The reference is retained.

- Items support description, quantity, unit, unit price, removal and ordering.
  Server-side decimal arithmetic rounds each line half-up to two decimal places.
- Confirmed invoices can be printed/downloaded as PDF or emailed with a custom/default
  message and PDF attachment. Client-facing titles and messages say **Invoice**.
  Documents include billing details, date, references, delivery status, signature
  spaces, goods subtotal, 7.5% VAT and total. VAT is document-only, never journaled.
- Mark delivered requires a confirmation and delivery date. It atomically posts the
  goods subtotal once to sales receivables/deferred revenue and its double-entry journal.
  Delivery does not imply acceptance: the existing acceptance flow recognizes revenue.
  No cash movement or payment condition is added. Delivered invoices have no edit action.
- UUID retry keys and optimistic version checks protect saves, confirmation, delivery
  and email requests. Email history distinguishes provider acceptance from unknown
  outcomes; retrying the same key never sends another email. Provider acceptance does
  not prove inbox delivery. No live email was sent during verification.
- Procurement invoice imports now create undelivered invoice documents. Their source
  item details remain linked and fixed; confirmation permits direct PO selection.
  Existing posted invoices and procurement links remain valid.

Backend routes are under `/ledger/sales-invoices/`: `parties/{party UUID}/`,
`{invoice UUID}/`, and `{invoice UUID}/{confirm,deliver,email,pdf}/`.
PDF accepts an optional `revision` UUID. Frontend detail is
`/dashboard/ledger/sales/invoices/{invoice UUID}`; PDF is relayed through the
protected `/api/ledger/invoices/{invoice UUID}/pdf` route.

Migration **0024** adds invoice documents/items, frozen revisions, client codes,
daily numbering, operation records and email history. It has been generated and tested
in disposable databases, but has NOT been applied to the application database.
Staff require `ledger.view_salesledger` and `ledger.view_salesinvoice`, plus the
relevant `add_salesinvoice`, `change_salesinvoice`, `confirm_salesinvoice`,
`deliver_salesinvoice`, `print_salesinvoice` or `email_salesinvoice` permission.
Delivery additionally requires `add_salestransaction`. Existing permission formatting
is preserved. Newly created permissions follow the existing executive grant hooks;
ordinary staff grants must be assigned explicitly. Payments, partial payments and tax
accounting changes are outside this release. No dependencies were added.

## Current completion — 2026-11-05

The approved remaining non-tax stages are implemented. Backend contracts and
permission mappings are documented in ../holansl_backend/docs/apps/ledger.md.
The earlier stage notes below remain history; their NGN-only/unavailable limits
are superseded by this section.

- Cash book and journal support NGN (primary), USD and GBP. Cash entries/payments
  select a matching cash/bank account; filters keep currency balances separate.
  January–December financial years and zero seeded opening balances remain.
- Sales/Purchase Ledger remembers each staff member's selected party. Add invoice,
  bill or payment, with optional allocations, using existing permissions and UUID
  retry protection. Currency amounts are exact decimal strings, never converted
  through floating-point arithmetic for display.
- Reconciliation and ledger actions offers advance allocation/reallocation, credit
  notes, refunds, balance adjustments, reversals and standalone goods evidence.
  Transactions are searched/paged on demand. The review panel confirms the payload;
  changing fields invalidates confirmation. Original financial records are retained.
- Reconciliation and Statement asks for date range and currency, creates a complete
  frozen snapshot, and opens /statements/ledger/{uuid} in another tab. A fallback link
  handles popup blocking. Print / Save as PDF uses the browser, landscape A4 and
  repeating table headings. Prior balance, amounts invoiced/paid/refunded, all period
  rows, running/closing balances, end-date outstanding and advance schedules appear.
- Saved snapshots are listed on each party ledger. Authorized staff append AGREED
  or DISPUTED reviews with notes, identity and time. These are staff-recorded reviews,
  not an external client's signature. Later transactions do not modify a snapshot.
- /dashboard/ledger/ledgers/procurement shows scoped quotation approvals, invoice requests,
  supplier bills and other submitted finance requests. Source links support review.
  Invoice/bill import posts once; other request approvals do not claim funds moved.
  Procurement can now submit finance requests and select an approved invoice item
  instead of a quotation for direct ordering. Acceptance comes from delivery evidence.
- /dashboard/ledger/ledgers/settings adds, renames and activates/deactivates cash/bank accounts.
  Currency/type are fixed on an existing account. Existing staff settings assign
  the new native permissions; navigation, SSR pages and Server Actions enforce them.

All backend calls use authenticated serverFetch/Server Actions. The print route is
included in protected proxy prefixes. No browser token or direct Django access is
introduced. No server is started and no application migration is applied by this
source build. Requires backend migrations 0021–0023 in addition to earlier stages.
No new package dependency was added. Tax remains deferred to a separate ledger;
exchange conversion, arbitrary currency registration and itemized invoice/receipt
PDF generation are not part of this completion.

## Earlier rebuild history

Routes: /dashboard/ledger/cashbook/entry (cash book) and /dashboard/ledger/cashbook/journal (read-only
paired journal). The old comprehensive ledger UI remains retired.

The cash book uses NGN, January–December years and zero initial opening balance.
It displays carried opening balance, money in/debit, money out/credit, closing
balance and dated entries with running balances. Year/date filters and pagination
are URL-driven; negative recorded cash is highlighted.

Add receipt, expense or owner capital with date, amount, description and optional
reference. Edits require a reason; deletion requires explicit confirmation and
reason. Corrections/voids generate journal reversals and preserve history. The
journal displays both accounts, equal debit/credit amounts, author/time and any
reversal reason. It is not editable.

Access uses existing formatted permissions:
ledger.cashbookentry.view/create/edit/delete and ledger.cashbookjournal.view.
Users must be staff or superusers. Navigation and server-rendered pages check
view permissions; action controls and Server Actions check the matching mutation
permission plus view. Django independently enforces all authorization. Staff
permission assignment remains in the existing administration screens.

Server Components fetch through serverFetch; browser mutations use Server Actions
with existing HTTP-only authentication. Duplicate create retries reuse a UUID;
corrections carry the saved version to reject stale updates. Decimal input is
transmitted as text, and money display avoids floating-point conversion.

Files: src/features/cash-book/, src/components/cash-book/ and
src/app/dashboard/ledger/. UI uses shared dialogs, inputs/buttons, React Hook Form,
Zod, Sonner and semantic theme tokens. Mobile uses cards; desktop uses a table.
Initial-loading, empty, validation, forbidden-access and retry states are present.

Backend contract: ../holansl_backend/docs/apps/ledger.md. New migrations 0014/0015
must be applied before use; their dependency 0013 removes the retired ledger if
still pending. Application migrations were not executed in this feature build.
No new dependencies, no restored procurement integration or additional currencies.

## Sales and purchase ledgers — stage 1

Accounts navigation now includes /dashboard/ledger/ledgers/sales and
/dashboard/ledger/ledgers/purchase. Server pages, navigation and Server Actions require
ledger.salesledger.view or ledger.purchaseledger.view and staff/superuser access.
The CRM selector returns minimal party identity using the corresponding client
or supplier role. It supports debounced name search, pagination, retry, clear
selection and keyboard-accessible buttons in the existing bounded Dialog.

Last selections are saved in Django separately for each staff member and each
ledger, and restored when opening the page. No party data is kept in browser
storage. Stale search responses are discarded. Archived/merged parties or removed
roles cannot be selected and are not restored from saved preferences.

The selected party's workspace explicitly identifies transaction entry, balances
and Reconciliation and Statement as later stages. No fake transaction rows or
balances are shown. Backend migration 0016 creates selection storage and view
permissions; it must be applied before these pages can load their preferences.

## Stage 2 — transaction history and balances

The selected party's workspace now reads the party transaction endpoint and shows
January–December year/date filters, NGN opening balance, invoices/bills, payments,
closing balance and paginated transaction history with running balances. Empty
results are real backend results. Negative balances are explained as credit or
advance. Changing party returns to the first page/default date filters.

The double-entry viewer now supports noncash transaction sources. Cash entries
linked to a party posting have edit/delete controls suppressed; Django and database
guards enforce the same restriction. Original standalone cash controls still work.
Historical parties with posted transactions remain selectable after CRM status or
role changes. Server page/action and backend permission enforcement is preserved.

Stage 2 does not provide invoice/payment entry forms or printing; those follow in
stages 3 and 5. It requires backend migrations 0017/0018. Currency remains NGN at
this stage; other currency accounts and policies have not been implemented.

## Stage 3 — invoice/bill and payment entry

Selected active-party workspaces show Add Invoice (sales) or Add Bill (purchase)
when ledger.salestransaction.create / ledger.purchasetransaction.create is held.
Add Payment additionally requires ledger.cashbookentry.create. Server Actions
repeat staff/view/posting permission checks before Django enforces them again.

Forms collect date, total amount, reference and description. Invoice/bill references
are mandatory. A review step identifies party/currency/amount before immediate
posting. Payments can allocate amounts across searchable, paginated outstanding
documents; selections remain visible/removable when the search/page changes.
Any remainder is explicitly shown as an unallocated advance. Decimal arithmetic
uses BigInt cents; payload amounts remain strings. Create retries reuse a UUID
for unchanged input. Errors preserve input and review state.

History shows current outstanding/unallocated amounts alongside the period running
balance. Server revalidation refreshes the party ledger, cash book and journal.
Document entry records totals, not itemized invoice PDFs or tax calculations.
Applying existing advances to later documents and reversals remain future controls;
recording another payment for existing cash is not a supported substitute.

No per-party tables exist. All source transactions use the shared table keyed to
CRM Party UUIDs; allocations use one shared relationship table. Backend migrations
0019/0020 are required. Browser acceptance remains to be performed after rollout.
