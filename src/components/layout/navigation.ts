import {
  Activity,
  // Archive,
  Bell,
  Bot,
  Building2,
  ClipboardList,
  FileText,
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
    title: "Accounts",
    items: [
      {
        title: "Ledger",
        icon: FileText,
        children: [
          {
            title: "Sales Ledger",
            href: "/dashboard/ledger/ledgers/sales",
            icon: Receipt,
            permission: "ledger.salesledger.view",
          },
          {
            title: "Purchase Ledger",
            href: "/dashboard/ledger/ledgers/purchase",
            icon: ShoppingCart,
            permission: "ledger.purchaseledger.view",
          },
          {
            title: "Procurement approvals",
            href: "/dashboard/ledger/ledgers/procurement",
            icon: FileText,
            permission: "ledger.procurement.approve",
          },
          {
            title: "Settings",
            href: "/dashboard/ledger/ledgers/settings",
            icon: FileText,
            permission: "ledger.ledgeraccount.view",
          },
        ],
      },
      {
        title: "Cashbook",
        icon: HandCoins,
        children: [
          {
            title: "Entry",
            href: "/dashboard/ledger/cashbook/entry",
            icon: ListPlus,
            permission: "ledger.cashbookentry.view",
          },
          {
            title: "Double Entry",
            href: "/dashboard/ledger/cashbook/journal",
            icon: FileText,
            permission: "ledger.cashbookjournal.view",
          },
        ],
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        title: "Requests & Tracking",
        icon: ClipboardList,
        children: [
          {
            title: "All Requests",
            href: "/dashboard/procurement/requests",
            icon: ClipboardList,
            permission: "procurement.procurementrequest.view",
          },
          {
            title: "New Request",
            href: "/dashboard/procurement/requests/new",
            icon: ClipboardList,
            permission: "procurement.procurementrequest.create",
          },
          {
            title: "Item Trackers",
            href: "/dashboard/procurement/items",
            icon: ClipboardList,
            permission: "procurement.requestitem.view",
          },
        ],
      },
      {
        title: "Sourcing & Quotations",
        icon: Receipt,
        children: [
          {
            title: "Supplier Offers",
            href: "/dashboard/procurement/supplier-quotations",
            icon: Receipt,
            permission: "procurement.supplierquotation.view",
          },
          {
            title: "Client Quotations",
            href: "/dashboard/procurement/quotations",
            icon: Receipt,
            permission: "procurement.clientquotation.view",
          },
          {
            title: "Prepare Quotation",
            href: "/dashboard/procurement/quotations/new",
            icon: Receipt,
            permission: "procurement.clientquotation.create",
          },
        ],
      },
      {
        title: "Purchase Orders",
        icon: ShoppingCart,
        children: [
          {
            title: "Client Purchase Orders",
            href: "/dashboard/procurement/purchase-orders",
            icon: ShoppingCart,
            permission: "procurement.clientpurchaseorder.view",
          },
          {
            title: "Record Purchase Order",
            href: "/dashboard/procurement/purchase-orders/new",
            icon: ShoppingCart,
            permission: "procurement.clientpurchaseorder.create",
          },
        ],
      },
      {
        title: "Purchasing",
        icon: PackageCheck,
        children: [
          {
            title: "Supplier Purchases",
            href: "/dashboard/procurement/supplier-purchases",
            icon: PackageCheck,
            permission: "procurement.supplierpurchase.view",
          },
          {
            title: "Goods Received",
            href: "/dashboard/procurement/goods-receipts",
            icon: PackageCheck,
            permission: "procurement.goodsreceipt.view",
          },
        ],
      },
      {
        title: "Delivery & Rejections",
        icon: Send,
        children: [
          {
            title: "Deliveries & Waybills",
            href: "/dashboard/procurement/deliveries",
            icon: Send,
            permission: "procurement.delivery.view",
          },
          {
            title: "Rejected Items & Replacements",
            href: "/dashboard/procurement/outcome-lines",
            icon: Send,
            permission: "procurement.deliveryoutcomeline.view",
          },
        ],
      },
      {
        title: "Finance Requests",
        icon: HandCoins,
        children: [
          {
            title: "Invoice Requests",
            href: "/dashboard/procurement/finance-requests?kind=INVOICE",
            icon: HandCoins,
            permission: "procurement.financerequest.view",
          },
          {
            title: "Advance Requests",
            href: "/dashboard/procurement/finance-requests?kind=ADVANCE",
            icon: HandCoins,
            permission: "procurement.financerequest.view",
          },
          {
            title: "Cost Breakdowns",
            href: "/dashboard/procurement/costs",
            icon: HandCoins,
            permission: "procurement.procurementcost.view",
          },
        ],
      },
      {
        title: "Documents",
        icon: FileText,
        children: [
          {
            title: "Document Register",
            href: "/dashboard/procurement/document-register",
            icon: FileText,
            permission: "procurement.documentregister.view",
          },
          {
            title: "Prepare Document",
            href: "/dashboard/procurement/document-versions/new",
            icon: FileText,
            permission: "procurement.documentversion.create",
          },
          {
            title: "Uploaded Evidence",
            href: "/dashboard/procurement/documents",
            icon: FileText,
            permission: "procurement.procurementdocument.view",
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
        title: "Party Management",
        icon: Users,
        children: [
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
        ],
      },
      {
        title: "Records & Engagement",
        icon: FileText,
        children: [
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
        ],
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

function canSeeNavigationLink(
  user: CurrentUser,
  href: string | undefined,
  permission: string | string[] | undefined,
): boolean {
  if (
    href?.startsWith("/dashboard/ledger/cashbook/entry") &&
    !user.is_staff &&
    !user.is_superuser
  )
    return false;
  if (!href?.startsWith("/dashboard/procurement"))
    return hasPermission(user, permission);
  if (!user.is_staff && !user.is_superuser) return false;
  const required = [
    "procurement.procurementrequest.view",
    ...(Array.isArray(permission)
      ? permission
      : permission
        ? [permission]
        : []),
  ];
  if (typeof permission === "string" && permission.endsWith(".create")) {
    required.push(
      "procurement.procurementrequest.operate",
      permission.replace(/\.create$/, ".view"),
    );
  }
  return (
    user.is_superuser ||
    required.every((value) => user.permissions.includes(value))
  );
}

function filterNavigationItem(
  item: NavigationItem,
  user: CurrentUser,
): NavigationItem | null {
  if (item.children) {
    const allowedChildren = item.children.filter((child) =>
      canSeeNavigationLink(user, child.href, child.permission),
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

  return canSeeNavigationLink(user, item.href, item.permission) ? item : null;
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
