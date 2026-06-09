"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { ROLE_NAVIGATION } from "@/constants/navigation";
import { Button } from "@/shared/ui/button";
import * as Icons from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/shared/layouts/app-header";

function NavIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!IconComponent) return <Icons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
}

export function OperationsLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation();

  if (!user) return null;

  const navItems = ROLE_NAVIGATION[user.role] || [];

  const getNavTranslationKey = (label: string): string => {
    const map: Record<string, string> = {
      "Dashboard": "dashboard:nav_overview",
      "Requests": "dashboard:nav_requests",
      "Blueprint Review": "dashboard:nav_blueprint_review",
      "Reports": "dashboard:nav_reports",
      "Quotations": "dashboard:nav_quotations",
      "Site Visits": "dashboard:nav_site_visits",
      "Projects": "dashboard:nav_projects",
      "Execution": "dashboard:nav_execution",
      "Expenses": "dashboard:nav_expenses",
      "Labor": "dashboard:nav_labor",
      "Obstacles": "dashboard:nav_obstacles",
      "Documents": "dashboard:nav_documents",
    };
    return map[label] || label;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Panel */}
      <aside className="hidden md:flex w-64 flex-col border-e border-border bg-card/90 backdrop-blur-md">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center px-6 border-b border-border gap-2.5">
          <div className="h-7 w-7 rounded bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
            <Icons.HardHat className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-amber-500 to-amber-300 dark:from-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
            Operations Portal
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <NavIcon name={item.iconName} className="h-4 w-4 shrink-0" />
                {t(getNavTranslationKey(item.label))}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-muted/40">
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={user.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=default"}
              alt={user.name}
              width={36}
              height={36}
              unoptimized
              className="h-9 w-9 rounded-full bg-muted border border-border"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs flex items-center justify-center gap-1.5 border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={logout}
          >
            <Icons.LogOut className="h-3.5 w-3.5" />
            {t("dashboard:logout")}
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
export default OperationsLayout;
