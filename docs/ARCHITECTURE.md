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

Procurement now uses `/dashboard/procurement/[[...segments]]` with the existing
sidebar, assigned permission checks, server-fetched records and the authenticated
`/api/procurement/[...path]` proxy. Document-version pages display saved PDF/JPG
previews and downloads through the protected proxy. Company office details come
from backend configuration, never from obsolete sample addresses. Official
quotation/invoice issuance and receipts remain dependent on ledger integration.

Procurement form review uses the shared Dialog: validated field values, selected
record labels, filenames and item rows appear before Confirm and save. Edit
closes the modal and retains values. Request ownership/department are backend
defaults. The journey uses alternating rounded cards, circular icons and a dotted
path, with hover/focus/tap popups and paginated milestone history. Keyboard users
can enter the popup with Enter, Space or Arrow Down; Escape closes it.

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
