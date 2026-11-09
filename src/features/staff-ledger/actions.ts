"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { editorSchema } from "./schema";
import type { Page, Staff, StaffEntry } from "./types";
async function allowed(action = "view", cash = false) {
  const user = await getCurrentUser();
  return (
    !!user &&
    (user.is_staff || user.is_superuser) &&
    hasPermission(user, "ledger.staffledger.view") &&
    hasPermission(user, `ledger.staffledger.${action}`) &&
    (!cash || hasPermission(user, "ledger.cashbookentry.create"))
  );
}
function failure(error: unknown) {
  if (error instanceof ServerFetchError) {
    if ([401, 403].includes(error.status))
      return "Your session or permissions changed. Refresh the page.";
    if (error.status === 400)
      return (
        Object.values(error.responseBody ?? {})
          .flat()
          .filter((v) => typeof v === "string")
          .join(" ") || "Review the form details."
      );
  }
  return "Unable to confirm the result. Retry with the same details.";
}
function refresh() {
  revalidatePath("/dashboard/ledger", "layout");
}
export async function searchStaff(
  input: unknown,
): Promise<{ data?: Page<Staff>; error?: string }> {
  const p = z
    .object({ search: z.string().max(100), page: z.number().int().positive() })
    .safeParse(input);
  if (!p.success || !(await allowed()))
    return { error: "You cannot view staff ledgers." };
  try {
    return {
      data: await serverFetch(
        `/ledger/staff-ledger/staff/?${new URLSearchParams({ search: p.data.search, page: String(p.data.page) })}`,
      ),
    };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function selectStaff(id: string) {
  if (!z.uuid().safeParse(id).success || !(await allowed()))
    return { error: "You cannot select this staff member." };
  try {
    await serverFetch("/ledger/staff-ledger/", {
      method: "PUT",
      body: JSON.stringify({ staff_id: id }),
    });
    refresh();
    return { success: true };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function sourceChoices(
  input: unknown,
): Promise<{ data?: Page<StaffEntry>; error?: string }> {
  const p = z
    .object({
      staff: z.uuid(),
      currency: z.enum(["NGN", "USD", "GBP"]),
      mode: z.enum(["advance", "loan", "reimbursement", "retire"]),
      search: z.string().max(100),
      page: z.number().int().positive(),
    })
    .safeParse(input);
  if (!p.success || !(await allowed()))
    return { error: "You cannot view advances or loans." };
  const { staff, ...query } = p.data;
  try {
    return {
      data: await serverFetch(
        `/ledger/staff-ledger/staff/${staff}/choices/?${new URLSearchParams({ ...query, page: String(query.page) })}`,
      ),
    };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function saveStaffRecord(
  data: FormData,
): Promise<{ id?: string; kind?: string; error?: string }> {
  let raw;
  try {
    raw = JSON.parse(String(data.get("payload")));
  } catch {
    return { error: "Invalid staff ledger details." };
  }
  const p = z
    .object({ staff: z.uuid(), request_key: z.uuid(), values: editorSchema })
    .safeParse(raw);
  if (!p.success)
    return { error: p.error.issues[0]?.message ?? "Review the form." };
  const { staff, request_key, values: v } = p.data;
  const retire = v.kind === "RETIRE";
  if (
    !(await allowed(
      retire ? "retire" : v.kind === "PAY" ? "pay" : "receive",
      !retire,
    ))
  )
    return { error: "You do not have permission for this action." };
  const body = new FormData();
  body.set(
    "payload",
    JSON.stringify(
      retire
        ? {
            request_key,
            advance_id: v.related_entry,
            date: v.date,
            description: v.description,
            items: v.items,
          }
        : {
            request_key,
            kind: v.kind,
            category: v.category,
            date: v.date,
            currency: v.currency,
            amount: v.amount,
            account_id: v.account_id,
            description: v.description,
            reference: v.reference,
            related_entry: v.related_entry || null,
          },
    ),
  );
  let total = 0;
  for (const [key, file] of data.entries()) {
    if (!(file instanceof File) || !file.size) continue;
    const valid = retire
      ? /^item_\d+$/.test(key) && Number(key.slice(5)) < v.items.length
      : key === "file";
    if (!valid)
      return { error: "Supporting document does not match a form item." };
    total += file.size;
    if (file.size > 10 * 1024 * 1024 || total > 20 * 1024 * 1024)
      return {
        error:
          "Each document must be at most 10 MB; combined maximum is 20 MB.",
      };
    body.set(key, file);
  }
  try {
    const result = await serverFetch<{ id: string }>(
      `/ledger/staff-ledger/staff/${staff}/${retire ? "retirements" : "entries"}/`,
      { method: "POST", body },
    );
    refresh();
    return { id: result.id, kind: retire ? "retirements" : "entries" };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function decideRetirement(
  input: unknown,
): Promise<{ success?: boolean; error?: string }> {
  const p = z
    .object({
      id: z.uuid(),
      request_key: z.uuid(),
      approved: z.boolean(),
      date: z.string().date(),
      reason: z.string().trim().min(1).max(1000),
      expected_remaining: z.string().regex(/^\d{1,16}(\.\d{1,2})?$/),
    })
    .safeParse(input);
  if (!p.success || !(await allowed("approve")))
    return { error: "Check your approval permissions, date and reason." };
  const { id, ...body } = p.data;
  try {
    await serverFetch(`/ledger/staff-ledger/retirements/${id}/decision/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    refresh();
    return { success: true };
  } catch (e) {
    return { error: failure(e) };
  }
}
export async function createStaffStatement(
  input: unknown,
): Promise<{ id?: string; error?: string }> {
  const p = z
    .object({
      staff: z.uuid(),
      request_key: z.uuid(),
      date_from: z.string().date(),
      date_to: z.string().date(),
      currency: z.enum(["NGN", "USD", "GBP"]),
    })
    .refine((v) => v.date_from <= v.date_to)
    .safeParse(input);
  if (!p.success || !(await allowed("print")))
    return { error: "Check the date range and your statement permission." };
  const { staff, ...body } = p.data;
  try {
    const result = await serverFetch<{ id: string }>(
      `/ledger/staff-ledger/staff/${staff}/statements/`,
      { method: "POST", body: JSON.stringify(body) },
    );
    refresh();
    return { id: result.id };
  } catch (e) {
    return { error: failure(e) };
  }
}
