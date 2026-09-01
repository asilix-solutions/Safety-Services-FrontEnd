export interface CompanyProfileSettings {
  companyName: string;
  companyShortName: string;
  commercialRegistration: string;
  taxNumber: string;
  licenseNumber: string;
  civilDefenseRegistration: string;
  industry: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  supportEmail?: string;
  supportPhone?: string;
  website?: string;
  description?: string;
}

export interface BrandingSettings {
  logoUrl?: string;
  logoDarkUrl?: string;
  primaryColor: string;
  primaryForeground?: string;
  secondaryColor: string;
  accentColor: string;
  presetId?: string;
  isCustom?: boolean;
  darkModeOverrides?: {
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    accent?: string;
  };
}

export interface TenantBrandingConfig extends BrandingSettings {
  tenantId?: string;
  updatedAt?: string;
  version?: number;
}

export interface WorkspacePreferenceSettings {
  language: "ar" | "en";
  theme: "light" | "dark" | "system";
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  defaultPageSize: 10 | 25 | 50;
  compactMode: boolean;
}

export type NotificationChannel = "email" | "inApp";

export interface ChannelPreference {
  email: boolean;
  inApp: boolean;
}

export interface DomainNotificationSettings {
  requests: ChannelPreference;
  projects: ChannelPreference;
  siteVisits: ChannelPreference;
  reports: ChannelPreference;
  certificates: ChannelPreference;
  invoices: ChannelPreference;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  rememberLogin: boolean;
  enableTwoFactorMock: boolean;
}

export interface DerivedOrganizationInfo {
  workspaceId: string;
  tenantId: string;
  subscriptionPlan: string;
  workspaceCreatedAt: string;
  activeCompanyAdmin: string;
}

// ============================================================================
// EXTENDED ENTERPRISE SETTINGS DTOs
// ============================================================================

// 1. General Settings
export interface GeneralSettingsDTO {
  workspaceName: string;
  workspaceShortName: string;
  defaultLanguage: "ar" | "en";
  fallbackLanguage: "ar" | "en";
  timezone: string;
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD" | "MM/DD/YYYY";
  timeFormat: "12h" | "24h";
  defaultPageSize: 10 | 25 | 50 | 100;
  allowPublicRegistration: boolean;
}

// 2. SEO & Metadata Settings
export interface SeoMetadataSettingsDTO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImageUrl?: string;
  twitterCardType: "summary" | "summary_large_image";
  enableSearchIndexing: boolean;
  customRobotsTxt?: string;
  canonicalUrlPattern?: string;
}

// 3. Communication & Gateway Settings
export interface CommunicationSettingsDTO {
  smsProvider: "none" | "unifonic" | "taqnyat" | "custom_gateway";
  smsApiKey?: string;
  smsSenderId?: string;
  emailProvider: "smtp" | "sendgrid" | "aws_ses";
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPasswordMasked?: string;
  fromEmail: string;
  fromName: string;
  channelRules: {
    requestStatusChanged: { sms: boolean; email: boolean; inApp: boolean };
    quotationGenerated: { sms: boolean; email: boolean; inApp: boolean };
    siteVisitScheduled: { sms: boolean; email: boolean; inApp: boolean };
    certificateIssued: { sms: boolean; email: boolean; inApp: boolean };
    invoiceOverdue: { sms: boolean; email: boolean; inApp: boolean };
  };
}

// 4. Company Policies & ZATCA Configuration
export interface CompanyPoliciesDTO {
  zatcaTaxRate: number; // 0.15 (15%)
  zatcaVatNumber: string; // 15 digits starting/ending with 3
  zatcaPhase2Enabled: boolean;
  spendingCeilings: {
    salesAgentMaxDiscountPercent: number; // e.g., 10%
    engineerMaxVariationApproval: number; // in SAR, e.g., 5000
    companyAdminSpendingCeiling: number; // in SAR, e.g., 500000
  };
  approvalHierarchy: {
    requireDualApprovalAboveSar: number; // e.g., 100000
    requireSuperAdminForContractTermination: boolean;
    autoAssignInspectionOnQuotationApproval: boolean;
  };
}

// 5. Core System Configuration
export interface SystemConfigDTO {
  sessionTimeoutMinutes: number; // e.g., 15, 30, 60
  maxConcurrentSessionsPerUser: number;
  enforce2FAForRoles: ("Super Admin" | "Company Admin" | "Consulting Engineer")[];
  ipWhitelist: string[];
  storageQuotaMb: number;
  usedStorageMb: number;
  maxFileUploadSizeMb: number; // e.g., 25 MB
  allowedDocumentExtensions: string[]; // [".pdf", ".dwg", ".jpg", ".png"]
}

