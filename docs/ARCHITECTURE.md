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

Accounts now uses `/dashboard/ledger/[[...segments]]` and the authenticated
`/api/ledger/[...path]` proxy. See [Accounts workspace](LEDGER.md) for implemented
screens, permission boundaries and pending backend migration requirements.
