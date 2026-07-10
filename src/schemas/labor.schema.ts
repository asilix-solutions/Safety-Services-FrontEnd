import * as z from "zod";

export const laborSchema = z
  .object({
    workerName: z.string().trim().min(2, { message: "validation:tooShort" }),
    fieldRole: z.string().trim().min(2, { message: "validation:tooShort" }),
    legalCategory: z.enum(["internal", "outsource"], {
      message: "validation:required",
    }),
    agreedWage: z.coerce.number({ message: "validation:required" }),
  })
  .superRefine((values, ctx) => {
    // Internal labor legitimately carries a zeroed wage (form disables the input); only
    // outsource labor requires a positive agreed wage — enforced here, not on the base field.
    if (values.legalCategory === "outsource" && values.agreedWage <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["agreedWage"],
        message: "labor:form.agreedWageRequired",
      });
    }
  });

export type LaborFormValues = z.infer<typeof laborSchema>;
