import * as z from "zod";

export const SAUDI_VAT_REGEX = /^3[0-9]{13}3$/; // 15 Digits starting and ending with 3

// 1. General Settings Schema
export const generalSettingsSchema = z.object({
  workspaceName: z.string().min(3, { message: "validation:nameMin3Chars" }),
  workspaceShortName: z.string().min(2).max(15),
  defaultLanguage: z.enum(["ar", "en"]),
  fallbackLanguage: z.enum(["ar", "en"]),
  timezone: z.string().min(1),
  dateFormat: z.enum(["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]),
  timeFormat: z.enum(["12h", "24h"]),
  defaultPageSize: z.number(),
  allowPublicRegistration: z.boolean(),
});

// 2. SEO Settings Schema
export const seoSettingsSchema = z.object({
  metaTitle: z.string().min(5).max(70),
  metaDescription: z.string().min(10).max(160),
  keywords: z.string(), // comma-separated in form
  ogTitle: z.string().min(5).max(70),
  ogDescription: z.string().min(10).max(160),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  twitterCardType: z.enum(["summary", "summary_large_image"]),
  enableSearchIndexing: z.boolean(),
  customRobotsTxt: z.string().optional(),
});

// 3. Communication Settings Schema
export const communicationSettingsSchema = z.object({
  smsProvider: z.enum(["none", "unifonic", "taqnyat", "custom_gateway"]),
  smsApiKey: z.string().optional(),
  smsSenderId: z.string().optional(),
  emailProvider: z.enum(["smtp", "sendgrid", "aws_ses"]),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUsername: z.string().optional(),
  fromEmail: z.string().email({ message: "validation:invalidEmail" }),
  fromName: z.string().min(2),
});

// 4. Policies Settings Schema
export const policiesSettingsSchema = z.object({
  zatcaTaxRate: z.number().min(0).max(1),
  zatcaVatNumber: z
    .string()
    .regex(SAUDI_VAT_REGEX, { message: "validation:invalidVat15Digits" }),
  zatcaPhase2Enabled: z.boolean(),
  spendingCeilings: z.object({
    salesAgentMaxDiscountPercent: z.number().min(0).max(100),
    engineerMaxVariationApproval: z.number().min(0),
    companyAdminSpendingCeiling: z.number().min(0),
  }),
  approvalHierarchy: z.object({
    requireDualApprovalAboveSar: z.number().min(0),
    requireSuperAdminForContractTermination: z.boolean(),
    autoAssignInspectionOnQuotationApproval: z.boolean(),
  }),
});

// 5. System Settings Schema
export const systemSettingsSchema = z.object({
  sessionTimeoutMinutes: z.number().min(5).max(480),
  maxConcurrentSessionsPerUser: z.number().min(1).max(10),
  enforce2FAForRoles: z.array(z.string()),
  ipWhitelist: z.string(), // newline-separated in form
  maxFileUploadSizeMb: z.number().min(1).max(100),
  allowedDocumentExtensions: z.string(), // comma-separated in form
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
export type SeoSettingsFormValues = z.infer<typeof seoSettingsSchema>;
export type CommunicationSettingsFormValues = z.infer<typeof communicationSettingsSchema>;
export type PoliciesSettingsFormValues = z.infer<typeof policiesSettingsSchema>;
export type SystemSettingsFormValues = z.infer<typeof systemSettingsSchema>;

