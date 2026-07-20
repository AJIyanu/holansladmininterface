import Link from "next/link";

import {
  Activity,
  Building2,
  FileText,
  Settings,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

import { CRM_PAGE_DEFINITIONS } from "@/features/crm/routes";

import { CRM_ANY_VIEW_PERMISSIONS } from "@/features/crm/permissions";

import { requireCrmPermission } from "@/features/crm/server";

import { hasPermission } from "@/types/auth";
import { crmPermissionInput } from "@/features/crm/permissions";

const pageIcons = {
  "All Parties": Users,
  Clients: Users,
  Suppliers: Building2,
  Prospects: UserPlus,
  Contacts: UserCog,
  Registrations: FileText,
  Interactions: Activity,
  "Contact Roles": Settings,
  Documents: FileText,
};

export default async function CrmOverviewPage() {
  const user = await requireCrmPermission(CRM_ANY_VIEW_PERMISSIONS);

  const allowedPages = CRM_PAGE_DEFINITIONS.filter(
    (page) =>
      page.href !== "/dashboard/crm" &&
      hasPermission(user, crmPermissionInput(page.permission)),
  );

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#0F4C81] p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#FED7AA]">
          Customer relationship management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">CRM Overview</h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#E2E8F0] sm:text-base">
          Manage organisations, individuals, suppliers, prospects, registrations
          and relationship activity from one permission-controlled workspace.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {allowedPages.map((page) => {
          const Icon = pageIcons[page.title as keyof typeof pageIcons] ?? Users;

          return (
            <Link
              key={page.href}
              href={page.href}
              className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FDBA74] hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1E8] text-[#F46C0B] transition group-hover:bg-[#F46C0B] group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-[#0F172A]">
                {page.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                {page.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
