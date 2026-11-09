"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { requestSchema, policySchema } from "./schema";
import { actionPermission, type Page, type Source } from "./types";
async function allowed(action = "view") {
  const u = await getCurrentUser();
  return (
    !!u &&
    (u.is_staff || u.is_superuser) &&
    hasPermission(u, "ledger.taxledger.view") &&
    hasPermission(u, `ledger.taxledger.${action}`)
  );
}
function failure(e: unknown) {
  if (e instanceof ServerFetchError && e.status === 400)
    return (
      Object.values(e.responseBody ?? {})
        .flat()
        .filter((v) => typeof v === "string")
        .join(" ") || "Check the details."
    );
  return "Unable to confirm the result. Check your permissions and retry with the same details.";
}
export async function submitTax(
  data: FormData,
): Promise<{ id?: string; error?: string }> {
  let raw: unknown;
  try {
    raw = JSON.parse(String(data.get("payload")));
  } catch {
    return { error: "Invalid request." };
  }
  const key = z.uuid().safeParse(data.get("request_key"));
  const p = requestSchema.safeParse(raw);
  if (
    !p.success ||
    !key.success ||
    !(await allowed(actionPermission[p.data.action]))
  )
    return { error: "Check the form and your permissions." };
  const values = Object.fromEntries(
    Object.entries(p.data).filter(([, v]) => v !== ""),
  );
  const body = new FormData();
  body.set("payload", JSON.stringify({ ...values, request_key: key.data }));
  const file = data.get("file");
  if (file instanceof File && file.size) {
    if (file.size > 10 * 1024 * 1024)
      return { error: "Maximum supporting document size is 10 MB." };
    body.set("file", file);
  }
  try {
    const result = await serverFetch<{ id: string }>("/ledger/tax/requests/", {
      method: "POST",
      body,
    });
    revalidatePath("/dashboard/ledger", "layout");
    return { id: result.id };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function decideTax(
  input: unknown,
): Promise<{ success?: boolean; error?: string }> {
  const p = z
    .object({
      id: z.uuid(),
      request_key: z.uuid(),
      approved: z.boolean(),
      reason: z.string().trim().min(1).max(1000),
    })
    .safeParse(input);
  if (!p.success || !(await allowed("approve")))
    return { error: "Check your approval permission and reason." };
  const { id, ...body } = p.data;
  try {
    await serverFetch(`/ledger/tax/requests/${id}/decision/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    revalidatePath("/dashboard/ledger", "layout");
    return { success: true };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function saveTaxPolicy(
  input: unknown,
): Promise<{ success?: boolean; error?: string }> {
  const p = policySchema.extend({ request_key: z.uuid() }).safeParse(input);
  if (!p.success || !(await allowed("configure")))
    return {
      error: "Check the rate, date, reason and configuration permission.",
    };
  try {
    await serverFetch("/ledger/tax/policies/", {
      method: "POST",
      body: JSON.stringify({ ...p.data, party_id: p.data.party_id || null }),
    });
    revalidatePath("/dashboard/ledger", "layout");
    return { success: true };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function searchTaxSources(
  input: unknown,
): Promise<{ data?: Page<Source>; error?: string }> {
  const p = z
    .object({
      currency: z.enum(["NGN", "USD", "GBP"]),
      search: z.string().max(100),
      page: z.number().int().positive(),
    })
    .safeParse(input);
  if (!p.success || !(await allowed()))
    return { error: "Cannot view tax sources." };
  try {
    return {
      data: await serverFetch(
        `/ledger/tax/sources/?${new URLSearchParams({ ...p.data, page: String(p.data.page) })}`,
      ),
    };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function getSalesTaxRates(
  input: unknown,
): Promise<{ vat_rate?: string; withholding_rate?: string; error?: string }> {
  const p = z
    .object({
      date: z.string().date(),
      party: z.uuid(),
      invoice: z.uuid().optional(),
    })
    .safeParse(input);
  const u = await getCurrentUser();
  if (
    !p.success ||
    !u ||
    (!u.is_staff && !u.is_superuser) ||
    !hasPermission(u, "ledger.salesledger.view") ||
    !(
      hasPermission(u, "ledger.salesreceipt.view") ||
      hasPermission(u, "ledger.salesinvoice.view")
    )
  )
    return { error: "Cannot load tax rates." };
  try {
    return await serverFetch(
      `/ledger/tax/rates/?${new URLSearchParams(Object.fromEntries(Object.entries(p.data).filter(([, v]) => v !== undefined) as Array<[string, string]>))}`,
    );
  } catch {
    return { error: "Unable to load tax rates. Retry before reviewing." };
  }
}

export async function searchTaxParties(
  search: string,
  page = 1,
): Promise<{ data?: Page<{ id: string; name: string }>; error?: string }> {
  if (
    search.length > 100 ||
    !Number.isInteger(page) ||
    page < 1 ||
    !(await allowed())
  )
    return { error: "Cannot search parties." };
  try {
    return {
      data: await serverFetch(
        `/ledger/tax/parties/?${new URLSearchParams({ search, page: String(page) })}`,
      ),
    };
  } catch (e) {
    return { error: failure(e) };
  }
}
