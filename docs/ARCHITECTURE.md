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
