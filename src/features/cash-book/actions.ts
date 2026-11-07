"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { cashFormSchema } from "./schema";

export async function mutateCashBook(
  input: unknown,
): Promise<{ success: boolean; message: string }> {
  const envelope = z
    .discriminatedUnion("operation", [
      z.object({
        operation: z.literal("create"),
        request_key: z.uuid(),
        values: cashFormSchema,
      }),
      z.object({
        operation: z.literal("edit"),
        id: z.uuid(),
        version: z.number().int().positive(),
        values: cashFormSchema.refine(
          (value) => value.reason.length > 0,
          "A correction reason is required.",
        ),
      }),
      z.object({
        operation: z.literal("delete"),
        id: z.uuid(),
        version: z.number().int().positive(),
        reason: z.string().trim().min(1).max(500),
      }),
    ])
    .safeParse(input);
  if (!envelope.success)
    return {
      success: false,
      message: envelope.error.issues[0]?.message ?? "Check the entry details.",
    };
  const data = envelope.data;
  const user = await getCurrentUser();
  if (
    !user ||
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, "ledger.cashbookentry.view") ||
    !hasPermission(user, `ledger.cashbookentry.${data.operation}`)
  ) {
    return {
      success: false,
      message: "You do not have permission to perform this action.",
    };
  }
  const path =
    data.operation === "create"
      ? "/ledger/cash-book/"
      : `/ledger/cash-book/${data.id}/`;
  const body =
    data.operation === "delete"
      ? { version: data.version, reason: data.reason }
      : data.operation === "edit"
        ? { ...data.values, version: data.version }
        : { ...data.values, request_key: data.request_key };
  try {
    await serverFetch(path, {
      method:
        data.operation === "create"
          ? "POST"
          : data.operation === "edit"
            ? "PATCH"
            : "DELETE",
      body: JSON.stringify(body),
    });
    revalidatePath("/dashboard/ledger/cashbook/entry");
    revalidatePath("/dashboard/ledger/cashbook/journal");
    return {
      success: true,
      message:
        data.operation === "delete"
          ? "Entry voided. Its reversal is recorded in the journal."
          : "Cash-book entry saved.",
    };
  } catch (error) {
    if (error instanceof ServerFetchError) {
      if (error.status === 403 || error.status === 401)
        return {
          success: false,
          message: "Your session or permission has changed. Refresh the page.",
        };
      if (
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
            messages.join(" ") || "Review the entry details and try again.",
        };
      }
      if (error.status === 404)
        return {
          success: false,
          message: "This entry is no longer available. Refresh the page.",
        };
    }
    return {
      success: false,
      message: "Unable to save this entry. Please try again.",
    };
  }
}
