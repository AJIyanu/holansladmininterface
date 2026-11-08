"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { receiptValuesSchema } from "./schema";
import type { Receipt } from "./types";
import type { Invoice, InvoicePage } from "../sales-invoice/types";
async function allowed(action: string) {
  const user = await getCurrentUser();
  return (
    !!user &&
    (user.is_staff || user.is_superuser) &&
    hasPermission(user, "ledger.salesledger.view") &&
    hasPermission(user, "ledger.salesreceipt.view") &&
    hasPermission(user, `ledger.salesreceipt.${action}`) &&
    (action !== "create" ||
      (hasPermission(user, "ledger.salestransaction.create") &&
        hasPermission(user, "ledger.cashbookentry.create")))
  );
}
function message(error: unknown): string {
  if (error instanceof ServerFetchError) {
    if ([401, 403].includes(error.status))
      return "Your session or permissions changed. Refresh the page.";
    if (error.status === 400)
      return (
        Object.values(error.responseBody ?? {})
          .flat()
          .filter((v) => typeof v === "string")
          .join(" ") || "Review the receipt details."
      );
  }
  return "Unable to confirm the result. Retry with the same details.";
}
export async function createReceipt(
  input: unknown,
): Promise<{ receipt?: Receipt; error?: string }> {
  const parsed = z
    .object({
      party: z.uuid(),
      request_key: z.uuid(),
      values: receiptValuesSchema,
    })
    .safeParse(input);
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Review the receipt details.",
    };
  if (!(await allowed("create")))
    return { error: "You do not have permission to create payment receipts." };
  try {
    const { party, request_key, values } = parsed.data;
    const receipt = await serverFetch<Receipt>(
      `/ledger/sales-receipts/parties/${party}/`,
      { method: "POST", body: JSON.stringify({ ...values, request_key }) },
    );
    for (const path of [
      "/dashboard/ledger/ledgers/sales",
      "/dashboard/ledger/cashbook/entry",
      "/dashboard/ledger/cashbook/journal",
    ])
      revalidatePath(path);
    return { receipt };
  } catch (error) {
    return { error: message(error) };
  }
}
export async function receiptInvoiceChoices(
  input: unknown,
): Promise<{ data?: InvoicePage; error?: string }> {
  const parsed = z
    .object({
      party: z.uuid(),
      search: z.string().max(100),
      page: z.number().int().positive(),
    })
    .safeParse(input);
  if (!parsed.success || !(await allowed("create")))
    return { error: "You cannot load invoice choices." };
  const user = await getCurrentUser();
  if (!hasPermission(user!, "ledger.salesinvoice.view"))
    return { error: "You do not have permission to view invoices." };
  try {
    const { party, search, page } = parsed.data;
    return {
      data: await serverFetch<InvoicePage>(
        `/ledger/sales-invoices/parties/${party}/?${new URLSearchParams({ search, page: String(page) })}`,
      ),
    };
  } catch (error) {
    return { error: message(error) };
  }
}
export async function receiptInvoiceDraft(
  input: unknown,
): Promise<{ invoice?: Invoice; error?: string }> {
  const parsed = z.object({ id: z.uuid(), party: z.uuid() }).safeParse(input);
  if (!parsed.success || !(await allowed("create")))
    return { error: "You cannot copy this invoice." };
  const user = await getCurrentUser();
  if (!hasPermission(user!, "ledger.salesinvoice.view"))
    return { error: "You do not have permission to view invoices." };
  try {
    const invoice = await serverFetch<Invoice>(
      `/ledger/sales-invoices/${parsed.data.id}/`,
    );
    return invoice.party === parsed.data.party
      ? { invoice }
      : { error: "Invoice belongs to another client." };
  } catch (error) {
    return { error: message(error) };
  }
}
export async function emailReceipt(
  input: unknown,
): Promise<{ status?: string; error?: string }> {
  const parsed = z
    .object({
      id: z.uuid(),
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
    return { error: "You do not have permission to email receipts." };
  try {
    const { id, ...body } = parsed.data;
    const result = await serverFetch<{ status: string }>(
      `/ledger/sales-receipts/${id}/email/`,
      { method: "POST", body: JSON.stringify(body) },
    );
    revalidatePath(`/dashboard/ledger/sales/receipts/${id}`);
    return { status: result.status };
  } catch (error) {
    return { error: message(error) };
  }
}
