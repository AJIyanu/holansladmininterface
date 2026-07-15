import type {
  ReactNode,
} from "react";

import {
  CRM_ANY_VIEW_PERMISSIONS,
} from "@/features/crm/permissions";

import {
  requireCrmPermission,
} from "@/features/crm/server";

interface CrmLayoutProps {
  children: ReactNode;
}

export default async function CrmLayout({
  children,
}: CrmLayoutProps) {
  await requireCrmPermission(
    CRM_ANY_VIEW_PERMISSIONS,
  );

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {children}
    </div>
  );
}