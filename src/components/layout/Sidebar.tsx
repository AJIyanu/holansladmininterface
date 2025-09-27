import { NavigationBreakdown } from "./NavBreakDown";

export const sampleNavigationData = {
  General: [
    {
      name: "Overview",
      iconname: "orders",
      link: "/dashboard/",
    },
    {
      name: "Tasks Management",
      iconname: "orders",
      subitems: [
        {
          subitemname: "New Task",
          iconname: "procurement",
          link: "/dashboard/orders/create",
        },
        {
          subitemname: "Pending Tasks",
          iconname: "clock",
          link: "/dashboard/orders/pending",
        },
        {
          subitemname: "Task History",
          iconname: "archive",
          link: "/dashboard/orders/history",
        },
      ],
    },
    {
      name: "AI Assistant",
      iconname: "orders",
      subitems: [
        {
          subitemname: "Perform Analysis",
          iconname: "procurement",
          link: "/dashboard/orders/create",
        },
        {
          subitemname: "Chat with AI",
          iconname: "clock",
          link: "/dashboard/orders/pending",
        },
      ],
    },
  ],
  Procurement: [
    {
      name: "Purchase Orders",
      iconname: "orders",
      subitems: [
        {
          subitemname: "Create Order",
          iconname: "procurement",
          link: "/dashboard/po/new",
        },
        {
          subitemname: "Track Orders",
          iconname: "track",
          link: "/dashboard/po",
        },
        // {
        //   subitemname: "Order History",
        //   iconname: "archive",
        //   link: "/dashboard/po/track",
        // },
      ],
    },
    {
      name: "Requests",
      iconname: "orders",
      subitems: [
        {
          subitemname: "Create Request",
          iconname: "procurement",
          link: "/dashboard/orders/create",
        },
        {
          subitemname: "Pending Requests",
          iconname: "clock",
          link: "/dashboard/orders/pending",
        },
        {
          subitemname: "View Requests",
          iconname: "archive",
          link: "/dashboard/orders/history",
        },
      ],
    },
    {
      name: "Quotations",
      iconname: "orders",
      subitems: [
        {
          subitemname: "Create Quotation",
          iconname: "procurement",
          link: "/dashboard/orders/create",
        },
        {
          subitemname: "Manage Quotations",
          iconname: "clock",
          link: "/dashboard/orders/pending",
        },
      ],
    },
  ],
  CRM: [
    {
      name: "Suppliers",
      iconname: "suppliers",
      subitems: [
        {
          subitemname: "Supplier Directory",
          iconname: "building",
          link: "/dashboard/suppliers",
        },
        {
          subitemname: "Supplier Profiles",
          iconname: "adduser",
          link: "/dashboard/suppliers/profiles",
        },
      ],
    },
    {
      name: "Customers",
      iconname: "customers",
      subitems: [
        {
          subitemname: "Customer Directory",
          iconname: "users",
          link: "/dashboard/customers/",
        },
        {
          subitemname: "Customer Profiles",
          iconname: "user",
          link: "/dashboard/customers/profiles",
        },
      ],
    },
  ],
  Finance: [
    {
      name: "Accounting",
      iconname: "finance",
      subitems: [
        {
          subitemname: "Invoices",
          iconname: "invoices",
          link: "/dashboard/finance/invoices",
        },
        {
          subitemname: "Payments",
          iconname: "payments",
          link: "/dashboard/finance/payments",
        },
        {
          subitemname: "Expenses",
          iconname: "expenses",
          link: "/dashboard/finance/expenses",
        },
      ],
    },
    {
      name: "Reports",
      iconname: "reports",
      subitems: [
        {
          subitemname: "Financial Reports",
          iconname: "reports",
          link: "/dashboard/finance/reports",
        },
        {
          subitemname: "Reconciliations",
          iconname: "budget",
          link: "/dashboard/finance/budget",
        },
      ],
    },
    {
      name: "Analytics",
      iconname: "analytics",
      link: "/dashboard/finance/analytics",
    },
  ],
  Administration: [
    {
      name: "User Management",
      iconname: "accounts",
      subitems: [
        {
          subitemname: "Staff Accounts",
          iconname: "user",
          link: "/dashboard/admin/users",
        },
        {
          subitemname: "Add New Staff",
          iconname: "permissions",
          link: "/dashboard/admin/roles",
        },
      ],
    },
    {
      name: "System Settings",
      iconname: "settings",
      link: "/dashboard/admin/settings",
    },
  ],
};

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 bg-white/60 backdrop-blur-sm rounded-md min-h-[calc(100vh-73px)] pt-8 px-4">
      <NavigationBreakdown navigationData={sampleNavigationData} />
    </aside>
  );
}
