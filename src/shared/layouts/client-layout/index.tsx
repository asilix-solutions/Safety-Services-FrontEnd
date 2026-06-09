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

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation();

  if (!user) return null;

  const navItems = ROLE_NAVIGATION[user.role] || [];

  const getNavTranslationKey = (label: string): string => {
    const map: Record<string, string> = {
      "Home": "dashboard:nav_overview",
      "My Requests": "dashboard:nav_requests",
      "Projects": "dashboard:nav_projects",
      "Contracts": "dashboard:nav_contracts",
      "Invoices": "dashboard:nav_invoices",
    };
    return map[label] || label;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Panel */}
      <aside className="hidden md:flex w-64 flex-col border-e border-border bg-card shadow-sm">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center px-6 border-b border-border gap-2.5">
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Icons.Building className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-wide text-emerald-600 dark:text-emerald-400">
            Client Hub
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
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
        <div className="p-4 border-t border-border bg-muted/50">
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={user.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=default"}
              alt={user.name}
              width={36}
              height={36}
              unoptimized
              className="h-9 w-9 rounded-full border border-border"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">Customer Portal</p>
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
        {/* Soft, clean spacing for client portal */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
export default ClientLayout;
