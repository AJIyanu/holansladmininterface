import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Role name is required.").max(150),
  permissions: z.array(z.number()),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
