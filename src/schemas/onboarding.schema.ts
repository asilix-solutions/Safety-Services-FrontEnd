import * as z from "zod";
import { OTP_6_DIGIT_REGEX, PASSWORD_COMPLEXITY_REGEX } from "./auth.schema";
import { SAUDI_PHONE_REGEX } from "./profile.schema";

export const SAUDI_CR_REGEX = /^[0-9]{10}$/;
export const SAUDI_700_UNIFIED_REGEX = /^7[0-9]{9}$/;
export const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export const onboardingStep1Schema = z.object({
  companyName: z.string().min(3, { message: "validation:companyNameMin3" }),
  commercialRegistration: z
    .string()
    .regex(SAUDI_CR_REGEX, { message: "validation:invalidSaudiCR" }),
  unifiedNumber700: z
    .string()
    .regex(SAUDI_700_UNIFIED_REGEX, { message: "validation:invalid700Number" }),
  civilDefenseLicense: z.string().min(3, { message: "validation:cdLicenseRequired" }),
  subdomain: z
    .string()
    .min(3, { message: "validation:subdomainMin3" })
    .max(30, { message: "validation:subdomainMax30" })
    .regex(SUBDOMAIN_REGEX, { message: "validation:invalidSubdomainFormat" }),
});

export const onboardingStep2Schema = z.object({
  presetId: z.string().min(1),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export const onboardingStep3Schema = z
  .object({
    adminFullName: z.string().min(3, { message: "validation:adminNameMin3" }),
    adminEmail: z.string().email({ message: "validation:invalidEmail" }),
    adminPhone: z.string().regex(SAUDI_PHONE_REGEX, { message: "validation:invalidSaudiPhone" }),
    adminPassword: z
      .string()
      .min(8, { message: "validation:passwordMinLength8" })
      .regex(PASSWORD_COMPLEXITY_REGEX, { message: "validation:passwordComplexityRequirements" }),
    confirmAdminPassword: z.string().min(1, { message: "validation:confirmPasswordRequired" }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "validation:mustAgreeToTerms",
    }),
  })
  .refine((data) => data.adminPassword === data.confirmAdminPassword, {
    message: "validation:passwordsDoNotMatch",
    path: ["confirmAdminPassword"],
  });

export const onboardingStep4Schema = z.object({
  otp: z.string().regex(OTP_6_DIGIT_REGEX, { message: "validation:otpMustBe6Digits" }),
});

export type OnboardingStep1Values = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Values = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Values = z.infer<typeof onboardingStep3Schema>;
export type OnboardingStep4Values = z.infer<typeof onboardingStep4Schema>;
