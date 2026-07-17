import "server-only";

import { serverFetch } from "@/lib/server-fetch";

import { buildCrmApiPath } from "./query";

import type {
  CrmContactRole,
  CrmContactRoleListQuery,
  CrmDocumentListQuery,
  CrmDuplicateCheckInput,
  CrmDuplicateCheckResponse,
  CrmIdentifierListQuery,
  CrmInteractionListQuery,
  CrmLifecycleInput,
  CrmMergeInput,
  CrmPartyDetail,
  CrmPartyDocument,
  CrmPartyDocumentUpdateInput,
  CrmPartyIdentifier,
  CrmPartyIdentifierWriteInput,
  CrmPartyInteraction,
  CrmPartyListItem,
  CrmPartyListQuery,
  CrmPartyWriteInput,
  CrmQuickSupplierInput,
  CrmSensitiveValueResponse,
  CrmContactRoleWriteInput,
  PaginatedResponse,
  CrmPartyInteractionWriteInput,
  CrmPartyAffiliationWriteInput,
  CrmPartyAffiliation,
  CrmPartyAffiliationListQuery,
} from "./types";

const CRM_API_PATHS = {
  parties: "/crm/parties/",
  affiliations: "/crm/affiliations/",
  identifiers: "/crm/identifiers/",
  documents: "/crm/documents/",
  interactions: "/crm/interactions/",
  contactRoles: "/crm/contact-roles/",
} as const;

function detailPath(collectionPath: string, id: string): string {
  return `${collectionPath}${id}/`;
}

function actionPath(
  collectionPath: string,
  id: string,
  action: string,
): string {
  return `${collectionPath}${id}/${action}/`;
}

export async function listCrmParties(
  query: CrmPartyListQuery = {},
): Promise<PaginatedResponse<CrmPartyListItem>> {
  return serverFetch<PaginatedResponse<CrmPartyListItem>>(
    buildCrmApiPath(CRM_API_PATHS.parties, query),
  );
}

export async function getCrmParty(partyId: string): Promise<CrmPartyDetail> {
  return serverFetch<CrmPartyDetail>(
    detailPath(CRM_API_PATHS.parties, partyId),
  );
}

