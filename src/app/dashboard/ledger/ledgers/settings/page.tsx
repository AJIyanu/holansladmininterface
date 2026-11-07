import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch } from "@/lib/server-fetch";
import {
  AccountSettings,
  type Account,
} from "@/components/party-ledger/AccountSettings";
export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, "ledger.ledgeraccount.view")
  )
    notFound();
  const accounts = await serverFetch<Account[]>("/ledger/accounts/");
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <AccountSettings
        accounts={accounts}
        canCreate={hasPermission(user, "ledger.ledgeraccount.create")}
        canEdit={hasPermission(user, "ledger.ledgeraccount.edit")}
      />
    </main>
  );
}
