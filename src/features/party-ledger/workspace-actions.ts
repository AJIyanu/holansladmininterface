"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";

const envelope = z.object({
  kind: z.enum(["sales", "purchase"]),
  party: z.uuid(),
  mode: z.enum(["operations", "statements"]),
  payload: z.record(z.string(), z.unknown()),
});
async function send(
  path: string,
  payload: unknown,
  permissions: string[],
  method = "POST",
) {
  const user = await getCurrentUser();
  if (
    !user ||
    (!user.is_staff && !user.is_superuser) ||
    permissions.some((p) => !hasPermission(user, p))
  )
    return { error: "You do not have permission for this action." };
  try {
    const data = await serverFetch<{ id: string; message?: string }>(path, {
      method,
      body: JSON.stringify(payload),
    });
    revalidatePath("/dashboard/ledger", "layout");
    revalidatePath("/dashboard/procurement", "layout");
    return { data };
  } catch (error) {
    if (error instanceof ServerFetchError && error.status === 400)
      return {
        error:
          Object.values(error.responseBody ?? {})
            .flat()
            .filter((v) => typeof v === "string")
            .join(" ") || "Review the supplied details.",
      };
    return { error: "Unable to complete this action. Refresh and try again." };
  }
}
export async function workspaceAction(input: unknown) {
  const parsed = envelope.safeParse(input);
  if (!parsed.success) return { error: "Invalid ledger action." };
  const { kind, party, mode, payload } = parsed.data;
  const action = String(payload.action ?? "");
  const permissions = [`ledger.${kind}ledger.view`];
  if (mode === "statements")
    permissions.push(
      "ledger.reconciliation.create",
      "ledger.reconciliation.view",
    );
  else {
    permissions.push(
      ["ACCEPTED", "REJECTED", "DISPATCHED"].includes(action)
        ? "ledger.salesledger.recognize"
        : `ledger.${kind}ledger.correct`,
    );
    if (["REFUND", "REVERSE"].includes(action))
      permissions.push("ledger.cashbookentry.create");
  }
  return send(
    `/ledger/party-ledgers/${kind}/parties/${party}/${mode}/`,
    payload,
    permissions,
  );
}
export async function reviewStatement(id: string, payload: unknown) {
  if (!z.uuid().safeParse(id).success) return { error: "Invalid statement." };
  return send(`/ledger/statements/${id}/`, payload, [
    "ledger.reconciliation.view",
    "ledger.reconciliation.confirm",
  ]);
}
export async function procurementAction(payload: unknown) {
  return send("/ledger/procurement-inbox/", payload, [
    "ledger.procurement.approve",
  ]);
}
export async function saveLedgerAccount(payload: unknown, edit = false) {
  return send(
    "/ledger/accounts/",
    payload,
    [
      "ledger.ledgeraccount.view",
      `ledger.ledgeraccount.${edit ? "edit" : "create"}`,
    ],
    edit ? "PATCH" : "POST",
  );
}

export async function operationChoices(input: unknown) {
  const parsed = z
    .object({
      kind: z.enum(["sales", "purchase"]),
      party: z.uuid(),
      currency: z.enum(["NGN", "USD", "GBP"]),
      search: z.string().max(100),
      page: z.number().int().min(1),
    })
    .safeParse(input);
  if (!parsed.success) return { error: "Invalid search." };
  const { kind, party, currency, search, page } = parsed.data;
  const user = await getCurrentUser();
  if (
    !user ||
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, `ledger.${kind}ledger.view`)
  )
    return { error: "Permission denied." };
  try {
    return {
      data: await serverFetch<{
        results: Array<{
          id: string;
          date: string;
          transaction_type: string;
          reference: string;
          amount: string;
          currency: string;
        }>;
        next: string | null;
        previous: string | null;
      }>(
        `/ledger/party-ledgers/${kind}/parties/${party}/choices/?${new URLSearchParams({ currency, search, page: String(page), page_size: "30" })}`,
      ),
    };
  } catch {
    return { error: "Unable to load transactions." };
  }
}
