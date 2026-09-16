import "server-only";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { can } from "@/features/procurement/types";
export async function requireLedger(
  permission = "ledger.financialrecord.view",
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    !(user.is_staff || user.is_superuser) ||
    !can(user, "ledger.financialrecord.view") ||
    !can(user, permission)
  )
    redirect("/dashboard/unauthorized");
  return user;
}
export async function ledgerGet<T>(path: string): Promise<T> {
  try {
    return await serverFetch<T>(`/ledger/${path}`, { cache: "no-store" });
  } catch (error) {
    if (error instanceof ServerFetchError) {
      if (error.status === 404) notFound();
      if (error.status === 403) redirect("/dashboard/unauthorized");
    }
    throw error;
  }
}
