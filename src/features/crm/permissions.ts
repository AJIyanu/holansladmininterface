/**
 * CRM permission names returned by GET /account/me/.
 */
export const CRM_PERMISSIONS = {
  party: {
    view: "crm.party.view",
    create: "crm.party.create",
    edit: "crm.party.edit",
    delete: "crm.party.delete",
    deactivate: "crm.party.deactivate",
    archive: "crm.party.archive",
    block: "crm.party.block",
    merge: "crm.party.merge",
    viewHistory: "crm.party_history.view",
  },

  partyRole: {
    view: "crm.partyrole.view",
    create: "crm.partyrole.create",
    edit: "crm.partyrole.edit",
    delete: "crm.partyrole.delete",
  },

  contactMethod: {
    view: "crm.contactmethod.view",
    create: "crm.contactmethod.create",
    edit: "crm.contactmethod.edit",
    delete: "crm.contactmethod.delete",
  },

  address: {
    view: "crm.address.view",
    create: "crm.address.create",
    edit: "crm.address.edit",
    delete: "crm.address.delete",
  },

  source: {
    view: "crm.partysource.view",
    create: "crm.partysource.create",
    edit: "crm.partysource.edit",
    delete: "crm.partysource.delete",
  },

  contactRole: {
    view: "crm.contactrole.view",
    create: "crm.contactrole.create",
    edit: "crm.contactrole.edit",
    delete: "crm.contactrole.delete",
  },

  // affiliation: {
  //   view: "crm.partyaffiliation.view",
  //   create: "crm.partyaffiliation.create",
  //   edit: "crm.partyaffiliation.edit",
  //   delete: "crm.partyaffiliation.delete",
  // },

  note: {
    view: "crm.partynote.view",
    create: "crm.partynote.create",
    edit: "crm.partynote.edit",
    delete: "crm.partynote.delete",
    viewConfidential: "crm.confidentialnote.view",
    manageConfidential: "crm.confidentialnote.manage",
  },

  interaction: {
    view: "crm.partyinteraction.view",
    create: "crm.partyinteraction.create",
    edit: "crm.partyinteraction.edit",
    delete: "crm.partyinteraction.delete",
  },

  identifier: {
    view: "crm.partyidentifier.view",
    create: "crm.partyidentifier.create",
    edit: "crm.partyidentifier.edit",
    delete: "crm.partyidentifier.delete",
    reveal: "crm.sensitive_partyidentifier.view",
    manageSensitive: "crm.sensitive_partyidentifier.manage",
  },

  bankAccount: {
    view: "crm.partybankaccount.view",
    create: "crm.partybankaccount.create",
    edit: "crm.partybankaccount.edit",
    delete: "crm.partybankaccount.delete",
    reveal: "crm.sensitive_partybankaccount.view",
    manageSensitive: "crm.sensitive_partybankaccount.manage",
  },

  document: {
    view: "crm.partydocument.view",
    create: "crm.partydocument.create",
    edit: "crm.partydocument.edit",
    delete: "crm.partydocument.delete",
    download: "crm.partydocument.download",
    viewConfidential: "crm.confidential_partydocument.view",
    manageConfidential: "crm.confidential_partydocument.manage",
  },

  statusHistory: {
    view: "crm.partystatushistory.view",
  },

  mergeHistory: {
    view: "crm.partymergerecord.view",
  },

  affiliation: {
    view: "crm.partyaffiliation.view",
    create: "crm.partyaffiliation.create",
    edit: "crm.partyaffiliation.edit",
    delete: "crm.partyaffiliation.delete",
  },
} as const;

/**
 * Any one of these permissions grants access to the CRM overview.
 */
export const CRM_ANY_VIEW_PERMISSIONS = [
  CRM_PERMISSIONS.party.view,
  CRM_PERMISSIONS.partyRole.view,
  CRM_PERMISSIONS.contactMethod.view,
  CRM_PERMISSIONS.address.view,
  CRM_PERMISSIONS.source.view,
  CRM_PERMISSIONS.contactRole.view,
  CRM_PERMISSIONS.affiliation.view,
  CRM_PERMISSIONS.note.view,
  CRM_PERMISSIONS.interaction.view,
  CRM_PERMISSIONS.identifier.view,
  CRM_PERMISSIONS.bankAccount.view,
  CRM_PERMISSIONS.document.view,
  CRM_PERMISSIONS.statusHistory.view,
  CRM_PERMISSIONS.mergeHistory.view,
] as const;

export type CrmPermission = (typeof CRM_ANY_VIEW_PERMISSIONS)[number] | string;

export type CrmPermissionInput = string | readonly string[];

export function crmPermissionInput(
  permission: CrmPermissionInput,
): string | string[] {
  return typeof permission === "string" ? permission : Array.from(permission);
}
