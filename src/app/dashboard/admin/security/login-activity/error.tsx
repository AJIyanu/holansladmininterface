"use client";

import SecurityPageError from "@/features/account/security/security-page-error";

export default function LoginActivityError({ reset }: { error: Error; reset: () => void }) {
  return <SecurityPageError title="Unable to load login activity" reset={reset} />;
}
