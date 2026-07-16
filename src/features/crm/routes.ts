import { CRM_ANY_VIEW_PERMISSIONS, CRM_PERMISSIONS } from "./permissions";

import type { CrmPermissionInput } from "./permissions";

export const CRM_ROUTES = {
  root: "/dashboard/crm",

  parties: "/dashboard/crm/parties",
  newParty: "/dashboard/crm/parties/new",

  clients: "/dashboard/crm/clients",
  suppliers: "/dashboard/crm/suppliers",
  prospects: "/dashboard/crm/prospects",
  contacts: "/dashboard/crm/contacts",
  registrations: "/dashboard/crm/registrations",
  interactions: "/dashboard/crm/interactions",

  settings: {
    contactRoles: "/dashboard/crm/settings/contact-roles",
  },

  partyDetail(partyId: string): string {
    return `/dashboard/crm/parties/${partyId}`;
  },

  partyEdit(partyId: string): string {
    return `/dashboard/crm/parties/${partyId}/edit`;
  },
  documents: "/dashboard/crm/documents",
  newDocument: "/dashboard/crm/documents/new",

  documentEdit(documentId: string): string {
    return `/dashboard/crm/documents/${documentId}/edit`;
  },

  newInteraction: "/dashboard/crm/interactions/new",

  interactionEdit(interactionId: string): string {
    return `/dashboard/crm/interactions/${interactionId}/edit`;
  },
} as const;

export interface CrmPageDefinition {
  title: string;
  href: string;
  description: string;
  permission: CrmPermissionInput;
}

export const CRM_PAGE_DEFINITIONS: CrmPageDefinition[] = [
  {
    title: "CRM Overview",
    href: CRM_ROUTES.root,
    description: "CRM activity, access and operational shortcuts.",
    permission: CRM_ANY_VIEW_PERMISSIONS,
  },
  {
    title: "All Parties",
    href: CRM_ROUTES.parties,
    description: "Browse every organisation, person and trading name.",
    permission: CRM_PERMISSIONS.party.view,
  },
  {
    title: "Clients",
    href: CRM_ROUTES.clients,
    description: "Parties with an active Client role.",
    permission: CRM_PERMISSIONS.party.view,
  },
  {
    title: "Suppliers",
    href: CRM_ROUTES.suppliers,
    description: "Formal, informal, marketplace and direct suppliers.",
    permission: CRM_PERMISSIONS.party.view,
  },
  {
    title: "Prospects",
    href: CRM_ROUTES.prospects,
    description: "Potential clients and suppliers under development.",
    permission: CRM_PERMISSIONS.party.view,
  },
  {
    title: "Contacts",
    href: CRM_ROUTES.contacts,
    description: "Individual parties and organisation affiliations.",
    permission: CRM_PERMISSIONS.party.view,
  },
  {
    title: "Registrations",
    href: CRM_ROUTES.registrations,
    description: "Registration identifiers and supporting documents.",
    permission: [
      CRM_PERMISSIONS.identifier.view,
      CRM_PERMISSIONS.document.view,
    ],
  },
  {
    title: "Documents",
    href: CRM_ROUTES.documents,
    description: "Upload, preview and manage CRM Party documents.",
    permission: CRM_PERMISSIONS.document.view,
  },
  {
    title: "Interactions",
    href: CRM_ROUTES.interactions,
    description: "Calls, messages, meetings and follow-up activity.",
    permission: CRM_PERMISSIONS.interaction.view,
  },
  {
    title: "Contact Roles",
    href: CRM_ROUTES.settings.contactRoles,
    description: "Configure organisation contact responsibilities.",
    permission: CRM_PERMISSIONS.contactRole.view,
  },
];
