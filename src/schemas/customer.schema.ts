import * as z from "zod";

export const customerSchema = z.object({
  companyName: z.string().min(2, { message: "validation:tooShort" }),
  contactName: z.string().min(2, { message: "validation:tooShort" }),
  contactEmail: z.string().email({ message: "validation:invalidEmail" }),
  contactPhone: z.string().min(8, { message: "validation:required" }),
  status: z.enum(["Lead", "Active", "Inactive", "Prospect"], {
    message: "validation:required",
  }),
  industry: z.string().min(2, { message: "validation:required" }),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
