import {
  listCrmContactRoles,
} from "@/features/crm/api";
import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";
import {
  requireCrmPermission,
} from "@/features/crm/server";

import {
  CrmContactRolesManager,
} from "@/components/crm/CrmContactRolesManager";

export default async function ContactRolesPage() {
  const user = await requireCrmPermission(
    CRM_PERMISSIONS.contactRole.view,
  );

  const data = await listCrmContactRoles({
    page_size: 100,
    ordering: "sort_order,name",
  });

  return (
    <CrmContactRolesManager
      user={user}
      data={data}
    />
  );
}