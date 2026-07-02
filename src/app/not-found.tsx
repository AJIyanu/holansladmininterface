import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardNotFound from "@/components/errors/dashboard-not-found";
import PublicNotFound from "@/components/errors/public-not-found";
import { getCurrentUser } from "@/lib/auth-server";

async function getSafeCurrentUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export default async function NotFound() {
  const currentUser = await getSafeCurrentUser();

  if (currentUser) {
    return (
      <DashboardLayout>
        <DashboardNotFound />
      </DashboardLayout>
    );
  }

  return <PublicNotFound />;
}
