import {
  CompanyProfileSettings,
  BrandingSettings,
  WorkspacePreferenceSettings,
  DomainNotificationSettings,
  SecuritySettings,
  DerivedOrganizationInfo
} from "./types";
import {
  getDefaultPresetForTenant,
  DEFAULT_THEME_PRESET_ID
} from "@/constants/themes";

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

export function getTenantBrandingKey(tenantId?: string): string {
  if (!tenantId) return "SSLM_BRANDING_SYSTEM";
  return `SSLM_BRANDING_${tenantId.toUpperCase()}`;
}

export function getDefaultBranding(tenantId?: string): BrandingSettings {
  const preset = getDefaultPresetForTenant(tenantId);
  return {
    logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${tenantId || "VertexLogo"}`,
    logoDarkUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${tenantId || "VertexLogoDark"}Dark`,
    primaryColor: preset.colors.primary,
    primaryForeground: preset.colors.primaryForeground || "#ffffff",
    secondaryColor: preset.colors.secondary,
    accentColor: preset.colors.accent,
    presetId: preset.id,
    isCustom: false,
    darkModeOverrides: preset.darkModeOverrides
  };
}

const DEFAULT_BRANDING: BrandingSettings = getDefaultBranding("COMP-001");

// Company Profile Storage
export function getCompanyProfile(): CompanyProfileSettings {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem("SSLM_COMPANY_PROFILE_V2");
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveCompanyProfile(profile: CompanyProfileSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_COMPANY_PROFILE_V2", JSON.stringify(profile));
}

// Branding Storage (Tenant-Scoped)
export function getBranding(tenantId?: string): BrandingSettings {
  const fallback = getDefaultBranding(tenantId);
  if (typeof window === "undefined") return fallback;
  try {
    const key = getTenantBrandingKey(tenantId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...fallback, ...parsed };
    }

    // Migration check from legacy single key SSLM_BRANDING_V2
    const legacyRaw = localStorage.getItem("SSLM_BRANDING_V2");
    if (legacyRaw && (!tenantId || tenantId === "COMP-001")) {
      try {
        const legacyParsed = JSON.parse(legacyRaw);
        const migrated: BrandingSettings = {
          ...fallback,
          ...legacyParsed,
          presetId: legacyParsed.presetId || DEFAULT_THEME_PRESET_ID,
          isCustom: legacyParsed.isCustom ?? true
        };
        localStorage.setItem(key, JSON.stringify(migrated));
        return migrated;
      } catch {
        return fallback;
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function saveBranding(branding: BrandingSettings, tenantId?: string): void {
  if (typeof window === "undefined") return;
  const key = getTenantBrandingKey(tenantId);
  localStorage.setItem(key, JSON.stringify(branding));
  // Keep legacy key updated as fallback
  localStorage.setItem("SSLM_BRANDING_V2", JSON.stringify(branding));
}

// Preferences Storage
export function getWorkspacePreferences(): WorkspacePreferenceSettings {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem("SSLM_WORKSPACE_PREFERENCES_V2");
    return raw ? JSON.parse(raw) : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveWorkspacePreferences(prefs: WorkspacePreferenceSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_WORKSPACE_PREFERENCES_V2", JSON.stringify(prefs));
}

// Notifications Storage
export function getNotificationSettings(): DomainNotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem("SSLM_NOTIFICATION_SETTINGS_V2");
    return raw ? JSON.parse(raw) : DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveNotificationSettings(settings: DomainNotificationSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_NOTIFICATION_SETTINGS_V2", JSON.stringify(settings));
}

// Security Storage
export function getSecuritySettings(): SecuritySettings {
  if (typeof window === "undefined") return DEFAULT_SECURITY;
  try {
    const raw = localStorage.getItem("SSLM_SECURITY_SETTINGS_V2");
    return raw ? JSON.parse(raw) : DEFAULT_SECURITY;
  } catch {
    return DEFAULT_SECURITY;
  }
}

export function saveSecuritySettings(settings: SecuritySettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("SSLM_SECURITY_SETTINGS_V2", JSON.stringify(settings));
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

export function resetBranding(tenantId?: string): BrandingSettings {
  const defaultBranding = getDefaultBranding(tenantId);
  saveBranding(defaultBranding, tenantId);
  return defaultBranding;
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
