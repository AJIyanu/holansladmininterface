# CRM Frontend Test Checklist

## General

- [ ] `pnpm type-check` passes.
- [ ] `pnpm lint` passes.
- [ ] `pnpm build` passes.
- [ ] No empty CRM files remain.
- [ ] No old `party_type` frontend references remain.
- [ ] No old `/crm/contacts/` frontend references remain.
- [ ] No old Procurement or Ledger dashboard routes remain.

## Navigation

- [ ] Superuser sees all CRM menu items.
- [ ] User without CRM permissions sees no CRM menu.
- [ ] Party viewer sees Party-related menus.
- [ ] Registration viewer sees Registrations.
- [ ] Document viewer sees Documents.
- [ ] Interaction viewer sees Interactions.
- [ ] Contact-role viewer sees CRM Settings > Contact Roles.

## Party CRUD

- [ ] Party directory loads.
- [ ] Search works.
- [ ] Status filter works.
- [ ] Entity kind filter works.
- [ ] Clients view filters by Client role.
- [ ] Suppliers view filters by Supplier role.
- [ ] Prospects view filters by Prospect role.
- [ ] Contacts view filters by Individual entity kind.
- [ ] Create Party works.
- [ ] Duplicate check blocks exact duplicate.
- [ ] Edit Party works.
- [ ] Delete unused Party works only with permission.

## Registrations

- [ ] Registrations page loads.
- [ ] Create registration works.
- [ ] Edit registration metadata works.
- [ ] Leaving value blank during edit keeps existing encrypted value.
- [ ] Delete registration works.
- [ ] Normal list shows masked values only.
- [ ] Reveal requires sensitive permission.
- [ ] Reveal modal clears when closed.

## Documents

- [ ] Documents page loads.
- [ ] Upload form loads.
- [ ] Local image thumbnail appears.
- [ ] Local PDF preview opens in modal.
- [ ] Unsupported Office files show metadata preview.
- [ ] Upload succeeds.
- [ ] Existing image/PDF/text preview works.
- [ ] Existing document download works.
- [ ] Supabase private URL is never exposed.
- [ ] Confidential documents remain backend-controlled.
- [ ] Metadata edit works.
- [ ] Delete document works.

## Lifecycle

- [ ] Lifecycle panel appears only with relevant permissions.
- [ ] Deactivate requires reason.
- [ ] Reactivate requires reason.
- [ ] Suspend requires reason.
- [ ] Block requires reason.
- [ ] Archive requires reason.
- [ ] Restore requires reason.
- [ ] Detail page updates after action.

## Responsive

- [ ] Party directory is usable on mobile.
- [ ] Registrations table is usable on mobile.
- [ ] Documents table is usable on mobile.
- [ ] Preview modals fit mobile screens.
- [ ] Forms work on mobile and desktop.

## Colour rules

- [ ] New CRM code does not use `bg-primary`.
- [ ] New CRM code does not use `text-foreground`.
- [ ] New CRM code does not use `bg-destructive`.
- [ ] New CRM code does not use `border-border`.
- [ ] New CRM code uses explicit Tailwind colour codes.
````