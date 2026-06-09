"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { LanguageSwitcher } from "@/shared/components/language-switcher";
import { UserRole } from "@/types/role";
import { Menu, Bell } from "lucide-react";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { user, switchRole } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

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
        {/* DEV Switcher Console */}
        <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 rounded-lg px-2.5 py-1">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider hidden lg:inline-block">
            {t("dashboard:simulateRole")}
          </span>
          <select
            value={user.role}
            onChange={handleRoleChange}
            className="bg-transparent text-xs font-semibold text-primary outline-none cursor-pointer focus:ring-0 border-0 p-0 pr-6"
          >
            <option value="Super Admin" className="bg-popover text-foreground">{t("dashboard:role_Super_Admin")}</option>
            <option value="Company Admin" className="bg-popover text-foreground">{t("dashboard:role_Company_Admin")}</option>
            <option value="Consulting Engineer" className="bg-popover text-foreground">{t("dashboard:role_Consulting_Engineer")}</option>
            <option value="Operations Officer" className="bg-popover text-foreground">{t("dashboard:role_Operations_Officer")}</option>
            <option value="Sales Agent" className="bg-popover text-foreground">{t("dashboard:role_Sales_Agent")}</option>
            <option value="Client" className="bg-popover text-foreground">{t("dashboard:role_Client")}</option>
          </select>
        </div>

        {/* Notifications Bell */}
        <button className="relative h-9 w-9 rounded-lg bg-secondary/15 border border-border/20 flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        {/* Dynamic i18n Language Switcher */}
        <LanguageSwitcher />

        {/* Dark/Light Mode Switcher */}
        <ThemeToggle />
      </div>
    </header>
  );
}

export default AppHeader;
