"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types/role";
import { UserProfile } from "@/types/user";
import { ROLE_PERMISSIONS } from "@/constants/permissions";
import { applyTenantTheme } from "@/lib/theme-utils";
import { getBranding } from "@/domains/settings";
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  /** `scopeId` is the client company for a Client, or the tenant for a Company Admin. */
  switchRole: (role: UserRole, scopeId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Bumped when the profile shape changes. A profile cached before `tenantId`
 * existed would scope to nothing, so the old key is abandoned rather than
 * migrated — re-login costs nothing in a mock build.
 */
const SESSION_STORAGE_KEY = "sslm_user_profile_v2";

const MOCK_PROFILES: Record<UserRole, Omit<UserProfile, "permissions">> = {
  "Super Admin": {
    id: "u-1",
    name: "Alexander Vance",
    email: "alexander.vance@safetysystem.com",
    role: "Super Admin",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alexander",
    active: true,
  },
  "Company Admin": {
    id: "u-2",
    name: "Sarah Jenkins",
    email: "sarah.j@vertexindustrial.com",
    role: "Company Admin",
    tenantId: "COMP-001",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
    active: true,
  },
  "Consulting Engineer": {
    id: "u-3",
    name: "Dr. Marcus Vance",
    email: "marcus.v@safetysystem.com",
    role: "Consulting Engineer",
    tenantId: "COMP-001",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus",
    active: true,
  },
  "Operations Officer": {
    id: "u-4",
    name: "Elena Rostova",
    email: "elena.r@vertexindustrial.com",
    role: "Operations Officer",
    tenantId: "COMP-001",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Elena",
    active: true,
  },
  "Sales Agent": {
    id: "u-5",
    name: "James Sterling",
    email: "james.s@safetysystem.com",
    role: "Sales Agent",
    tenantId: "COMP-001",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=James",
    active: true,
  },
  Client: {
    id: "u-6",
    name: "David Sterling",
    email: "d.sterling@emaar.ae",
    role: "Client",
    tenantId: "COMP-001",
    companyId: "c-102",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=David",
    active: true,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from LocalStorage & hydrate tenant branding
  useEffect(() => {
    const savedProfile = localStorage.getItem(SESSION_STORAGE_KEY);
    let activeTenantId: string | undefined;
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUser(parsed);
        activeTenantId = parsed.tenantId;
      } catch (err) {
        console.error("Failed to parse saved user profile", err);
      }
    }

    try {
      const branding = getBranding(activeTenantId);
      if (branding && branding.primaryColor) {
        applyTenantTheme({
          primaryHex: branding.primaryColor,
          primaryForegroundHex: branding.primaryForeground,
          secondaryHex: branding.secondaryColor,
          accentHex: branding.accentColor,
          darkModeOverrides: branding.darkModeOverrides,
        });
      }
    } catch (err) {
      console.error("Failed to hydrate tenant theme", err);
    }

    setIsLoading(false);
  }, []);

  // Reactively re-hydrate theme tokens when dark/light mode toggles or user tenant changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncTheme = () => {
      try {
        const branding = getBranding(user?.tenantId);
        if (branding && branding.primaryColor) {
          applyTenantTheme({
            primaryHex: branding.primaryColor,
            primaryForegroundHex: branding.primaryForeground,
            secondaryHex: branding.secondaryColor,
            accentHex: branding.accentColor,
            darkModeOverrides: branding.darkModeOverrides,
            isDark: document.documentElement.classList.contains("dark"),
          });
        }
      } catch (err) {
        console.error("Failed to sync tenant theme", err);
      }
    };

    // Initial sync for current user
    syncTheme();

    // Listen for dark mode class toggles on <html>
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          syncTheme();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [user?.tenantId]);

  const login = async (role: UserRole) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const baseProfile = MOCK_PROFILES[role];
    const profile: UserProfile = {
      ...baseProfile,
      permissions: ROLE_PERMISSIONS[role],
    };
    
    setUser(profile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));

    try {
      const branding = getBranding(profile.tenantId);
      if (branding && branding.primaryColor) {
        applyTenantTheme({
          primaryHex: branding.primaryColor,
          primaryForegroundHex: branding.primaryForeground,
          secondaryHex: branding.secondaryColor,
          accentHex: branding.accentColor,
          darkModeOverrides: branding.darkModeOverrides,
        });
      }
    } catch (err) {
      console.error("Failed to apply tenant theme on login", err);
    }

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };
  const switchRole = (role: UserRole, scopeId?: string) => {
    const companyId = scopeId;
    const baseProfile = MOCK_PROFILES[role];
    let profile: UserProfile = {
      ...baseProfile,
      permissions: ROLE_PERMISSIONS[role],
    };
    
    // role infrastructure, not a permission check — dev role-switcher assigning a mock profile
    if (role === "Client" && companyId) {
      if (companyId === "c-103") {
        profile = {
          ...profile,
          id: "u-7",
          name: "Rayyan Al-Mansoor",
          email: "rayyan@gulfpetroleum.com",
          tenantId: "COMP-001",
          companyId: "c-103",
        };
      } else {
        profile = {
          ...profile,
          id: "u-6",
          name: "David Sterling",
          email: "d.sterling@emaar.ae",
          tenantId: "COMP-001",
          companyId: "c-102",
        };
      }
    }

    // Switching the tenant itself — the only way to observe isolation in the UI.
    if (role === "Company Admin") {
      if (scopeId === "COMP-002") {
        profile = {
          ...profile,
          id: "u-8",
          name: "Layla Haddad",
          email: "layla.h@safetyshield.com",
          tenantId: "COMP-002",
          avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Layla",
        };
      } else if (scopeId === "COMP-003") {
        profile = {
          ...profile,
          id: "u-9",
          name: "Khalid Issa",
          email: "khalid@gulffire.com",
          tenantId: "COMP-003",
          avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Khalid",
        };
      } else if (scopeId === "COMP-004") {
        profile = {
          ...profile,
          id: "u-10",
          name: "Ahmed Jamil",
          email: "ahmed@redseacompliance.com",
          tenantId: "COMP-004",
          avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ahmed",
        };
      } else {
        profile = {
          ...profile,
          id: "u-2",
          name: "Sarah Jenkins",
          email: "sarah.j@vertexindustrial.com",
          tenantId: "COMP-001",
          avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
        };
      }
    }
    
    setUser(profile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));

    try {
      const branding = getBranding(profile.tenantId);
      if (branding && branding.primaryColor) {
        applyTenantTheme({
          primaryHex: branding.primaryColor,
          primaryForegroundHex: branding.primaryForeground,
          secondaryHex: branding.secondaryColor,
          accentHex: branding.accentColor,
          darkModeOverrides: branding.darkModeOverrides,
        });
      }
    } catch (err) {
      console.error("Failed to apply tenant theme on switchRole", err);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
