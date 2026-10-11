/**
 * Centralized, resilient Auth & Multi-Tenant Storage manager.
 * Synchronizes authentication tokens and tenant domain between localStorage
 * and document.cookies to seamlessly support Next.js 15 SSR, server components,
 * and client-side Axios interceptors.
 */

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "sslm_access_token",
  REFRESH_TOKEN: "sslm_refresh_token",
  USER_PROFILE: "sslm_user_profile_v2",
  TENANT_DOMAIN: "sslm_tenant_domain",
} as const;

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || getCookie(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) return token;

  // Fallback check in stored profile
  const profileStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (profileStr) {
    try {
      const parsed = JSON.parse(profileStr);
      return parsed.token || parsed.accessToken || null;
    } catch {
      return null;
    }
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
    getCookie(STORAGE_KEYS.REFRESH_TOKEN) ||
    null
  );
}

export function setTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  setCookie(STORAGE_KEYS.ACCESS_TOKEN, accessToken, 7);

  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    setCookie(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, 30);
  }
}

export function setTenantDomain(domain: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TENANT_DOMAIN, domain);
  setCookie(STORAGE_KEYS.TENANT_DOMAIN, domain, 365);
}

export function getTenantDomain(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(STORAGE_KEYS.TENANT_DOMAIN) ||
    getCookie(STORAGE_KEYS.TENANT_DOMAIN) ||
    null
  );
}

export function setAuthSession<T>(params: {
  accessToken: string;
  refreshToken?: string;
  profile?: T;
  tenantDomain?: string;
}) {
  if (typeof window === "undefined") return;

  setTokens(params.accessToken, params.refreshToken);

  if (params.profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(params.profile));
  }

  if (params.tenantDomain) {
    setTenantDomain(params.tenantDomain);
  }
}

export function getStoredUserProfile<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  // Keep sslm_tenant_domain so public branding remains active for the tenant

  removeCookie(STORAGE_KEYS.ACCESS_TOKEN);
  removeCookie(STORAGE_KEYS.REFRESH_TOKEN);
}