export async function createCrmParty(
  input: CrmPartyWriteInput,
): Promise<CrmPartyDetail> {
  return serverFetch<CrmPartyDetail>(CRM_API_PATHS.parties, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCrmParty(
  partyId: string,
  input: Partial<CrmPartyWriteInput>,
): Promise<CrmPartyDetail> {
  return serverFetch<CrmPartyDetail>(
    detailPath(CRM_API_PATHS.parties, partyId),
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteCrmParty(partyId: string): Promise<void> {
  await serverFetch<null>(detailPath(CRM_API_PATHS.parties, partyId), {
    method: "DELETE",
  });
}

export async function quickCreateCrmSupplier(
  input: CrmQuickSupplierInput,
): Promise<CrmPartyDetail> {
  return serverFetch<CrmPartyDetail>(`${CRM_API_PATHS.parties}quick-create/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function checkCrmPartyDuplicates(
  input: CrmDuplicateCheckInput,
): Promise<CrmDuplicateCheckResponse> {
  return serverFetch<CrmDuplicateCheckResponse>(
    `${CRM_API_PATHS.parties}duplicate-check/`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function runCrmPartyLifecycleAction(
  partyId: string,
  action:
    | "deactivate"
    | "reactivate"
    | "suspend"
    | "block"
    | "archive"
    | "restore",
  input: CrmLifecycleInput,
): Promise<CrmPartyDetail> {
  return serverFetch<CrmPartyDetail>(
    actionPath(CRM_API_PATHS.parties, partyId, action),
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function mergeCrmParty(
  sourcePartyId: string,
  input: CrmMergeInput,
): Promise<CrmPartyDetail> {
  return serverFetch<CrmPartyDetail>(
    actionPath(CRM_API_PATHS.parties, sourcePartyId, "merge"),
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function listCrmIdentifiers(
  query: CrmIdentifierListQuery = {},
): Promise<PaginatedResponse<CrmPartyIdentifier>> {
  return serverFetch<PaginatedResponse<CrmPartyIdentifier>>(
    buildCrmApiPath(CRM_API_PATHS.identifiers, query),
  );
}

export async function getCrmIdentifier(
  identifierId: string,
): Promise<CrmPartyIdentifier> {
  return serverFetch<CrmPartyIdentifier>(
    detailPath(CRM_API_PATHS.identifiers, identifierId),
  );
}

export async function createCrmIdentifier(
  input: CrmPartyIdentifierWriteInput,
): Promise<CrmPartyIdentifier> {
  return serverFetch<CrmPartyIdentifier>(CRM_API_PATHS.identifiers, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCrmIdentifier(
  identifierId: string,
  input: Partial<CrmPartyIdentifierWriteInput>,
): Promise<CrmPartyIdentifier> {
  return serverFetch<CrmPartyIdentifier>(
    detailPath(CRM_API_PATHS.identifiers, identifierId),
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteCrmIdentifier(identifierId: string): Promise<void> {
  await serverFetch<null>(detailPath(CRM_API_PATHS.identifiers, identifierId), {
    method: "DELETE",
  });
}

export async function revealCrmIdentifier(
  identifierId: string,
): Promise<CrmSensitiveValueResponse> {
  return serverFetch<CrmSensitiveValueResponse>(
    actionPath(CRM_API_PATHS.identifiers, identifierId, "reveal"),
  );
}

export async function listCrmDocuments(
  query: CrmDocumentListQuery = {},
): Promise<PaginatedResponse<CrmPartyDocument>> {
  return serverFetch<PaginatedResponse<CrmPartyDocument>>(
    buildCrmApiPath(CRM_API_PATHS.documents, query),
  );
}

export async function updateCrmDocument(
  documentId: string,
  input: CrmPartyDocumentUpdateInput,
): Promise<CrmPartyDocument> {
  return serverFetch<CrmPartyDocument>(
    detailPath(CRM_API_PATHS.documents, documentId),
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteCrmDocument(documentId: string): Promise<void> {
  await serverFetch<null>(detailPath(CRM_API_PATHS.documents, documentId), {
    method: "DELETE",
  });
}

export async function listCrmInteractions(
  query: CrmInteractionListQuery = {},
): Promise<PaginatedResponse<CrmPartyInteraction>> {
  return serverFetch<PaginatedResponse<CrmPartyInteraction>>(
    buildCrmApiPath(CRM_API_PATHS.interactions, query),
  );
}

export async function listCrmContactRoles(
  query: CrmContactRoleListQuery = {},
): Promise<PaginatedResponse<CrmContactRole>> {
  return serverFetch<PaginatedResponse<CrmContactRole>>(
    buildCrmApiPath(CRM_API_PATHS.contactRoles, query),
  );
}

export async function createCrmContactRole(
  input: CrmContactRoleWriteInput,
): Promise<CrmContactRole> {
  return serverFetch<CrmContactRole>(CRM_API_PATHS.contactRoles, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCrmContactRole(
  contactRoleId: string,
  input: Partial<CrmContactRoleWriteInput>,
): Promise<CrmContactRole> {
  return serverFetch<CrmContactRole>(
    detailPath(CRM_API_PATHS.contactRoles, contactRoleId),
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteCrmContactRole(
  contactRoleId: string,
): Promise<void> {
  await serverFetch<null>(
    detailPath(CRM_API_PATHS.contactRoles, contactRoleId),
    {
      method: "DELETE",
    },
  );
}

export async function getCrmDocument(
  documentId: string,
): Promise<CrmPartyDocument> {
  return serverFetch<CrmPartyDocument>(
    detailPath(CRM_API_PATHS.documents, documentId),
  );
}

export async function uploadCrmDocument(
  formData: FormData,
): Promise<CrmPartyDocument> {
  return serverFetch<CrmPartyDocument>(CRM_API_PATHS.documents, {
    method: "POST",
    body: formData,
  });
}

export async function createCrmInteraction(
  input: CrmPartyInteractionWriteInput,
): Promise<CrmPartyInteraction> {
  return serverFetch<CrmPartyInteraction>(CRM_API_PATHS.interactions, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCrmInteraction(
  interactionId: string,
): Promise<CrmPartyInteraction> {
  return serverFetch<CrmPartyInteraction>(
    detailPath(CRM_API_PATHS.interactions, interactionId),
  );
}

export async function updateCrmInteraction(
  interactionId: string,
  input: Partial<CrmPartyInteractionWriteInput>,
): Promise<CrmPartyInteraction> {
  return serverFetch<CrmPartyInteraction>(
    detailPath(CRM_API_PATHS.interactions, interactionId),
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteCrmInteraction(
  interactionId: string,
): Promise<void> {
  await serverFetch<null>(
    detailPath(CRM_API_PATHS.interactions, interactionId),
    {
      method: "DELETE",
    },
  );
}

// export async function createCrmAffiliation(
//   input: CrmPartyAffiliationWriteInput,
// ): Promise<unknown> {
//   return serverFetch(CRM_API_PATHS.affiliations, {
//     method: "POST",
//     body: JSON.stringify(input),
//   });
// }

export async function listCrmAffiliations(
  query: CrmPartyAffiliationListQuery = {},
): Promise<PaginatedResponse<CrmPartyAffiliation>> {
  return serverFetch<PaginatedResponse<CrmPartyAffiliation>>(
    buildCrmApiPath(CRM_API_PATHS.affiliations, query),
  );
}

export async function getCrmAffiliation(
  affiliationId: string,
): Promise<CrmPartyAffiliation> {
  return serverFetch<CrmPartyAffiliation>(
    detailPath(CRM_API_PATHS.affiliations, affiliationId),
  );
}

export async function createCrmAffiliation(
  input: CrmPartyAffiliationWriteInput,
): Promise<CrmPartyAffiliation> {
  return serverFetch<CrmPartyAffiliation>(CRM_API_PATHS.affiliations, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCrmAffiliation(
  affiliationId: string,
  input: Partial<CrmPartyAffiliationWriteInput>,
): Promise<CrmPartyAffiliation> {
  return serverFetch<CrmPartyAffiliation>(
    detailPath(CRM_API_PATHS.affiliations, affiliationId),
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteCrmAffiliation(
  affiliationId: string,
): Promise<void> {
  await serverFetch<null>(
    detailPath(CRM_API_PATHS.affiliations, affiliationId),
    {
      method: "DELETE",
    },
  );
}
