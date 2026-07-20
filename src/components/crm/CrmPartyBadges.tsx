import { formatCrmEnum } from "@/features/crm/format";

import type {
  CrmPartyListItem,
  CrmPartyStatus,
  CrmVerificationLevel,
} from "@/features/crm/types";

function statusClass(status: CrmPartyStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]";
    case "INACTIVE":
      return "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]";
    case "SUSPENDED":
      return "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]";
    case "BLOCKED":
      return "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]";
    case "MERGED":
      return "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]";
  }
}

function verificationClass(level: CrmVerificationLevel): string {
  switch (level) {
    case "VERIFIED":
      return "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]";
    case "BASIC":
      return "bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]";
    case "MINIMAL":
      return "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]";
  }
}

export function CrmStatusBadge({ status }: { status: CrmPartyStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}
    >
      {formatCrmEnum(status)}
    </span>
  );
}

export function CrmVerificationBadge({
  level,
}: {
  level: CrmVerificationLevel;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationClass(level)}`}
    >
      {formatCrmEnum(level)}
    </span>
  );
}

export function CrmRoleBadges({ party }: { party: CrmPartyListItem }) {
  const activeRoles = party.roles.filter((role) => role.is_active);

  if (activeRoles.length === 0) {
    return <span className="text-xs text-[#94A3B8]">No active role</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {activeRoles.map((role) => (
        <span
          key={role.id}
          className="inline-flex items-center rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-xs font-medium text-[#C2410C]"
        >
          {role.role_display || formatCrmEnum(role.role)}
        </span>
      ))}
    </div>
  );
}
