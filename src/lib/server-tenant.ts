import { headers } from "next/headers";
import { TenantBrandingDTO } from "@/types/tenant";
import { THEME_PRESETS } from "@/constants/themes";

const MOCK_TENANTS: Record<string, TenantBrandingDTO> = {
  vertex: {
    tenantId: "COMP-001",
    tenantName: "Vertex Industrial Safety Solutions",
    tenantSlug: "vertex",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=VertexLogo",
    logoDarkUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=VertexLogoDark",
    primaryColor: "#4F46E5",
    primaryForeground: "#ffffff",
    secondaryColor: "#1E1B4B",
    accentColor: "#F59E0B",
    presetId: "royal-indigo",
    darkModeOverrides: {
      primary: "#818CF8",
      primaryForeground: "#ffffff",
      secondary: "#0F172A",
      accent: "#FBBF24",
    },
    commercialRegistration: "1010998822",
    civilDefenseLicense: "CD-REG-88221",
    contactEmail: "info@vertexindustrial.com",
    supportPhone: "+966 11 4455667",
  },
  safetyshield: {
    tenantId: "COMP-002",
    tenantName: "Safety Shield Co.",
    tenantSlug: "safetyshield",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=SafetyShieldLogo",
    logoDarkUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=SafetyShieldDark",
    primaryColor: "#D97706",
    primaryForeground: "#ffffff",
    secondaryColor: "#1E293B",
    accentColor: "#EA580C",
    presetId: "safety-amber",
    darkModeOverrides: {
      primary: "#FBBF24",
      primaryForeground: "#ffffff",
      secondary: "#0F172A",
      accent: "#FB923C",
    },
    commercialRegistration: "1010887733",
    civilDefenseLicense: "CD-REG-77332",
    contactEmail: "contact@safetyshield.com",
    supportPhone: "+966 11 3344556",
  },
  gulffire: {
    tenantId: "COMP-003",
    tenantName: "Gulf Fire Engineering",
    tenantSlug: "gulffire",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=GulfFireLogo",
    logoDarkUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=GulfFireDark",
    primaryColor: "#059669",
    primaryForeground: "#ffffff",
    secondaryColor: "#064E3B",
    accentColor: "#0D9488",
    presetId: "emerald-compliance",
    darkModeOverrides: {
      primary: "#34D399",
      primaryForeground: "#ffffff",
      secondary: "#022C22",
      accent: "#2DD4BF",
    },
    commercialRegistration: "1010776644",
    civilDefenseLicense: "CD-REG-66443",
    contactEmail: "info@gulffire.com",
    supportPhone: "+966 12 5566778",
  },
  redsea: {
    tenantId: "COMP-004",
    tenantName: "Red Sea Compliance",
    tenantSlug: "redsea",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=RedSeaLogo",
    logoDarkUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=RedSeaDark",
    primaryColor: "#1D4ED8",
    primaryForeground: "#ffffff",
    secondaryColor: "#0F172A",
    accentColor: "#0284C7",
    presetId: "corporate-navy",
    darkModeOverrides: {
      primary: "#60A5FA",
      primaryForeground: "#ffffff",
      secondary: "#020617",
      accent: "#38BDF8",
    },
    commercialRegistration: "1010665511",
    civilDefenseLicense: "CD-REG-55110",
    contactEmail: "info@redseacompliance.com",
    supportPhone: "+966 13 8899001",
  },
};

/**
 * Server-side helper to resolve tenant branding from incoming request headers.
 */
export async function getServerTenantBranding(): Promise<TenantBrandingDTO | null> {
  try {
    const headersList = await headers();
    const subdomain = (headersList.get("x-tenant-domain") || "").toLowerCase().trim();

    if (!subdomain) {
      return null;
    }

    if (MOCK_TENANTS[subdomain]) {
      return MOCK_TENANTS[subdomain];
    }

    // Attempt lookup by tenant ID
    const byId = Object.values(MOCK_TENANTS).find(
      (t) => t.tenantId.toLowerCase() === subdomain || t.tenantSlug.toLowerCase() === subdomain
    );
    if (byId) {
      return byId;
    }

    // Default fallback preset for unknown subdomains
    const defaultPreset = THEME_PRESETS[0];
    return {
      tenantId: `TNT-${subdomain.toUpperCase()}`,
      tenantName: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Safety Co.`,
      tenantSlug: subdomain,
      logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${subdomain}`,
      primaryColor: defaultPreset.colors.primary,
      primaryForeground: defaultPreset.colors.primaryForeground || "#ffffff",
      secondaryColor: defaultPreset.colors.secondary,
      accentColor: defaultPreset.colors.accent,
      presetId: defaultPreset.id,
      darkModeOverrides: defaultPreset.darkModeOverrides,
    };
  } catch {
    return null;
  }
}
