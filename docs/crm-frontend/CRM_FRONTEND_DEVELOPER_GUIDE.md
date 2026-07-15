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
````

## Important files

### `src/features/crm/types.ts`

Contains frontend TypeScript contracts for CRM API responses and request bodies.

### `src/features/crm/permissions.ts`

Contains CRM permission names and helper functions for converting readonly permission arrays into the mutable arrays expected by the existing `hasPermission()` helper.

### `src/features/crm/api.ts`

Contains server-only API calls to Django through `serverFetch()`.

### `src/features/crm/actions.ts`

Contains Party create, update and delete server actions.

### `src/features/crm/registration-actions.ts`

Contains registration create, update, delete and reveal server actions.

### `src/features/crm/document-actions.ts`

Contains document upload, metadata update and delete server actions.

### `src/features/crm/lifecycle-actions.ts`

Contains Party lifecycle server actions.

### `src/features/crm/search-params.ts`

Contains helpers for translating Next.js search params into backend filter query objects.

### `src/components/crm/CrmPartyDirectory.tsx`

Responsive Party listing with desktop table and mobile card layout.

### `src/components/crm/CrmPartyForm.tsx`

Create and edit form for Party basics.

### `src/components/crm/CrmRegistrationsTable.tsx`

Registration identifier listing with masked values and permission-controlled reveal.

### `src/components/crm/CrmDocumentsTable.tsx`

Document listing with preview, edit and delete actions.

### `src/components/crm/CrmFilePreview.tsx`

Local pre-upload thumbnail and modal preview.

### `src/components/crm/CrmDocumentPreviewButton.tsx`

Existing document preview through a protected Next.js route.

### `src/app/api/crm/documents/[documentId]/download/route.ts`

Protected route handler that streams files from Django to the browser without exposing Supabase URLs or credentials.

## Permission rules

Permissions affect:

1. Navigation visibility.
2. Page access.
3. Button/action visibility.

The backend remains the final security authority.

## Adding a new CRM page

1. Add the route under `src/app/dashboard/crm`.
2. Add permission guard using `requireCrmPermission()`.
3. Add API function in `src/features/crm/api.ts`.
4. Add types in `src/features/crm/types.ts`.
5. Add navigation item if needed.
6. Use explicit Tailwind colour codes.
7. Add validation and error handling.
8. Update this documentation.

## File preview design

Local uploads use browser object URLs and revoke them when the selected file changes.

Existing stored documents are fetched through:

```text
Browser
  -> Next.js route handler
  -> Django CRM document endpoint
  -> Supabase or Google Drive
```

The browser never receives Supabase credentials or direct private-bucket URLs.

````