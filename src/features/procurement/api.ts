import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { serverFetch } from "@/lib/server-fetch";
import { can } from "./types";
export async function requireProcurement(
  permission = "procurement.procurementrequest.view",
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    !(user.is_staff || user.is_superuser) ||
    !can(user, "procurement.procurementrequest.view") ||
    !can(user, permission)
  )
    redirect("/dashboard/unauthorized");
  return user;
}
export function procurementGet<T>(path: string) {
  return serverFetch<T>(`/procurement/${path}`, { cache: "no-store" });
}
