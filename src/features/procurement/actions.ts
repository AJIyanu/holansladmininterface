"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { itemRequestSchema } from "./schema";
import type { ItemRequest, Option } from "./types";

type Result<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

function errorResult<T = undefined>(error: unknown): Result<T> {
  if (error instanceof ServerFetchError) {
    if (error.status === 401 || error.status === 403)
      return {
        success: false,
        message: "Your session or permission has changed. Refresh the page.",
      };
    if (error.status === 400 && error.responseBody) {
      const values = Object.values(
        error.responseBody as Record<string, unknown>,
      )
        .flat()
        .filter((value): value is string => typeof value === "string");
      if (values.length) return { success: false, message: values.join(" ") };
    }
  }
  return { success: false, message: "Unable to save this change. Try again." };
}

export async function createItemRequest(
  input: unknown,
): Promise<Result<ItemRequest>> {
  const parsed = itemRequestSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Review the request details.",
    };
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "procurement.itemrequest.create"))
    return { success: false, message: "You cannot register item requests." };
  try {
    const data = await serverFetch<ItemRequest>("/procurement/item-requests/", {
      method: "POST",
      body: JSON.stringify({
        ...parsed.data,
        requester: parsed.data.requester || null,
        items: parsed.data.items.map((item) => ({
          ...item,
          deadline: item.deadline || null,
          quantity: String(item.quantity),
        })),
      }),
    });
    revalidatePath("/dashboard/procurement/requests");
    revalidatePath("/dashboard/procurement/items");
    return { success: true, message: "Item request registered.", data };
  } catch (error) {
    return errorResult(error);
  }
}

export async function uploadItemImage(formData: FormData): Promise<Result> {
  const item = formData.get("item");
  const file = formData.get("file");
  if (
    typeof item !== "string" ||
    !z.string().uuid().safeParse(item).success ||
    !(file instanceof File)
  )
    return { success: false, message: "Choose a valid item image." };
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "procurement.requesteditemimage.create"))
    return { success: false, message: "You cannot upload item images." };
  const upload = new FormData();
  upload.set("file", file);
  const caption = formData.get("caption");
  if (typeof caption === "string") upload.set("caption", caption);
  try {
    await serverFetch(`/procurement/items/${item}/images/`, {
      method: "POST",
      body: upload,
    });
    revalidatePath("/dashboard/procurement/requests");
    revalidatePath(`/dashboard/procurement/items/${item}`);
    return { success: true, message: "Image uploaded." };
  } catch (error) {
    return errorResult(error);
  }
}

export async function getRequesterOptions(client: string): Promise<Option[]> {
  if (!z.string().uuid().safeParse(client).success) return [];
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "procurement.itemrequest.view")) return [];
  try {
    return await serverFetch<Option[]>(
      `/procurement/item-requests/requester-options/?client=${encodeURIComponent(client)}`,
    );
  } catch {
    return [];
  }
}

export async function addTrackerActivity(input: unknown): Promise<Result> {
  const parsed = z
    .object({
      item: z.string().uuid(),
      category: z.enum(["ACTIVITY", "COMMENT"]),
      title_code: z.string().min(1),
      custom_title: z.string().trim().max(255).optional(),
      description: z.string().trim().optional(),
    })
    .safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Review the activity details." };
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "procurement.itemactivity.create"))
    return { success: false, message: "You cannot add tracker activities." };
  const { item, ...body } = parsed.data;
  try {
    await serverFetch(`/procurement/items/${item}/activities/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    revalidatePath(`/dashboard/procurement/items/${item}`);
    revalidatePath("/dashboard/procurement/items");
    return { success: true, message: "Activity added to the tracker." };
  } catch (error) {
    return errorResult(error);
  }
}

export async function changeTrackerStatus(input: unknown): Promise<Result> {
  const parsed = z
    .object({
      item: z.string().uuid(),
      status: z.enum(["OPEN", "SUSPENDED", "DELIVERED", "CLOSED"]),
      reason: z.string().trim().min(2),
    })
    .safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Choose a status and enter the reason." };
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "procurement.itemstatus.edit"))
    return { success: false, message: "You cannot change item status." };
  const { item, ...body } = parsed.data;
  try {
    await serverFetch(`/procurement/items/${item}/status/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    revalidatePath(`/dashboard/procurement/items/${item}`);
    revalidatePath("/dashboard/procurement/items");
    return { success: true, message: "Item status updated." };
  } catch (error) {
    return errorResult(error);
  }
}
