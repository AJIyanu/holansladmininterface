"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { invoiceValuesSchema } from "./schema";
import type { Invoice } from "./types";
async function allowed(action: string) {
  const user = await getCurrentUser();
  return (
    !!user &&
    (user.is_staff || user.is_superuser) &&
    hasPermission(user, "ledger.salesledger.view") &&
    hasPermission(user, "ledger.salesinvoice.view") &&
    hasPermission(user, `ledger.salesinvoice.${action}`) &&
    (action !== "deliver" ||
      hasPermission(user, "ledger.salestransaction.create"))
  );
}
function errorMessage(error: unknown) {
  if (error instanceof ServerFetchError) {
    if ([401, 403].includes(error.status))
      return "Your session or permissions changed. Refresh the page.";
    if (error.status === 400)
      return (
        Object.values(error.responseBody ?? {})
          .flat()
          .filter((v) => typeof v === "string")
          .join(" ") || "Review the invoice details."
      );
  }
  return "Unable to complete this request. Retry with the same details.";
}
function refresh(id: string) {
  revalidatePath("/dashboard/ledger/sales");
  revalidatePath("/dashboard/ledger/ledgers/sales");
  revalidatePath("/dashboard/ledger/cashbook/journal");
  revalidatePath(`/dashboard/ledger/sales/invoices/${id}`);
  revalidatePath("/dashboard/ledger/journal");
}
export async function saveInvoice(
  input: unknown,
): Promise<{ invoice?: Invoice; error?: string }> {
  const parsed = z
    .object({
      party: z.uuid(),
      id: z.uuid().optional(),
      version: z.number().int().positive().optional(),
      request_key: z.uuid(),
      values: invoiceValuesSchema,
    })
    .safeParse(input);
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the invoice details.",
    };
  const d = parsed.data;
  if (!(await allowed(d.id ? "edit" : "create")))
    return { error: "You do not have permission to save this invoice." };
  try {
    const invoice = await serverFetch<Invoice>(
      d.id
        ? `/ledger/sales-invoices/${d.id}/`
        : `/ledger/sales-invoices/parties/${d.party}/`,
      {
        method: d.id ? "PATCH" : "POST",
        body: JSON.stringify({
          ...d.values,
          version: d.version,
          request_key: d.request_key,
        }),
      },
    );
    refresh(invoice.id);
    return { invoice };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
export async function invoiceAction(
  input: unknown,
): Promise<{ invoice?: Invoice; error?: string }> {
  const parsed = z
    .object({
      id: z.uuid(),
      version: z.number().int().positive(),
      request_key: z.uuid(),
      action: z.enum(["confirm", "deliver"]),
      delivery_date: z.string().date().optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { error: "Check the invoice action." };
  const { id, action, ...body } = parsed.data;
  if (!(await allowed(action)))
    return { error: "You do not have permission for this action." };
  try {
    const invoice = await serverFetch<Invoice>(
      `/ledger/sales-invoices/${id}/${action}/`,
      { method: "POST", body: JSON.stringify(body) },
    );
    refresh(id);
    return { invoice };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
export async function emailInvoice(
  input: unknown,
): Promise<{ status?: string; error?: string }> {
  const parsed = z
    .object({
      id: z.uuid(),
      version: z.number().int().positive(),
      request_key: z.uuid(),
      destination: z.email(),
      subject: z
        .string()
        .trim()
        .min(1)
        .max(250)
        .refine((v) => !/[\r\n]/.test(v)),
      message: z.string().trim().min(1).max(10000),
    })
    .safeParse(input);
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the email details.",
    };
  if (!(await allowed("email")))
    return { error: "You do not have permission to email invoices." };
  const { id, ...body } = parsed.data;
  try {
    const result = await serverFetch<{ status: string }>(
      `/ledger/sales-invoices/${id}/email/`,
      { method: "POST", body: JSON.stringify(body) },
    );
    refresh(id);
    return { status: result.status };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
