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