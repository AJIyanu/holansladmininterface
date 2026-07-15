
---

## `docs/crm-frontend/CRM_FRONTEND_DEVELOPER_GUIDE.md`

```md id="46sacl"
# CRM Frontend Developer Guide

## Architecture

The CRM frontend follows the existing HolanSL server-first Next.js dashboard architecture.

Server components are used for:

- Page access checks
- Initial data fetching
- Directory pages
- Detail pages
- Search parameter parsing
- Pagination

Client components are used for:

- Forms
- Modals
- File previews
- Reveal buttons
- Lifecycle confirmation dialogs

## Main source folders

```text
src/features/crm
src/components/crm
src/app/dashboard/crm
src/app/api/crm