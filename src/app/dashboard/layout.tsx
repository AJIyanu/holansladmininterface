import { getCurrentUser } from "@/lib/auth-server";
import UserProvider from "@/components/UserProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { redirect } from "next/navigation";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("🔄 Layout rendering at", new Date().toISOString());
  const user = await getCurrentUser();
  console.log("👤 User fetched:", user);

  if (!user) {
    redirect("/login");
  }

  return (
    <UserProvider user={user}>
      <DashboardLayout>{children}</DashboardLayout>
    </UserProvider>
  );
}
