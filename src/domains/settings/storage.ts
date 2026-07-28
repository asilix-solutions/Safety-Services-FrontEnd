import {
  CompanyProfileSettings,
  BrandingSettings,
  WorkspacePreferenceSettings,
  DomainNotificationSettings,
  SecuritySettings,
  DerivedOrganizationInfo
} from "./types";

const DEFAULT_PROFILE: CompanyProfileSettings = {
  companyName: "Vertex Industrial Safety Solutions",
  companyShortName: "Vertex Safety",
  commercialRegistration: "1010998822",
  taxNumber: "300099882200003",
  licenseNumber: "LIC-SAF-2026-0099",
  civilDefenseRegistration: "CD-REG-88221",
  industry: "Fire Protection & Mechanical Engineering",
  address: "Olaya Street, Block 4",
  city: "Riyadh",
  country: "SA",
  phone: "+966 11 4455667",
  email: "info@vertexindustrial.com",
  supportEmail: "support@vertexindustrial.com",
  supportPhone: "+966 11 4455668",
  website: "https://vertexindustrial.com",
  description: "SSLM enterprise safety execution node."
};

const DEFAULT_BRANDING: BrandingSettings = {
  logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=VertexLogo",
  logoDarkUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=VertexLogoDark",
  primaryColor: "#4f46e5",
  secondaryColor: "#0f172a",
  accentColor: "#f59e0b"
};

const DEFAULT_PREFERENCES: WorkspacePreferenceSettings = {
  language: "ar",
  theme: "dark",
  timezone: "Asia/Riyadh",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "24h",
  defaultPageSize: 10,
  compactMode: false
};

const DEFAULT_NOTIFICATIONS: DomainNotificationSettings = {
  requests: { email: true, inApp: true },
  projects: { email: true, inApp: true },
  siteVisits: { email: true, inApp: true },
  reports: { email: true, inApp: true },
  certificates: { email: true, inApp: true },
  invoices: { email: false, inApp: true }
};

const DEFAULT_SECURITY: SecuritySettings = {
  sessionTimeoutMinutes: 30,
  rememberLogin: true,
  enableTwoFactorMock: false
};

// Company Profile Storage
export function getCompanyProfile(): CompanyProfileSettings {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem("SSLM_COMPANY_PROFILE");
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveCompanyProfile(profile: CompanyProfileSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_COMPANY_PROFILE", JSON.stringify(profile));
}

// Branding Storage
export function getBranding(): BrandingSettings {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem("SSLM_BRANDING");
    return raw ? JSON.parse(raw) : DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveBranding(branding: BrandingSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_BRANDING", JSON.stringify(branding));
}

// Preferences Storage
export function getWorkspacePreferences(): WorkspacePreferenceSettings {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem("SSLM_WORKSPACE_PREFERENCES");
    return raw ? JSON.parse(raw) : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveWorkspacePreferences(prefs: WorkspacePreferenceSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_WORKSPACE_PREFERENCES", JSON.stringify(prefs));
}

// Notifications Storage
export function getNotificationSettings(): DomainNotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem("SSLM_NOTIFICATION_SETTINGS");
    return raw ? JSON.parse(raw) : DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveNotificationSettings(settings: DomainNotificationSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_NOTIFICATION_SETTINGS", JSON.stringify(settings));
}

// Security Storage
export function getSecuritySettings(): SecuritySettings {
  if (typeof window === "undefined") return DEFAULT_SECURITY;
  try {
    const raw = localStorage.getItem("SSLM_SECURITY_SETTINGS");
    return raw ? JSON.parse(raw) : DEFAULT_SECURITY;
  } catch {
    return DEFAULT_SECURITY;
  }
}

export function saveSecuritySettings(settings: SecuritySettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_SECURITY_SETTINGS", JSON.stringify(settings));
}

// Organization Info
export function getOrganizationInformation(user: { name: string; role: string; companyId?: string } | null): DerivedOrganizationInfo {
  return {
    workspaceId: "WS-VERTEX-RHY-00912",
    tenantId: user?.companyId || "TNT-VERTEX-101",
    subscriptionPlan: "SSLM SaaS Business Plan",
    workspaceCreatedAt: "2026-01-01T12:00:00Z",
    // role infrastructure, not a permission check — mock display-name selection, not access control
    activeCompanyAdmin: user?.role === "Company Admin" ? user.name : "Sarah Jenkins"
  };
}

// Reset operations
export function resetCompanyProfile(): CompanyProfileSettings {
  saveCompanyProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

export function resetBranding(): BrandingSettings {
  saveBranding(DEFAULT_BRANDING);
  return DEFAULT_BRANDING;
}

export function resetWorkspacePreferences(): WorkspacePreferenceSettings {
  saveWorkspacePreferences(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

export function resetNotificationSettings(): DomainNotificationSettings {
  saveNotificationSettings(DEFAULT_NOTIFICATIONS);
  return DEFAULT_NOTIFICATIONS;
}

export function resetSecuritySettings(): SecuritySettings {
  saveSecuritySettings(DEFAULT_SECURITY);
  return DEFAULT_SECURITY;
}
