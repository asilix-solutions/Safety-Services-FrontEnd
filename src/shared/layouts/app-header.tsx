"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { LanguageSwitcher } from "@/shared/components/language-switcher";
import { Menu } from "lucide-react";
import { RoleSwitcher } from "@/features/dashboard/components/role-switcher";
import { NotificationBell } from "@/features/notifications/notification-bell";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const getRoleTranslationKey = (role: string) => {
    return `dashboard:role_${role.replace(/\s+/g, "_")}`;
  };

  return (
    <header className="flex h-16 items-center justify-between px-6 border-b border-border/80 bg-card/40 backdrop-blur-md sticky top-0 z-30">
      {/* Mobile Toggle & Active Context */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t("dashboard:activeContext")}</span>
          <Badge variant="success">{t(getRoleTranslationKey(user.role))}</Badge>
        </div>
      </div>

      {/* Quick-Switch Role & Language & Theme Toggle & Notifications */}
      <div className="flex items-center gap-3">
        {/* Centralized Role/Profile Switcher */}
        <RoleSwitcher />

        {/* Notifications Bell */}
        <NotificationBell />

        {/* Dynamic i18n Language Switcher */}
        <LanguageSwitcher />

        {/* Dark/Light Mode Switcher */}
        <ThemeToggle />
      </div>
    </header>
  );
}

export default AppHeader;
