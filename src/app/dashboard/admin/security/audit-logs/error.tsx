"use client";

import SecurityPageError from "@/features/account/security/security-page-error";

export default function AuditLogsError({ reset }: { error: Error; reset: () => void }) {
  return <SecurityPageError title="Unable to load audit logs" reset={reset} />;
}
