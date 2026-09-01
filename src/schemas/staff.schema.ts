import * as z from "zod";
import { SAUDI_PHONE_REGEX } from "./profile.schema";

export const inviteStaffSchema = z.object({
  name: z.string().min(3, { message: "validation:nameMin3Chars" }),
  email: z.string().email({ message: "validation:invalidEmail" }),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || SAUDI_PHONE_REGEX.test(val), {
      message: "validation:invalidSaudiPhone",
    }),
  department: z.enum(["Engineering", "Operations", "Sales", "Management", "Administration"]),
  role: z.enum(["Company Admin", "Consulting Engineer", "Operations Officer", "Sales Agent"]),
  supervisorId: z.string().optional(),
});

export type InviteStaffFormValues = z.infer<typeof inviteStaffSchema>;
