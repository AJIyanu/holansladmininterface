import {
  Activity,
  // Archive,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CircleDollarSign,
  ClipboardList,
  FileBarChart,
  FilePlus2,
  FileText,
  Gauge,
  HandCoins,
  LayoutDashboard,
  PackageCheck,
  Receipt,
  Settings,
  ShoppingCart,
  Sparkles,
  UserCog,
  UserPlus,
  Users,
  WalletCards,
  FileClock,
  LockKeyhole,
  ShieldCheck,
  ListTodo,
  ClipboardCheck,
  // ListChecks,
  Send,
  ListPlus,
} from "lucide-react";

import type { CurrentUser } from "@/types/auth";
import { hasPermission } from "@/types/auth";

import type { NavigationItem, NavigationSection } from "./types";

export const dashboardNavigation: NavigationSection[] = [
  {
    title: "General",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Tasks Management",
        icon: ListTodo,
        children: [
          {
            title: "My Tasks",
            href: "/dashboard/tasks",
            icon: ClipboardList,
          },
          {
            title: "Create Task",
            href: "/dashboard/tasks/new",
            icon: ListPlus,
          },
          {
            title: "Assigned by Me",
            href: "/dashboard/tasks/created",
            icon: Send,
          },
          {
            title: "Department Tasks",
            href: "/dashboard/tasks/department",
            icon: Building2,
            permission: [
              "tasks.department_task.view",
              "tasks.department_task.manage",
              "tasks.all_task.view",
              "tasks.all_task.manage",
            ],
            // permissionMode: "some",
          },
          {
            title: "All Tasks",
            href: "/dashboard/tasks/all",
            icon: ClipboardCheck,
            permission: ["tasks.all_task.view", "tasks.all_task.manage"],
            // permissionMode: "some",
          },
          {
            title: "Reminders",
            href: "/dashboard/tasks/reminders",
            icon: Bell,
          },
        ],
      },
      {
        title: "AI Assistant",
        icon: Bot,
        children: [
          {
            title: "Perform Analysis",
            href: "/dashboard/orders/create",
            icon: Sparkles,
            permission: "ai.analysis.create",
          },
          {
            title: "Chat with AI",
            href: "/dashboard/orders/pending",
            icon: Bot,
            permission: "ai.chat.view",
          },
        ],
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        title: "Purchase Orders",
        icon: ShoppingCart,
        children: [
          {
            title: "Create Order",
            href: "/dashboard/po/new",
            icon: FilePlus2,
            permission: "procurement.purchaseorder.create",
          },
          {
            title: "Track Orders",
            href: "/dashboard/po",
            icon: PackageCheck,
            permission: "procurement.purchaseorder.view",
          },
        ],
      },
      {
        title: "Requests",
        icon: ClipboardList,
        children: [
          {
            title: "Create Request",
            href: "/dashboard/requests/new",
            icon: FilePlus2,
            permission: "procurement.clientrequest.create",
          },
          {
            title: "View Requests",
            href: "/dashboard/requests",
            icon: FileText,
            permission: "procurement.clientrequest.view",
          },
        ],
      },
      {
        title: "Quotations",
        icon: Receipt,
        children: [
          {
            title: "Create Quotation",
            href: "/dashboard/orders/create",
            icon: FilePlus2,
            permission: "procurement.quotation.create",
          },
          {
            title: "Manage Quotations",
            href: "/dashboard/orders/pending",
            icon: Receipt,
            permission: "procurement.quotation.view",
          },
        ],
      },
    ],
  },
  {
    title: "CRM",
    items: [
      {
        title: "CRM Overview",
        href: "/dashboard/crm",
        icon: LayoutDashboard,
        permission: [
          "crm.party.view",
          "crm.partyrole.view",
          "crm.contactmethod.view",
          "crm.address.view",
          "crm.partysource.view",
          "crm.contactrole.view",
          "crm.partyaffiliation.view",
          "crm.partynote.view",
          "crm.partyinteraction.view",
          "crm.partyidentifier.view",
          "crm.partybankaccount.view",
          "crm.partydocument.view",
          "crm.partystatushistory.view",
          "crm.partymergerecord.view",
        ],
      },
      {
        title: "All Parties",
        href: "/dashboard/crm/parties",
        icon: Users,
        permission: "crm.party.view",
      },
      {
        title: "Clients",
        href: "/dashboard/crm/clients",
        icon: Users,
        permission: "crm.party.view",
      },
      {
        title: "Suppliers",
        href: "/dashboard/crm/suppliers",
        icon: Building2,
        permission: "crm.party.view",
      },
      {
        title: "Prospects",
        href: "/dashboard/crm/prospects",
        icon: UserPlus,
        permission: "crm.party.view",
      },
      {
        title: "Contacts",
        href: "/dashboard/crm/contacts",
        icon: UserCog,
        permission: "crm.party.view",
      },
      {
        title: "Registrations",
        href: "/dashboard/crm/registrations",
        icon: FileText,
        permission: ["crm.partyidentifier.view", "crm.partydocument.view"],
      },
      {
        title: "Documents",
        href: "/dashboard/crm/documents",
        icon: FileText,
        permission: "crm.partydocument.view",
      },
      {
        title: "Interactions",
        href: "/dashboard/crm/interactions",
        icon: Activity,
        permission: "crm.partyinteraction.view",
      },
      {
        title: "CRM Settings",
        icon: Settings,
        children: [
          {
            title: "Contact Roles",
            href: "/dashboard/crm/settings/contact-roles",
            icon: UserCog,
            permission: "crm.contactrole.view",
          },
        ],
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Accounting",
        icon: CircleDollarSign,
        children: [
          {
            title: "Invoices",
            href: "/dashboard/finance/invoices",
            icon: FileText,
            permission: "ledger.invoice.view",
          },
          {
            title: "Payments",
            href: "/dashboard/finance/payments",
            icon: WalletCards,
            permission: "ledger.payment.view",
          },
          {
            title: "Expenses",
            href: "/dashboard/finance/expenses",
            icon: HandCoins,
            permission: "ledger.expense.view",
          },
        ],
      },
      {
        title: "Reports",
        icon: FileBarChart,
        children: [
          {
            title: "Financial Reports",
            href: "/dashboard/finance/reports",
            icon: FileBarChart,
            permission: "ledger.report.view",
          },
          {
            title: "Reconciliations",
            href: "/dashboard/finance/budget",
            icon: Gauge,
            permission: "ledger.reconciliation.view",
          },
        ],
      },
      {
        title: "Analytics",
        href: "/dashboard/finance/analytics",
        icon: BarChart3,
        permission: "ledger.analytics.view",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "User Management",
        icon: UserCog,
        children: [
          {
            title: "Staff Accounts",
            href: "/dashboard/admin/staff",
            icon: Users,
            permission: "accounts.staffprofile.view",
          },
          {
            title: "Add New Staff",
            href: "/dashboard/admin/newstaff",
            icon: UserPlus,
            permission: "accounts.staffprofile.create",
          },
          {
            title: "Roles & Permissions",
            href: "/dashboard/admin/roles",
            icon: ShieldCheck,
            permission: "accounts.role.view",
          },
          {
            title: "Departments",
            href: "/dashboard/admin/departments",
            icon: Building2,
            permission: "accounts.department.view",
          },
        ],
      },
      {
        title: "Security",
        icon: LockKeyhole,
        children: [
          {
            title: "Login Activity",
            href: "/dashboard/admin/security/login-activity",
            icon: Activity,
            permission: "accounts.auditlog.view",
          },
          {
            title: "Audit Logs",
            href: "/dashboard/admin/security/audit-logs",
            icon: FileClock,
            permission: "accounts.auditlog.view",
          },
        ],
      },
      {
        title: "System",
        icon: Settings,
        children: [
          {
            title: "System Settings",
            href: "/dashboard/admin/settings",
            icon: Settings,
            permission: "accounts.settings.view",
          },
        ],
      },
    ],
  },
];

function filterNavigationItem(
  item: NavigationItem,
  user: CurrentUser,
): NavigationItem | null {
  if (item.children) {
    const allowedChildren = item.children.filter((child) =>
      hasPermission(user, child.permission),
    );

    if (allowedChildren.length === 0) {
      return null;
    }
    // console.log("Allowed Children for", item.title, ":", allowedChildren);

    return {
      ...item,
      children: allowedChildren,
    };
  }

  return hasPermission(user, item.permission) ? item : null;
}

export function getNavigationForUser(user: CurrentUser): NavigationSection[] {
  return dashboardNavigation
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => filterNavigationItem(item, user))
        .filter((item): item is NavigationItem => item !== null),
    }))
    .filter((section) => section.items.length > 0);
}
