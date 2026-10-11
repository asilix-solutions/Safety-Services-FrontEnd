import { http } from "@/services/http";

export interface TenantSettingsDto {
  publicEmail?: string | null;
  publicPhone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  themeColors?: Record<string, string>;
  socialLinks?: Record<string, string>;
  welcomeMessage?: string | null;
  aboutUsText?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string | null;
  twitterCard?: string | null;
  twitterSite?: string | null;
  canonicalUrl?: string | null;
}

export interface TenantQuotaItem {
  quota: number; // 1: Staff, 2: Requests, 3: Storage
  used: number;
  limit: number | null;
  isUnlimited: boolean;
  remaining: number | null;
  percentUsed: number | null;
}

export interface TenantSubscriptionDto {
  planId?: string | null;
  planCode?: string | null;
  planNameAr?: string | null;
  planNameEn?: string | null;
  isTrial: boolean;
  isUngoverned: boolean;
  status: number; // 1: Active, 2: GracePeriod, 3: ReadOnly, 4: Suspended
  startedAtUtc?: string | null;
  expiresAtUtc?: string | null;
  graceDays: number;
  writeLockAtUtc?: string | null;
  daysUntilWriteLock?: number | null;
  writesPermitted: boolean;
  quotas: TenantQuotaItem[];
}

export interface TenantFinancialPolicyDto {
  tenantId: string;
  vatPercentage: number;
  targetMinimumMarginPercentage: number;
  salesCommissionPercentage: number;
  defaultSpendingCeilingCap: number;
  currencyCode: string;
}

export interface UpdateTenantBrandingPayload {
  tenantId: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeColors: Record<string, string>;
  socialLinks: Record<string, string>;
  welcomeMessage?: string;
}

export interface UpdateTenantContactPayload {
  tenantId: string;
  publicEmail: string;
  publicPhone: string;
  address: string;
  aboutUsText?: string;
}

export interface UpdateTenantCompanyProfilePayload {
  tenantId: string;
  companyNameAr: string;
  companyNameEn: string;
  commercialRegistrationNumber: string;
  nationalUnifiedNumber700: string;
  vatRegistrationNumber?: string;
}

export interface UpdateTenantSeoOgPayload {
  tenantId: string;
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

export const settingsApi = {
  /**
   * PRIVATE: Get full settings for the authenticated tenant.
   * GET /api/v1/tenants/settings
   */
  async getSettings() {
    return http.get<TenantSettingsDto>("/tenants/settings");
  },

  /**
   * PUBLIC: Get public branding by subdomain.
   * GET /api/v1/tenants/settings/public-branding
   */
  async getPublicBranding(subdomain?: string) {
    return http.get<TenantSettingsDto>("/tenants/settings/public-branding", {
      headers: subdomain ? { "X-Tenant-Domain": subdomain } : undefined,
    });
  },

  /**
   * PRIVATE: Updates visual branding, theme colors, social links, and welcome message.
   * PUT /api/v1/tenants/settings/branding
   */
  async updateBranding(payload: UpdateTenantBrandingPayload) {
    return http.put<TenantSettingsDto>("/tenants/settings/branding", payload);
  },

  /**
   * PRIVATE: Updates public contact details and about us text.
   * PUT /api/v1/tenants/settings/contact
   */
  async updateContact(payload: UpdateTenantContactPayload) {
    return http.put<TenantSettingsDto>("/tenants/settings/contact", payload);
  },

  /**
   * PRIVATE: Updates company profile (CR, National 700, VAT number).
   * PUT /api/v1/tenants/settings/company-profile
   */
  async updateCompanyProfile(payload: UpdateTenantCompanyProfilePayload) {
    return http.put<TenantSettingsDto>("/tenants/settings/company-profile", payload);
  },

  /**
   * PRIVATE: Updates SEO and OpenGraph metadata.
   * PUT /api/v1/tenants/settings/seo-og
   */
  async updateSeoOg(payload: UpdateTenantSeoOgPayload) {
    return http.put<TenantSettingsDto>("/tenants/settings/seo-og", payload);
  },

  /**
   * PRIVATE: Retrieves active subscription standing and quota limits.
   * GET /api/v1/tenants/subscription
   */
  async getSubscription() {
    return http.get<TenantSubscriptionDto>("/tenants/subscription");
  },

  /**
   * PRIVATE: Retrieves tenant financial policy.
   * GET /api/v1/tenants/settings/financial-policy
   */
  async getFinancialPolicy() {
    return http.get<TenantFinancialPolicyDto>("/tenants/settings/financial-policy");
  },

  /**
   * PRIVATE: Updates tenant financial policy.
   * PUT /api/v1/tenants/settings/financial-policy
   */
  async updateFinancialPolicy(payload: TenantFinancialPolicyDto) {
    return http.put<TenantFinancialPolicyDto>("/tenants/settings/financial-policy", payload);
  },
};
