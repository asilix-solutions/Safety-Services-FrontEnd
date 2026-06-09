import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "validation:invalidEmail" }),
  password: z.string().min(6, { message: "validation:passwordLength" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
