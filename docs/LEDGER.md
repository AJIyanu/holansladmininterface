# Ledger — printable reconciliation update (2026-11-10)

Sales, purchase and staff statement pages now share the TSX conversion of the
user-supplied `src/templates/reconciliation.html`: right-aligned logo/contact block,
right-aligned full statement title and currency, compact coloured summary, and
five-column account table. Dates use `Jan 03, 2026`; currency is NGN, USD or GBP.

Party statements show prior balance, invoices excluding VAT, invoice VAT, invoices
including VAT, actual receipts/payments, WHT and closing balance. Credits/other
adjustments appear only when needed to reconcile the original frozen balance.
Receipt rows are green and invoice rows red. Staff statements use the same layout
with staff-specific totals and separate due-from/due-to balances; expense approvals
are described without inventing cash movements or invoices.

Printed documents exclude internal snapshot identifiers, review history, repeated
balance cards and outstanding/advance schedules. Review controls/history remain
available on screen. New backend snapshots freeze full delivery VAT and the actual
supplier receipt reference. Existing saved snapshots are not rewritten: regenerate
for complete new fields; the older snapshot notice is screen-only. No migration.
Paper styling uses a scoped CSS module, approved navy, the supplied status colours,
A4 portrait rules, repeating table headers and exact print colours. The supplied
HTML is retained unchanged as the design reference. No CDN script is used.

## Earlier ledger implementation notes

## Supplier bills and payments — 2026-11-08

Purchase Ledger Add bill and Add payment now open itemized forms. Bills capture the
supplier invoice reference, item quantities/units/prices, optional tax (7.5% default),
fixed/percentage discount and delivery status. Undelivered bills remain outside
supplier debt; Mark delivered posts only the goods subtotal. Authorized staff can
edit undelivered manual bills; delivered/source-linked financial details are retained.

Payment can copy a supplier invoice into an editable draft, choose currency and paying
cash/bank account, and include adjustable withholding (2% default). Tax and withholding
are both based on goods after discount, before tax. The live and confirmation totals
show exact cash paid: goods + tax − withholding. Payments post immediately; linked
advances are applied on bill delivery without duplicating cash. Purchase ledger
payments remain goods-only while the journal includes Input Tax and WHT Payable.

Receipt number and image/PDF upload are optional on confirmation. Later editing permits
only the receipt number/scan, with a review and immutable evidence history. Accepted
files are PDF, JPEG, PNG or WebP up to 10 MB. Existing files remain available through
permission-checked downloads. No generated supplier documents or email controls exist.

Details: `/dashboard/ledger/purchase/{bills|payments}/{UUID}`. Supplier bill/payment
history has search and pagination; invoice copying has paginated reference search.
The Next download proxy is `/api/ledger/purchase-payments/{UUID}/evidence/{UUID}/download`.
Server Actions reuse authenticated helpers and multipart uploads; tokens and storage
identifiers stay server-side. Delivery, creation, evidence edit and download controls
mirror the new backend permissions. Existing purchase reconciliation remains available.
Procurement inbox now creates bill documents instead of immediately posting debt.

Backend migration **0026** and purchasebill/purchasepayment permissions are required
before testing. Full contracts and accounting rules are in the backend
`docs/apps/ledger.md`. No dependencies were added. Authenticated browser interaction
and live provider uploads were not exercised; automated tests mock private storage.

## Payment receipts — 2026-11-08

The approved receipt workflow replaces Sales Ledger's Add payment button with
**Add Payment Receipt** (mobile: **Add Receipt**). This section supersedes earlier
statements that receipt documents or all tax-related journal accounts are unavailable.

### Confirmation and accounting

A receipt is confirmed directly from the reviewed item draft and posted immediately,
regardless of delivery. Items support add/remove/reorder, description, quantity, unit,
unit price and an optional percentage discount, matching invoice rounding. Confirmed
receipts are immutable: corrections use existing authorized ledger operations rather
than editing or deleting the original acknowledgement.

VAT-paid and withholding switches default off. VAT is 7.5% of the net goods subtotal;
withholding is 2% of that same subtotal, before VAT. Cash received = goods + VAT − WHT.
The sales payment and allocations remain goods-only. For goods of NGN 100,000 with
both switches enabled, journal totals are:

| Account                     |   Debit |  Credit |
| --------------------------- | ------: | ------: |
| Receiving cash/bank account | 105,500 |         |
| Withholding Tax Receivable  |   2,000 |         |
| Client receivable/payment   |         | 100,000 |
| VAT Payable                 |         |   7,500 |

