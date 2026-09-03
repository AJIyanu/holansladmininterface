# HolanSL frontend instructions

Read the [primary backend AGENTS.md](../holansl_backend/AGENTS.md) for shared
project rules. That file is authoritative for workflow, backend contracts and
cross-project policy. Read each entry point once; do not recurse between them.
Keep one AGENTS.md in this repository.

## Frontend standards

- Read [architecture](docs/ARCHITECTURE.md), [branding](docs/BRANDING.md),
  [UI standards](docs/UI_STANDARDS.md) and [verification](docs/DEVELOPMENT.md).
- Consult the backend [app/API docs](../holansl_backend/docs/apps/README.md) for
  contracts and [security policy](../holansl_backend/docs/SECURITY.md) for access.
- Existing CRM frontend references remain under docs/crm-frontend/. Current code
  and these approved standards take precedence over stale examples there.

## Working rules

- Present a plan and wait for approval, then edit files directly. No copy/paste
  implementation or Bash scaffolding is required.
- Backend precedes dependent frontend work. Reading the backend is allowed;
  modifying it requires explicit permission for both repositories.
- Preserve Party-based CRM, built tasks, account routes, authentication helpers,
  HTTP-only cookies and single refresh/retry behaviour.
- Use Server Components for initial data/access checks; isolate interactive UI.
  Use authenticated server helpers/Server Actions/protected Route Handlers, not
  authenticated browser-to-Django calls.
- Use backend-provided permissions for UI visibility; never treat UI hiding or
  mobile restrictions as backend authorization.
- Use approved semantic theme tokens and typography. Do not introduce unrelated
  UK identity/content or make unapproved logo/theme redesigns.
- Retain tablet/desktop-only sensitive account mutations, compact/full mobile
  security tables, viewport-bound dialogs, scoped forms and confirmation flows.
- Use pnpm, Prettier, ESLint and TypeScript checks. Declare dependencies in
  package.json/pnpm-lock.yaml and report additions/upgrades with reasons.
- For each added, changed or corrected feature, append a timestamped entry to
  DEVELOPMENT_LOG.local.md according to the shared
  [logging standard](../holansl_backend/docs/DEVELOPMENT_LOGGING.md).
  This file must remain ignored and untracked.
