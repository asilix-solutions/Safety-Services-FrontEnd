import * as z from "zod";

export const OTP_6_DIGIT_REGEX = /^[0-9]{6}$/;
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "validation:emailRequired" })
    .email({ message: "validation:invalidEmail" }),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email({ message: "validation:invalidEmail" }),
    otp: z
      .string()
      .regex(OTP_6_DIGIT_REGEX, { message: "validation:otpMustBe6Digits" }),
    newPassword: z
      .string()
      .min(8, { message: "validation:passwordMinLength8" })
      .regex(PASSWORD_COMPLEXITY_REGEX, { message: "validation:passwordComplexityRequirements" }),
    confirmPassword: z.string().min(1, { message: "validation:confirmPasswordRequired" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "validation:passwordsDoNotMatch",
    path: ["confirmPassword"],
  });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
