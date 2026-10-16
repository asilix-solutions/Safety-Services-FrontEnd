import { ApiResponse } from "./api";

export interface TenantBrandingDTO {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
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
  commercialRegistration?: string;
  civilDefenseLicense?: string;
  contactEmail?: string;
  supportPhone?: string;
  address?: string;
  faviconUrl?: string;
  welcomeMessage?: string;
  aboutUsText?: string;
  socialLinks?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  canonicalUrl?: string;
}

export type TenantBrandingResponse = ApiResponse<TenantBrandingDTO>;
