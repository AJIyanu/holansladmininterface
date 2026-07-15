import type {
  CrmEntityKind,
  CrmPartyRoleName,
  CrmPartyStatus,
  CrmVerificationLevel,
  CrmIdentifierType,
  CrmVerificationStatus,
  CrmDocumentCategory,
} from "./types";

export function formatCrmEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCrmDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCrmDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export const CRM_ENTITY_KIND_OPTIONS: {
  value: CrmEntityKind;
  label: string;
}[] = [
  {
    value: "ORGANISATION",
    label: "Organisation",
  },
  {
    value: "INDIVIDUAL",
    label: "Individual",
  },
  {
    value: "TRADING_NAME",
    label: "Trading name / informal business",
  },
];

export const CRM_VERIFICATION_LEVEL_OPTIONS: {
  value: CrmVerificationLevel;
  label: string;
}[] = [
  {
    value: "MINIMAL",
    label: "Minimal",
  },
  {
    value: "BASIC",
    label: "Basic",
  },
  {
    value: "VERIFIED",
    label: "Verified",
  },
];

export const CRM_PARTY_ROLE_OPTIONS: {
  value: CrmPartyRoleName;
  label: string;
}[] = [
  {
    value: "CLIENT",
    label: "Client",
  },
  {
    value: "SUPPLIER",
    label: "Supplier",
  },
  {
    value: "PROSPECT",
    label: "Prospect",
  },
  {
    value: "LOGISTICS_PROVIDER",
    label: "Logistics provider",
  },
  {
    value: "SERVICE_PROVIDER",
    label: "Service provider",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

export const CRM_PARTY_STATUS_OPTIONS: {
  value: CrmPartyStatus;
  label: string;
}[] = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
  },
  {
    value: "BLOCKED",
    label: "Blocked",
  },
  {
    value: "MERGED",
    label: "Merged",
  },
];

export const CRM_IDENTIFIER_TYPE_OPTIONS: {
  value: CrmIdentifierType;
  label: string;
}[] = [
  {
    value: "COMPANY_REGISTRATION",
    label: "Company registration",
  },
  {
    value: "TAX_ID",
    label: "Tax ID",
  },
  {
    value: "VAT",
    label: "VAT",
  },
  {
    value: "IMPORT_EXPORT",
    label: "Import / export",
  },
  {
    value: "MARKETPLACE_SELLER",
    label: "Marketplace seller ID",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

// export const CRM_VERIFICATION_STATUS_OPTIONS: {
//   value: CrmVerificationStatus;
//   label: string;
// }[] = [
//   {
//     value: "UNVERIFIED",
//     label: "Unverified",
//   },
//   {
//     value: "PENDING",
//     label: "Pending",
//   },
//   {
//     value: "VERIFIED",
//     label: "Verified",
//   },
//   {
//     value: "REJECTED",
//     label: "Rejected",
//   },
// ];

export const CRM_DOCUMENT_CATEGORY_OPTIONS: {
  value: CrmDocumentCategory;
  label: string;
}[] = [
  {
    value: "REGISTRATION",
    label: "Registration",
  },
  {
    value: "TAX",
    label: "Tax",
  },
  {
    value: "BANK",
    label: "Bank",
  },
  {
    value: "CONTRACT",
    label: "Contract",
  },
  {
    value: "CORRESPONDENCE",
    label: "Correspondence",
  },
  {
    value: "IDENTITY",
    label: "Identity",
  },
  {
    value: "QUOTE",
    label: "Quote",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

export const CRM_VERIFICATION_STATUS_OPTIONS: {
  value: CrmVerificationStatus;
  label: string;
}[] = [
  {
    value: "UNVERIFIED",
    label: "Unverified",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "VERIFIED",
    label: "Verified",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
];

export function formatFileSize(sizeBytes: number | null | undefined): string {
  if (!sizeBytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = sizeBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size = size / 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function documentMimeLabel(mimeType: string): string {
  if (mimeType === "application/pdf") {
    return "PDF";
  }

  if (mimeType.startsWith("image/")) {
    return "Image";
  }

  if (mimeType === "text/plain") {
    return "Text";
  }

  if (
    mimeType.includes("wordprocessingml") ||
    mimeType === "application/msword"
  ) {
    return "Word document";
  }

  if (
    mimeType.includes("spreadsheetml") ||
    mimeType === "application/vnd.ms-excel"
  ) {
    return "Spreadsheet";
  }

  return mimeType || "File";
}

export function canBrowserPreviewDocument(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType === "text/plain"
  );
}
