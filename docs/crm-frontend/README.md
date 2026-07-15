# HolanSL CRM Frontend

The CRM frontend is the dashboard interface for managing external business relationships in the HolanSL Admin Website.

It supports:

- Party directory
- Client, supplier, prospect and contact views
- Party creation, editing and deletion
- Duplicate checking before creation
- Registration identifier CRUD
- Sensitive registration reveal
- Document upload
- Local file thumbnail preview
- Full file preview modal
- Protected document preview and download
- Party lifecycle actions
- Interaction listing
- Permission-controlled menus, pages and actions

## Active CRM routes

```text
/dashboard/crm
/dashboard/crm/parties
/dashboard/crm/parties/new
/dashboard/crm/parties/[partyId]
/dashboard/crm/parties/[partyId]/edit
/dashboard/crm/clients
/dashboard/crm/suppliers
/dashboard/crm/prospects
/dashboard/crm/contacts
/dashboard/crm/registrations
/dashboard/crm/registrations/new
/dashboard/crm/registrations/[identifierId]/edit
/dashboard/crm/documents
/dashboard/crm/documents/new
/dashboard/crm/documents/[documentId]/edit
/dashboard/crm/interactions
/dashboard/crm/settings/contact-roles
````

## Removed routes

Old Supplier, Customer, Procurement and Ledger frontend routes were removed because the backend implementations were removed or redesigned.

Do not use:

```text
party_type
/crm/contacts/
/procurement/
/ledger/
```

## Colour usage

CRM code uses explicit Tailwind colour codes.

Accepted examples:

```text
bg-[#F46C0B]
text-[#0F172A]
border-[#E2E8F0]
bg-[#0F4C81]
```

Avoid unconfigured semantic classes:

```text
bg-primary
text-foreground
bg-destructive
border-border
bg-background
```

````