"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { itemEditSchema, itemRequestSchema } from "./schema";
import type { ItemRequest } from "./types";

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
        items: parsed.data.items.map((item) => ({
          ...item,
          deadline: item.deadline || null,
          quantity: String(item.quantity),
        })),
      }),
    });
    revalidatePath("/dashboard/procurement/requesttracks/requests");
    revalidatePath("/dashboard/procurement/requesttracks/items");
    return { success: true, message: "Item request registered.", data };
  } catch (error) {
    return errorResult(error);
  }
}

export async function uploadItemImages(formData: FormData): Promise<Result> {
  const item = formData.get("item");
  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File);
  if (
    typeof item !== "string" ||
    !z.string().uuid().safeParse(item).success ||
    files.length < 1 ||
    files.length > 5
  )
    return { success: false, message: "Choose between one and five pictures." };
  if (files.some((file) => file.size > 5 * 1024 * 1024))
    return { success: false, message: "Each picture must be 5 MB or smaller." };
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "procurement.requesteditemimage.create"))
    return { success: false, message: "You cannot upload item images." };
  const upload = new FormData();
  for (const file of files) upload.append("files", file);
  const caption = formData.get("caption");
  if (typeof caption === "string") upload.set("caption", caption);
  try {
    await serverFetch(`/procurement/items/${item}/images/`, {
      method: "POST",
      body: upload,
    });
    revalidatePath("/dashboard/procurement/requesttracks/requests");
    revalidatePath(`/dashboard/procurement/requesttracks/items/${item}`);
    return {
      success: true,
      message: `${files.length} picture sample${files.length === 1 ? "" : "s"} added.`,
    };
  } catch (error) {
    return errorResult(error);
  }
}

export async function removeItemImages(input: unknown): Promise<Result> {
  const parsed = z
    .object({
      item: z.string().uuid(),
      images: z.array(z.string().uuid()).min(1).max(5),
    })
    .safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Choose pictures to remove." };
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "procurement.requesteditemimage.delete"))
    return { success: false, message: "You cannot remove item pictures." };
  try {
    await serverFetch(`/procurement/items/${parsed.data.item}/images/`, {
      method: "DELETE",
      body: JSON.stringify({ images: parsed.data.images }),
    });
    revalidatePath(
      `/dashboard/procurement/requesttracks/items/${parsed.data.item}`,
    );
    revalidatePath("/dashboard/procurement/requesttracks/items");
    revalidatePath("/dashboard/procurement/requesttracks/requests");
    return {
      success: true,
      message: `${parsed.data.images.length} picture sample${parsed.data.images.length === 1 ? "" : "s"} removed.`,
    };
  } catch (error) {
    return errorResult(error);
  }
}

export async function editRequestedItem(input: unknown): Promise<Result> {
  const parsed = z
    .object({ item: z.string().uuid(), values: itemEditSchema })
    .safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Review the item details." };
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "procurement.requesteditem.edit"))
    return { success: false, message: "You cannot edit requested items." };
  try {
    await serverFetch(`/procurement/items/${parsed.data.item}/edit/`, {
      method: "PATCH",
      body: JSON.stringify({
        ...parsed.data.values,
        deadline: parsed.data.values.deadline || null,
        quantity: String(parsed.data.values.quantity),
      }),
    });
    revalidatePath(
      `/dashboard/procurement/requesttracks/items/${parsed.data.item}`,
    );
    revalidatePath("/dashboard/procurement/requesttracks/items");
    revalidatePath("/dashboard/procurement/requesttracks/requests");
    return {
      success: true,
      message: "Item updated and recorded in its activity history.",
    };
  } catch (error) {
    return errorResult(error);
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
    revalidatePath(`/dashboard/procurement/requesttracks/items/${item}`);
    revalidatePath("/dashboard/procurement/requesttracks/items");
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
    revalidatePath(`/dashboard/procurement/requesttracks/items/${item}`);
    revalidatePath("/dashboard/procurement/requesttracks/items");
    return { success: true, message: "Item status updated." };
  } catch (error) {
    return errorResult(error);
  }
}
