import { getCurrentUser } from "@/lib/auth-server";
import UserProvider from "@/components/UserProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { redirect } from "next/navigation";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getCurrentUser();

    return (
      <UserProvider user={user}>
        <DashboardLayout>{children}</DashboardLayout>
      </UserProvider>
    );
  } catch (error) {
    redirect("/login");
  }
}
