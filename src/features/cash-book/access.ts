import "server-only";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";

export async function requireCashBook(journal = false) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(
      user,
      `ledger.${journal ? "cashbookjournal" : "cashbookentry"}.view`,
    )
  )
    notFound();
  return user;
}
