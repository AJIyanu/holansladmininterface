# Frontend architecture

Next.js App Router with TypeScript, React, Tailwind v4, shadcn/Radix,
React Hook Form, Zod and Sonner. Django remains the business/security authority.

## Rendering and requests

Use Server Components for initial data, user/access checks, redirects and
URL-driven filters/search/ordering/pagination. Isolate forms/dialogs/toggles and
other interactive state in Client Components.

Use serverFetch and existing refresh-aware Route Handler helpers or Server Actions.
Authenticated browser requests must not call Django directly or expose bearer
tokens. Preserve HTTP-only access_token/refresh_token cookies, both Authorization
and X-Auth-Token headers in shared server helpers, and single refresh-and-retry.
Do not add unnecessary loopback HTTP proxy calls for Server Actions/Components.

Top-level "use server" files export async actions only. Keep initial state and
ordinary runtime helpers in plain modules, and import actions directly.

## Existing contracts

Preserve actual /dashboard/admin/staff and /dashboard/admin/newstaff routes and
current Django /account/ APIs. Use emitted app.resource.action permissions with
accounts app labels, create/edit mapping and action-specific backend checks.

CRM uses Party roles, profiles and affiliations. Nested create is supported;
ordinary Party PATCH excludes related profiles/contacts/addresses/sources.
Use dedicated related endpoints including existing profile PATCH.
Protect registration reveals and document downloads; interactions remain manual.

Tasks, comments, reminders and dashboard notifications are implemented. Procurement
and finance links/proxy remnants do not imply implemented business functionality.
Consult backend app docs and stabilize backend contracts before dependent UI work.

The first Procurement navigation group now has Item Requests, Item Trackers and
Analytics. The remaining Sourcing & Quotations, Purchase Orders, Purchasing,
Delivery & Rejections, Finance Requests and Documents roadmap groups remain
visible with under-development destinations until redesigned in order. Item
Requests supports permission-gated CRM-client registration of multiple independent
items, review-before-save, private sample images, server filtering and paginated
detailed cards. Item Trackers exposes one activity journey per item with attributed
activities, comments and controlled completion status. Authenticated work uses
Server Components and Server Actions; private images stream through a protected
Route Handler. Analytics remains under development pending its approved measures.

Ledger was reset on 2026-11-03. Its first rebuild feature is the NGN cash book at
`/dashboard/ledger/cashbook/entry` and read-only paired journal at `/dashboard/ledger/cashbook/journal`.
Both use server-enforced model permissions; mutations use protected Server Actions.
Prior invoices, tax screens, reports and API proxy remain removed.

## Sales invoice documents

The invoice detail page uses `src/templates/InvoiceTemplate.tsx`, converted from
`src/templates/invoice.html`, for its client-facing preview. Company contacts come
from invoice detail API `company` configuration. The protected PDF route continues
to use the backend's confirmed-snapshot renderer for downloads and email attachments.
Only item S/N appears in the preview/PDF; full item references remain available
separately in staff-only internal reference details and in stored snapshots.

Invoice editing uses `UnitSelect` with common abbreviated units and a custom
short-form entry. `features/sales-invoice/units.ts` formats quantities without
trailing decimal zeros, including legacy unit names. Existing quantity/unit
storage is retained. Optional `discount_percent` uses exact BigInt per-line
half-up arithmetic shared by the form review; VAT follows the discounted goods
subtotal. Invoice detail `pricing` restores saved discount settings on reopen.
Previews show gross line values and a discount deduction only for positive rates;
the backend stores/posts net line amounts and keeps discount metadata in existing
operation payloads and immutable document snapshots, without schema additions.

## Staff Ledger

`/dashboard/ledger/ledgers/staff` adds a searchable, server-persisted staff selector,
permission-gated Pay Staff, Receive from Staff and Retire Advance actions, date/currency
filters, separate staff balances, transaction history, expense submissions and saved
statements. Staff are existing UUID accounts, not CRM parties. Money forms choose an
existing currency-matched cash/bank account. Salary/allowance expenses are not staff debt.

Retire Advance uses editable ordered expense rows with dates, categories, descriptions,
amounts and optional receipts. Add/remove/move controls preserve each receipt's row
identity. Source selection expands inline within the form, avoiding nested dialogs.
A review step precedes submission. Pending expenses wait for a separate permissioned
approval/rejection with recorded actor, date and reason. The review displays change
or reimbursement due; approval causes no cash movement. Actual returns/reimbursements
use linked money forms. Self-approval is permitted with the audit record preserved.

Detail routes are `/dashboard/ledger/staff/entries/{id}` and
`/dashboard/ledger/staff/retirements/{id}`. Protected document downloads use
`/api/ledger/staff/documents/{id}/download`, authenticatedRouteFetch and Django's
assigned download permission. Supporting file bytes are hashed into each submission's
retry fingerprint, with UUID idempotency on the backend. No storage URLs/tokens are
exposed. Max file size is 10 MB, combined 20 MB; existing Server Action body limit is
25 MB. No new dependency is required.

`/statements/staff/{id}` renders the immutable full **Reconciliation and Statement**
snapshot for one currency with prior balances, all period entries and closing balances.
Generation opens a new browser tab; an explicit link remains available if popups are
blocked. It uses company details saved by the backend, landscape print styling and
staff/HolanSL signature lines. Financial year defaults to January–December. Balances
start at zero until records exist. Staff-linked Cash Book entries hide edit/void actions;
Django independently rejects those changes. Journal labels include staff receivables
and staff reimbursement payables.

Permissions follow `ledger.staffledger.{view,pay,receive,retire,approve,download,print}`;
cash actions additionally need `ledger.cashbookentry.create`. Pages, actions and navigation
mirror the existing formatted permissions. The backend's ledger migration0027 is required
before using these routes; development does not run application migrations.

## Tax Ledger

`/dashboard/ledger/ledgers/tax` is protected by `ledger.taxledger.view`, with
currency-separated company balance cards, filtered period/opening/closing values,
searchable party selection, paginated tax events and approval requests. Historical
review is explicitly loaded on demand. Navigation uses the existing permission
format. Additional remit/approve/adjust/configure/apply/export permissions control
operations, approvals, policies and CSV; Django remains authoritative.

TaxEditor uses React Hook Form/Zod and inline review with stable retry identifiers.
It records remittances, document VAT settlements, input-VAT classifications,
manual CIT assessments, client-WHT credits, approved adjustments and historical
openings. Remittance/CIT/adjustment reversals append records. All mutations use
server actions and authenticated serverFetch; private evidence and exports stream
through authenticated route handlers. No tokens, financial drafts or tax records
are persisted in browser storage. Pages and dialogs retain empty/error/retry states.

Request details live at `/dashboard/ledger/tax/requests/{id}`, policy history and
configuration at `/dashboard/ledger/tax/policies`. Prepared/approved actors and
reasons remain visible, including self-approvals. File uploads use the same private
provider pipeline as supplier receipts. No electronic invoicing or WHT certificates.

Sales invoice/receipt editors fetch effective server rates before review and submit
expected rates to catch changed policy. Linked invoices retain their frozen VAT
rate; client WHT overrides are date-effective. Both HTML and PDF templates use
stored rates. Newly generated party Reconciliation and Statements show goods,
VAT recognised/received/paid, WHT, actual cash and opening/closing combined balances;
old frozen statements remain compatible. Tax-linked cash entries hide independent
edit/void actions. Backend migration0028 and explicit staff grants are required;
application migrations and historical backfill are operator actions.
