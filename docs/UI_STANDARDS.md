# Dashboard UI standards

## Layout and responsiveness

Keep the established professional, practical dashboard layout, spacing and shared
components. Use responsive mobile/tablet/desktop layouts, wrapping long values
and avoiding unintended horizontal overflow.

Retain expandable staff cards: expansion supplies profile detail, so do not add
a redundant profile dialog. Keep existing roles/departments card and grouped
permission-matrix patterns. Do not impose every staff layout on unrelated apps.

On mobile, security tables default to compact mode with three key columns:
login activity shows User/Event/Status; audit shows Actor/Activity/Status.
Provide the existing full-table toggle. Horizontal scrolling is allowed only in
that explicit full mobile table mode, not the compact view.

## Mobile account-action restriction

Sensitive account mutations remain tablet/desktop-only (the existing md guard):
adding, deleting, activating/deactivating accounts, resetting passwords, managing
roles/departments and other existing guarded account actions.
Mobile users can review information and see a clear explanation.
This is UX policy, not authorization; backend checks apply at all sizes.
Do not silently broaden the restriction to unrelated business apps.

## Dialogs and forms

Keep dialogs viewport-bound with vertical scroll and wrapping; avoid fixed-width
children and sideways overflow. Preserve focus, labels, keyboard and screen-reader
behaviour. Avoid nested modals; use inline confirmation within the same dialog.

Use existing React Hook Form/Zod and Sonner feedback patterns. Disable submission
while pending and disable unchanged updates. Preserve entered values on errors.
After success, close appropriate dialogs and refresh/revalidate affected data.

Separate staff-profile editing, role assignment and department changes. Submit
only fields owned by each action. Role management uses one checklist, with inline
confirmation of additions/removals; further edits invalidate that confirmation.
Destructive actions require clear confirmation; preserve current superuser-only
visibility/typed confirmation where already required.

Use theme tokens for new visual work. Branding supersedes old mandatory-blue or
glass-effect assumptions. Existing module-specific styling need not be rewritten
outside an approved design task.

## Security pages and presentation

Preserve filters, pagination, rule summaries and lazy nonblocking AI insight.
Summary/AI cache identity depends on page type/range, not table page/search filters.
Retain the implemented 90-second AI timeout, manual retry and loading/error states.
Summary/AI availability must respect backend permissions.

Keep conditional 404 presentation: authenticated users retain dashboard context;
logged-out users see Holan-branded public recovery with website/login links.
Provide loading, empty, error, retry, forbidden and not-found states. Never expose
raw backend error dumps or confidential values in browser storage.
