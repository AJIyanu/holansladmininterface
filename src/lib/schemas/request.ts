import { z } from "zod";

export const clientRequestSchema = z.object({
  client: z.string().min(1, "Client is required"),
  contact_person: z.string().optional(),
  item_name: z
    .string()
    .min(1, "Item name is required")
    .max(255, "Item name too long"),
  specification: z.string().optional(),
  model: z.string().max(100, "Model name too long").optional(),
  brand: z.string().max(100, "Brand name too long").optional(),
  uom: z.string().min(1, "Unit of measure is required").max(50, "UOM too long"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  status: z.enum(["pending", "processing", "discarded", "completed"]),
  comments: z.string().optional(),
});

export type ClientRequestFormData = z.infer<typeof clientRequestSchema>;
