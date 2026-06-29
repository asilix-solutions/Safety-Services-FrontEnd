"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types/role";
import { UserProfile } from "@/types/user";
import { ROLE_PERMISSIONS } from "@/constants/permissions";
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole, companyId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    companyId: "c-101",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
    active: true,
  },
  "Consulting Engineer": {
    id: "u-3",
    name: "Dr. Marcus Vance",
    email: "marcus.v@safetysystem.com",
    role: "Consulting Engineer",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus",
    active: true,
  },
  "Operations Officer": {
    id: "u-4",
    name: "Elena Rostova",
    email: "elena.r@vertexindustrial.com",
    role: "Operations Officer",
    companyId: "c-101",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Elena",
    active: true,
  },
  "Sales Agent": {
    id: "u-5",
    name: "James Sterling",
    email: "james.s@safetysystem.com",
    role: "Sales Agent",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=James",
    active: true,
  },
  Client: {
    id: "u-6",
    name: "Rayyan Al-Mansoor",
    email: "rayyan@gulfpetroleum.com",
    role: "Client",
    companyId: "c-102",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rayyan",
    active: true,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("sslm_user_profile");
    if (savedProfile) {
      try {
        setUser(JSON.parse(savedProfile));
      } catch (err) {
        console.error("Failed to parse saved user profile", err);
      }
    }
    setIsLoading(false);
  }, []);

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
    localStorage.setItem("sslm_user_profile", JSON.stringify(profile));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sslm_user_profile");
  };
  const switchRole = (role: UserRole, companyId?: string) => {
    const baseProfile = MOCK_PROFILES[role];
    let profile: UserProfile = {
      ...baseProfile,
      permissions: ROLE_PERMISSIONS[role],
    };
    
    if (role === "Client" && companyId) {
      if (companyId === "c-103") {
        profile = {
          ...profile,
          id: "u-7",
          name: "Gulf Petroleum Representative",
          email: "client@gulfpetroleum.com",
          companyId: "c-103",
        };
      } else {
        profile = {
          ...profile,
          id: "u-6",
          name: "Rayyan Al-Mansoor",
          email: "rayyan@gulfpetroleum.com",
          companyId: "c-102",
        };
      }
    }
    
    setUser(profile);
    localStorage.setItem("sslm_user_profile", JSON.stringify(profile));
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
