import * as z from "zod";

export const closureSchema = z.object({
  signatureImage: z.string().min(1, { message: "closure:form.signatureRequired" }),
  method: z.enum(["canvas", "upload"], {
    message: "validation:required",
  }),
  signedBy: z
    .string()
    .trim()
    .min(2, { message: "validation:tooShort" })
    .optional()
    .or(z.literal("")),
});

export type ClosureFormValues = z.infer<typeof closureSchema>;
