import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth logic needed here - middleware handles it!
  return <DashboardLayout>{children}</DashboardLayout>;
}
