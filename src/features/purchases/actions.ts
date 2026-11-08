"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { purchaseValuesSchema } from "./schema";
import type { PurchaseRecord, PurchasePage } from "./types";
async function allowed(resource: string, action: string) {
  const u = await getCurrentUser();
  return (
    !!u &&
    (u.is_staff || u.is_superuser) &&
    hasPermission(u, "ledger.purchaseledger.view") &&
    hasPermission(u, `ledger.${resource}.view`) &&
    hasPermission(u, `ledger.${resource}.${action}`) &&
    (resource !== "purchasepayment" ||
      action !== "create" ||
      (hasPermission(u, "ledger.cashbookentry.create") &&
        hasPermission(u, "ledger.purchasetransaction.create")))
  );
}
function failure(e: unknown) {
  if (e instanceof ServerFetchError) {
    if ([401, 403].includes(e.status))
      return "Your session or permissions changed. Refresh the page.";
    if (e.status === 400)
      return (
        Object.values(e.responseBody ?? {})
          .flat()
          .filter((v) => typeof v === "string")
          .join(" ") || "Review the supplier document details."
      );
  }
  return "Unable to confirm the result. Retry with the same details.";
}
function refresh(kind: string, id: string) {
  for (const path of [
    "/dashboard/ledger/ledgers/purchase",
    "/dashboard/ledger/ledgers/procurement",
    "/dashboard/ledger/cashbook/entry",
    "/dashboard/ledger/cashbook/journal",
    `/dashboard/ledger/purchase/${kind}/${id}`,
  ])
    revalidatePath(path);
}
export async function savePurchase(
  data: FormData,
): Promise<{ record?: PurchaseRecord; error?: string }> {
  let raw;
  try {
    raw = JSON.parse(String(data.get("payload")));
  } catch {
    return { error: "Invalid supplier document details." };
  }
  const parsed = z
    .object({
      kind: z.enum(["bills", "payments"]),
      party: z.uuid(),
      id: z.uuid().optional(),
      version: z.number().int().positive().optional(),
      request_key: z.uuid(),
      values: purchaseValuesSchema,
    })
    .safeParse(raw);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const { kind, party, id, version, request_key, values } = parsed.data;
  if (id && kind !== "bills")
    return { error: "Only receipt evidence can change after payment." };
  if (
    !(await allowed(
      kind === "bills" ? "purchasebill" : "purchasepayment",
      id ? "edit" : "create",
    ))
  )
    return { error: "You do not have permission for this action." };
  if (kind === "bills" && !values.reference)
    return { error: "Enter the supplier invoice reference." };
  if (kind === "payments" && !z.uuid().safeParse(values.account_id).success)
    return { error: "Select a paying account." };
  if (
    kind === "payments" &&
    values.payment_method !== "CASH" &&
    !values.bank_name
  )
    return { error: "Enter the paying bank name." };
  const payload = { ...values, version, request_key };
  const file = data.get("file");
  const body = new FormData();
  body.set("payload", JSON.stringify(payload));
  if (file instanceof File && file.size) {
    if (file.size > 10 * 1024 * 1024)
      return { error: "Receipt scans must be 10 MB or smaller." };
    body.set("file", file);
  }
  try {
    const record = await serverFetch<PurchaseRecord>(
      id
        ? `/ledger/purchase-bills/${id}/`
        : `/ledger/purchase-${kind}/parties/${party}/`,
      {
        method: id ? "PATCH" : "POST",
        body: kind === "payments" ? body : JSON.stringify(payload),
      },
    );
    refresh(kind, record.id);
    return { record };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function deliverBill(
  input: unknown,
): Promise<{ error?: string; success?: boolean }> {
  const p = z
    .object({
      id: z.uuid(),
      request_key: z.uuid(),
      version: z.number().int().positive(),
      delivery_date: z.string().date(),
    })
    .safeParse(input);
  if (!p.success || !(await allowed("purchasebill", "deliver")))
    return { error: "You cannot confirm this delivery." };
  try {
    const { id, ...body } = p.data;
    await serverFetch(`/ledger/purchase-bills/${id}/deliver/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    refresh("bills", id);
    return { success: true };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function billChoices(
  input: unknown,
): Promise<{ data?: PurchasePage; error?: string }> {
  const p = z
    .object({
      party: z.uuid(),
      search: z.string().max(100),
      page: z.number().int().positive(),
    })
    .safeParse(input);
  if (!p.success || !(await allowed("purchasebill", "view")))
    return { error: "You cannot view supplier invoices." };
  try {
    return {
      data: await serverFetch<PurchasePage>(
        `/ledger/purchase-bills/parties/${p.data.party}/?${new URLSearchParams({ search: p.data.search, page: String(p.data.page) })}`,
      ),
    };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function updateSupplierEvidence(
  data: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const p = z
    .object({
      id: z.uuid(),
      request_key: z.uuid(),
      version: z.coerce.number().int().positive(),
      receipt_number: z.string().trim().max(100),
    })
    .safeParse(
      Object.fromEntries(
        ["id", "request_key", "version", "receipt_number"].map((k) => [
          k,
          data.get(k),
        ]),
      ),
    );
  if (!p.success || !(await allowed("purchasepayment", "edit")))
    return { error: "Check the receipt number and your edit permissions." };
  const { id, ...payload } = p.data;
  const body = new FormData();
  body.set("payload", JSON.stringify(payload));
  const file = data.get("file");
  if (file instanceof File && file.size) {
    if (file.size > 10 * 1024 * 1024)
      return { error: "Receipt scans must be 10 MB or smaller." };
    body.set("file", file);
  }
  try {
    await serverFetch(`/ledger/purchase-payments/${id}/`, {
      method: "PATCH",
      body,
    });
    refresh("payments", id);
    return { success: true };
  } catch (e) {
    return { error: failure(e) };
  }
}
