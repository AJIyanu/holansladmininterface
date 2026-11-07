"use server";

import { z } from "zod";
import { postingSchema } from "./schema";
import type { OutstandingPage } from "./types";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import {
  ledgerPermission,
  type LedgerKind,
  type LedgerSelection,
  type PartyResults,
} from "./types";

async function permitted(kind: LedgerKind) {
  const user = await getCurrentUser();
  return (
    !!user &&
    (user.is_staff || user.is_superuser) &&
    hasPermission(user, ledgerPermission(kind))
  );
}
function failure(error: unknown) {
  if (error instanceof ServerFetchError && [401, 403].includes(error.status))
    return "Your session or permission has changed. Refresh the page.";
  if (error instanceof ServerFetchError && error.status === 404)
    return "This party is no longer available in this ledger. Search again.";
  return "Unable to connect to the ledger. Please try again.";
}
export async function searchLedgerParties(
  input: unknown,
): Promise<{ data?: PartyResults; error?: string }> {
  const parsed = z
    .object({
      kind: z.enum(["sales", "purchase"]),
      search: z.string().trim().max(100),
      page: z.number().int().min(1).max(100000),
    })
    .safeParse(input);
  if (!parsed.success) return { error: "Check your search." };
  const { kind, search, page } = parsed.data;
  if (!(await permitted(kind)))
    return { error: "You do not have permission to view this ledger." };
  try {
    const query = new URLSearchParams({
      search,
      page: String(page),
      page_size: "10",
    });
    return {
      data: await serverFetch<PartyResults>(
        `/ledger/party-ledgers/${kind}/parties/?${query}`,
      ),
    };
  } catch (error) {
    return { error: failure(error) };
  }
}
export async function selectLedgerParty(
  input: unknown,
): Promise<{ data?: LedgerSelection; error?: string }> {
  const parsed = z
    .object({
      kind: z.enum(["sales", "purchase"]),
      party_id: z.uuid().nullable(),
    })
    .safeParse(input);
  if (!parsed.success) return { error: "Choose a valid party." };
  const { kind, party_id } = parsed.data;
  if (!(await permitted(kind)))
    return { error: "You do not have permission to view this ledger." };
  try {
    const data = await serverFetch<LedgerSelection>(
      `/ledger/party-ledgers/${kind}/`,
      { method: "PUT", body: JSON.stringify({ party_id }) },
    );
    revalidatePath(`/dashboard/ledger/ledgers/${kind}`);
    return { data };
  } catch (error) {
    return { error: failure(error) };
  }
}

export async function getOutstandingDocuments(
  input: unknown,
): Promise<{ data?: OutstandingPage; error?: string }> {
  const parsed = z
    .object({
      kind: z.enum(["sales", "purchase"]),
      currency: z.enum(["NGN", "USD", "GBP"]).default("NGN"),
      party_id: z.uuid(),
      search: z.string().trim().max(100),
      page: z.number().int().min(1).max(100000),
    })
    .safeParse(input);
  if (!parsed.success) return { error: "Check the document search." };
  const { kind, party_id, search, page, currency } = parsed.data;
  if (!(await permitted(kind)))
    return { error: "You do not have permission to view this ledger." };
  try {
    const query = new URLSearchParams({
      currency,
      search,
      page: String(page),
      page_size: "10",
    });
    return {
      data: await serverFetch<OutstandingPage>(
        `/ledger/party-ledgers/${kind}/parties/${party_id}/outstanding/?${query}`,
      ),
    };
  } catch (error) {
    return { error: failure(error) };
  }
}

export async function postLedgerEntry(
  input: unknown,
): Promise<{ success: boolean; message: string }> {
  const parsed = postingSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Review the transaction details.",
    };
  const { kind, party_id, ...payload } = parsed.data;
  const user = await getCurrentUser();
  if (
    !user ||
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, ledgerPermission(kind)) ||
    !hasPermission(user, `ledger.${kind}transaction.create`) ||
    (payload.transaction_type === "PAYMENT" &&
      !hasPermission(user, "ledger.cashbookentry.create"))
  ) {
    return {
      success: false,
      message: "You do not have permission to post this transaction.",
    };
  }
  try {
    await serverFetch(
      `/ledger/party-ledgers/${kind}/parties/${party_id}/transactions/`,
      { method: "POST", body: JSON.stringify(payload) },
    );
    revalidatePath(`/dashboard/ledger/ledgers/${kind}`);
    revalidatePath("/dashboard/ledger/cashbook/entry");
    revalidatePath("/dashboard/ledger/cashbook/journal");
    return { success: true, message: "Transaction posted successfully." };
  } catch (error) {
    if (
      error instanceof ServerFetchError &&
      error.status === 400 &&
      typeof error.responseBody === "object" &&
      error.responseBody !== null
    ) {
      const messages = Object.values(error.responseBody)
        .flat()
        .filter((value): value is string => typeof value === "string");
      return {
        success: false,
        message:
          messages.join(" ") ||
          "Review the transaction details and allocations.",
      };
    }
    return { success: false, message: failure(error) };
  }
}
