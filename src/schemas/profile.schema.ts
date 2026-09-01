import * as z from "zod";
import { PASSWORD_COMPLEXITY_REGEX } from "./auth.schema";

export const SAUDI_PHONE_REGEX = /^(?:\+966|00966|0)?5[0-9]{8}$/;

export const profileSchema = z.object({
  name: z.string().min(3, { message: "validation:nameMin3Chars" }),
  email: z.string().email({ message: "validation:invalidEmail" }),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || SAUDI_PHONE_REGEX.test(val), {
      message: "validation:invalidSaudiPhone",
    }),
  title: z.string().optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "validation:currentPasswordRequired" }),
    newPassword: z
      .string()
      .min(8, { message: "validation:passwordMinLength8" })
      .regex(PASSWORD_COMPLEXITY_REGEX, { message: "validation:passwordComplexityRequirements" }),
    confirmPassword: z.string().min(1, { message: "validation:confirmPasswordRequired" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "validation:passwordsDoNotMatch",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "validation:newPasswordMustDiffer",
    path: ["newPassword"],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

