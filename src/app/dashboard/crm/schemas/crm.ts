import { z } from "zod";

export const partySchema = z.object({
  name: z.string().min(1, "Name is required"),
  party_type: z.enum(["client", "supplier"], {
    message: "Party type is required",
  }),
  is_organization: z.boolean(),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),

  // link to existing party
  party_id: z.uuid().optional(),

  // or create a new party inline
  new_party: partySchema.optional(),
});

// When updating we usually allow partial fields
export const updatePartySchema = partySchema.partial();
export const updateContactSchema = contactSchema.partial();

export type PartyFormValues = z.infer<typeof partySchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
