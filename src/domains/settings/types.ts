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
  secondaryColor: string;
  accentColor: string;
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
