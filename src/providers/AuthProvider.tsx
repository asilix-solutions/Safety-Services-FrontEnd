"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserRole } from "@/types/role";
import { UserProfile } from "@/types/user";
import { LoginCredentials } from "@/types/auth";
import { ROLE_PERMISSIONS } from "@/constants/permissions";
import { applyTenantTheme } from "@/lib/theme-utils";
import { getBranding } from "@/domains/settings";
import {
  authApi,
  mapBackendProfileToUser,
} from "@/domains/auth";
import {
  getAccessToken,
  setAuthSession,
  clearAuthSession,
  getStoredUserProfile,
  setTenantDomain,
} from "@/lib/auth-storage";
import { alertService } from "@/services/alert-service";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentialsOrRole: LoginCredentials | UserRole) => Promise<void>;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  /** `scopeId` is the client company for a Client, or the tenant for a Company Admin. */
  switchRole: (role: UserRole, scopeId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "sslm_user_profile_v2";

const MOCK_PROFILES: Record<UserRole, Omit<UserProfile, "permissions">> = {
  "Super Admin": {
    id: "u-1",
    name: "Alexander Vance",
    email: "admin@amanix.com",
    role: "Super Admin",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alexander",
    active: true,
  },
  "Company Admin": {
    id: "bdd5dd88-16b8-45eb-b8d2-a1fefb0ed72e",
    name: "مدير شركة السلامة لحماية الحرائق",
    email: "admin@al-salamah.com",
    role: "Company Admin",
    tenantId: "57bb2d62-6f4e-44ae-a0e3-7ed4073331dd",
    tenantName: "شركة السلامة لحماية الحرائق",
    subdomain: "al-salamah",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Al-Salamah-Admin",
    active: true,
  },
  "Consulting Engineer": {
    id: "u-3",
    name: "مهندس استشاري معتمد",
    email: "engineer@al-salamah.com",
    role: "Consulting Engineer",
    tenantId: "57bb2d62-6f4e-44ae-a0e3-7ed4073331dd",
    tenantName: "شركة السلامة لحماية الحرائق",
    subdomain: "al-salamah",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Engineer",
    active: true,
  },
  "Operations Officer": {
    id: "u-4",
    name: "مسؤول العمليات الميدانية",
    email: "operations@al-salamah.com",
    role: "Operations Officer",
    tenantId: "57bb2d62-6f4e-44ae-a0e3-7ed4073331dd",
    tenantName: "شركة السلامة لحماية الحرائق",
    subdomain: "al-salamah",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Operations",
    active: true,
  },
  "Sales Agent": {
    id: "u-5",
    name: "ممثل المبيعات",
    email: "sales@al-salamah.com",
    role: "Sales Agent",
    tenantId: "57bb2d62-6f4e-44ae-a0e3-7ed4073331dd",
    tenantName: "شركة السلامة لحماية الحرائق",
    subdomain: "al-salamah",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sales",
    active: true,
  },
  Client: {
    id: "u-6",
    name: "عميل - مالك المنشأة",
    email: "client@al-salamah.com",
    role: "Client",
    tenantId: "57bb2d62-6f4e-44ae-a0e3-7ed4073331dd",
    companyId: "c-102",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Client",
    active: true,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize and apply active tenant theme colors
  const syncTheme = useCallback((tenantIdOrSubdomain?: string) => {
    try {
      const branding = getBranding(tenantIdOrSubdomain);
      if (branding && branding.primaryColor) {
        applyTenantTheme({
          primaryHex: branding.primaryColor,
          primaryForegroundHex: branding.primaryForeground,
          secondaryHex: branding.secondaryColor,
          accentHex: branding.accentColor,
          darkModeOverrides: branding.darkModeOverrides,
          isDark: typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
        });
      }
    } catch (err) {
      console.error("Failed to sync tenant theme", err);
    }
  }, []);

  // Fetch full live profile from GET /api/v1/me
  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const res = await authApi.getMe();
      if (res.isSuccess && res.data) {
        const liveProfile = mapBackendProfileToUser(res.data);
        setUser(liveProfile);
        setAuthSession({
          accessToken: token,
          profile: liveProfile,
          tenantDomain: liveProfile.subdomain,
        });
        syncTheme(liveProfile.subdomain || liveProfile.tenantId);
        return liveProfile;
      }
    } catch {
      // 401 or network failure
    }
    return null;
  }, [syncTheme]);

  // Initial hydration from storage & background profile validation
  useEffect(() => {
    const stored = getStoredUserProfile<UserProfile>();
    if (stored) {
      setUser(stored);
      syncTheme(stored.subdomain || stored.tenantId);
    }

    const token = getAccessToken();
    if (token) {
      refreshProfile().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile, syncTheme]);

  // Observer for dark mode class toggles on <html>
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          syncTheme(user?.subdomain || user?.tenantId);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [user?.subdomain, user?.tenantId, syncTheme]);

  /**
   * Real credentials login against backend POST /api/v1/auth/login
   */
  const loginWithCredentials = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loginRes = await authApi.login(credentials);
      if (!loginRes.isSuccess || !loginRes.data) {
        alertService.showApiResponse(loginRes, {
          defaultError: "فشل تسجيل الدخول. يرجى التحقق من صحة البريد وكلمة المرور.",
        });
        return false;
      }

      const { token, refreshToken } = loginRes.data;

      // Temporary token storage to allow subsequent GET /api/v1/me request
      setAuthSession({
        accessToken: token,
        refreshToken,
      });

      // Retrieve full user profile
      const profileRes = await authApi.getMe();
      let liveProfile: UserProfile;

      if (profileRes.isSuccess && profileRes.data) {
        liveProfile = mapBackendProfileToUser(profileRes.data);
      } else {
        // Fallback profile if /me response is partial
        const defaultRole = credentials.email.includes("admin")
          ? "Company Admin"
          : credentials.email.includes("engineer")
          ? "Consulting Engineer"
          : "Client";

        liveProfile = {
          id: "authenticated-user",
          name: loginRes.data.userName || credentials.email,
          email: loginRes.data.email || credentials.email,
          role: defaultRole,
          active: true,
          permissions: ROLE_PERMISSIONS[defaultRole],
        };
      }

      setUser(liveProfile);
      setAuthSession({
        accessToken: token,
        refreshToken,
        profile: liveProfile,
        tenantDomain: liveProfile.subdomain,
      });

      if (liveProfile.subdomain) {
        setTenantDomain(liveProfile.subdomain);
      }

      syncTheme(liveProfile.subdomain || liveProfile.tenantId);
      alertService.success(loginRes.message || "تم تسجيل الدخول بنجاح");
      return true;
    } catch (err) {
      alertService.showApiError(err, {
        fallbackMessage: "فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unified login accepting either credentials object or a UserRole.
   */
  const login = async (credentialsOrRole: LoginCredentials | UserRole) => {
    if (typeof credentialsOrRole === "object" && "email" in credentialsOrRole) {
      await loginWithCredentials(credentialsOrRole);
      return;
    }

    // Role-based login (Demo / Quick switch mode)
    const role = credentialsOrRole as UserRole;
    setIsLoading(true);

    // Map role to backend seeded account
    const roleCredentialsMap: Record<UserRole, LoginCredentials> = {
      "Super Admin": { email: "admin@amanix.com", password: "Admin@123456" },
      "Company Admin": { email: "admin@al-salamah.com", password: "User@123456" },
      "Consulting Engineer": { email: "engineer@al-salamah.com", password: "User@123456" },
      "Operations Officer": { email: "operations@al-salamah.com", password: "User@123456" },
      "Sales Agent": { email: "sales@al-salamah.com", password: "User@123456" },
      Client: { email: "client@al-salamah.com", password: "User@123456" },
    };

    const targetCreds = roleCredentialsMap[role];

    try {
      const success = await loginWithCredentials(targetCreds);
      if (success) return;
    } catch {
      // Live login fallback to mock profile if backend is not reachable for this specific role
    }

    // Graceful offline mock fallback
    const baseProfile = MOCK_PROFILES[role];
    const profile: UserProfile = {
      ...baseProfile,
      permissions: ROLE_PERMISSIONS[role],
    };

    setUser(profile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    syncTheme(profile.subdomain || profile.tenantId);
    setIsLoading(false);
  };

  /**
   * Full session teardown and token revocation
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuthSession();
      setUser(null);
      setIsLoading(false);
    }
  };

  const switchRole = (role: UserRole, scopeId?: string) => {
    const baseProfile = MOCK_PROFILES[role];
    let profile: UserProfile = {
      ...baseProfile,
      permissions: ROLE_PERMISSIONS[role],
    };

    if (role === "Client" && scopeId) {
      profile = {
        ...profile,
        id: "u-7",
        name: "Rayyan Al-Mansoor",
        email: "rayyan@gulfpetroleum.com",
        tenantId: "57bb2d62-6f4e-44ae-a0e3-7ed4073331dd",
        companyId: scopeId,
      };
    }

    setUser(profile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    syncTheme(profile.subdomain || profile.tenantId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithCredentials,
        logout,
        refreshProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
