import { z } from "zod";

export const requestItemSchema = z.object({
  name: z.string().trim().min(2, "Enter the item name.").max(255),
  description: z.string().trim().min(2, "Describe the item."),
  specification: z.string().trim(),
  brand: z.string().trim().max(255),
  quantity: z.number().positive("Quantity must be greater than zero."),
  unit: z.string().trim().min(1, "Choose or enter a unit."),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT", "CRITICAL"]),
  deadline: z.string(),
});

export const itemRequestSchema = z
  .object({
    client: z.string().uuid("Choose a client."),
    received_via: z.enum([
      "",
      "EMAIL",
      "WHATSAPP",
      "CALL",
      "WALK_IN",
      "CUSTOM",
    ]),
    received_via_custom: z.string().trim().max(100),
    notes: z.string().trim(),
    items: z.array(requestItemSchema).min(1, "Add at least one item."),
  })
  .refine(
    (value) =>
      value.received_via !== "CUSTOM" || value.received_via_custom.length > 0,
    {
      path: ["received_via_custom"],
      message: "Enter the custom request channel.",
    },
  );

export type ItemRequestValues = z.infer<typeof itemRequestSchema>;

export const itemEditSchema = requestItemSchema;
export type ItemEditValues = z.infer<typeof itemEditSchema>;
