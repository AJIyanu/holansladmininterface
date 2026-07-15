import {
  Settings,
} from "lucide-react";

import {
  CrmPageShell,
} from "@/components/crm/CrmPageShell";

import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";

import {
  requireCrmPermission,
} from "@/features/crm/server";

export default async function ContactRolesPage() {
  await requireCrmPermission(
    CRM_PERMISSIONS.contactRole.view,
  );

  return (
    <CrmPageShell
      title="Contact Roles"
      description="Configure the responsibilities individuals may hold for an organisation."
      icon={Settings}
      stageDescription="The contact-role list API and permission guard are ready."
      capabilities={[
        "Create contact roles",
        "Edit labels and descriptions",
        "Control role ordering",
        "Deactivate unused roles",
        "Assign roles through Party affiliations",
      ]}
    />
  );
}