The existing paired journal stores this as cash/receivable 98,000,
WHT receivable/client receivable 2,000 and cash/VAT payable 7,500. They share the
cash entry and document reference. Total debits equal credits. Receipt confirmation
never credits Sales again; acceptance-based revenue recognition is unchanged.
WHT is retained as an asset and VAT as a liability. Tax remittance, statutory returns,
certificate processing and a separate tax-ledger UI remain outside this release.

Receipt creation, goods payment, cash entry, journal legs and allocation are one
transaction. A UUID request key plus canonical payload/actor protects retries.
An invoice link must belong to the same party/currency and retain the copied version.
Copying an invoice only copies its draft fields and does not modify the invoice.
If already posted and dated on/before payment, allocate up to outstanding goods value;
otherwise retain the payment as an advance. Delivery later does not silently allocate
this advance; the existing allocation action remains available.

Payment methods are Cash, Bank transfer, Card and Cleared cheque. An active account
in the chosen NGN/USD/GBP currency is mandatory. Cash uses a cash account; other
methods use a bank account and require the bank name. Only money already received
should be confirmed. Future receipt dates are rejected. Bank name/payment reference
are captured in the frozen document, not used to create another bank account.

Existing receipt reversal now reverses actual cash and every journal leg. Refunds
use cumulative proportional VAT/WHT rounding so a full refund restores all amounts
without penny drift. Refund input remains goods value; existing allocation-release
and permission rules apply. A refund rounding to zero cash is rejected for review.
Ordinary historical payments and purchase-ledger payment flows remain supported.

### Documents and API

Receipt preview adapts `src/templates/InvoiceTemplate.tsx` / `invoice.html` in the
frontend; PDF reuses the matching backend renderer with **RECEIPT** as the title.
It includes receiving account/method/bank, invoice link, item S/N, amounts, tax breakdown,
actual money received and currency-aware amount in words before client/Holan signatures.
Invoices and receipts share the locked daily sequence and client code, preventing
reference collisions: `HOL-{client code}-{YYMMDD}-{SN}`. Stored item references append
`.1`, `.2`, etc.; client documents display only S/N, consistent with invoice policy.

- GET/POST `/ledger/sales-receipts/parties/{party UUID}/`: paginated history / confirm.
- GET `/ledger/sales-receipts/{receipt UUID}/`: frozen detail and permitted email history.
- GET `/ledger/sales-receipts/{receipt UUID}/pdf/`: private, no-store PDF.
- POST `/ledger/sales-receipts/{receipt UUID}/email/`: custom/default professional
  message and PDF attachment through the existing notification provider.
- No PATCH/DELETE routes for confirmed receipts.

Creation takes invoice-style fields/items plus `request_key`, `account_id`,
`payment_method`, `bank_name`, `payment_reference`, `vat_paid`, `withholding_applied`,
and optional `invoice_id`/`invoice_version`. Values are validated and recalculated
server-side. Email takes `request_key`, `destination`, optional `subject`/`message`.
Same-key retries return the previous attempt without resending. Provider acceptance
is not proof of inbox delivery; unknown outcomes require checking before a new attempt.

Frontend detail: `/dashboard/ledger/sales/receipts/{UUID}`; protected PDF proxy:
`/api/ledger/receipts/{UUID}/pdf`. Backend permissions are staff +
`view_salesledger`, `view_salesreceipt`, and `add_salesreceipt`/`print_salesreceipt`/
`email_salesreceipt` as appropriate. Creation also requires `add_salestransaction`
and `add_cashbookentry`; copying an invoice requires `view_salesinvoice`.
Frontend uses the existing `ledger.salesreceipt.create/view/print/email` formatting.
New executive permissions follow the existing additive hooks; ordinary staff need grants.

Migration **0025_receiptemail_salesreceipt_and_more** adds frozen receipts/email
history, receipt immutability, amount constraints and the two allowed journal accounts.
It does not rewrite prior financial records. No dependencies were added. Application
migration execution and live email delivery are operator actions, not performed during
implementation verification.

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
- Procurement invoice imports and source links were retired on 2026-11-10. No
  linked Ledger records existed in the application database at retirement.

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
- The former `/dashboard/ledger/ledgers/procurement` approvals/import workspace was
  retired with the previous Procurement implementation.
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
