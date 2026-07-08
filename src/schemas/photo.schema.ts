import * as z from "zod";

export const photoSchema = z.object({
  siloTag: z.enum(["alarm", "suppression", "ventilation"], {
    message: "validation:required",
  }),
  caption: z
    .string()
    .trim()
    .max(140, { message: "validation:tooLong" })
    .optional()
    .or(z.literal("")),
  image: z.string().min(1, { message: "photos:form.imageRequired" }),
});

export type PhotoFormValues = z.infer<typeof photoSchema>;
