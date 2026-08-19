"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { ROLE_NAVIGATION } from "@/constants/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import * as Icons from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function NavIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!IconComponent) return <Icons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
}

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portalTitle?: string;
  portalIcon?: React.ReactNode;
}

export function MobileNavDrawer({
  open,
  onOpenChange,
  portalTitle = "SSLM Platform",
  portalIcon,
}: MobileNavDrawerProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { t, dir } = useTranslation();
  const side = dir === "rtl" ? "right" : "left";

  if (!user) return null;

  const navItems = ROLE_NAVIGATION[user.role] || [];

  const getNavTranslationKey = (label: string): string => {
    const map: Record<string, string> = {
      "Dashboard": "dashboard:nav_overview",
      "Companies": "dashboard:nav_companies",
      "Subscriptions": "dashboard:nav_subscriptions",
      "Users": "dashboard:nav_users",
      "Settings": "dashboard:nav_settings",
      "Requests": "dashboard:nav_requests",
      "Quotation Approvals": "dashboard:nav_quotation_approvals",
      "Projects": "dashboard:nav_projects",
      "Customers": "dashboard:nav_customers",
      "Employees": "dashboard:nav_employees",
      "Reports": "dashboard:nav_reports",
      "Contracts": "dashboard:nav_contracts",
      "Certificates": "dashboard:nav_certificates",
      "Invoices": "dashboard:nav_invoices",
      "Blueprint Review": "dashboard:nav_blueprint_review",
      "Quotations": "dashboard:nav_quotations",
      "Site Visits": "dashboard:nav_site_visits",
      "Home": "dashboard:nav_home",
      "My Requests": "dashboard:nav_my_requests",
      "Execution": "dashboard:nav_execution",
      "Expenses": "dashboard:nav_expenses",
      "Labor": "dashboard:nav_labor",
      "Obstacles": "dashboard:nav_obstacles",
      "Documents": "dashboard:nav_documents",
    };
    return map[label] || label;
  };

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="w-[300px] sm:w-[360px] p-0 flex flex-col justify-between bg-card text-foreground">
        {/* Drawer Header */}
        <div className="p-6 border-b border-border">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                {portalIcon || <Icons.ShieldCheck className="h-5 w-5" />}
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground leading-none">
                  {portalTitle}
                </SheetTitle>
                <SheetDescription className="text-[11px] text-muted-foreground mt-1">
                  {user.role}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3.5 px-4 py-3 min-h-[44px] text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground active:bg-secondary/80"
                }`}
              >
                <NavIcon name={item.iconName} className="h-5 w-5 shrink-0" />
                <span>{t(getNavTranslationKey(item.label))}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t border-border bg-muted/30 space-y-3">
          <div className="flex items-center gap-3">
            <Image
              src={user.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=default"}
              alt={user.name}
              width={38}
              height={38}
              unoptimized
              className="h-9 w-9 rounded-full bg-muted border border-border shrink-0"
            />
            <div className="min-w-0 overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full min-h-[40px] text-xs flex items-center justify-center gap-2 border-border text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            onClick={() => {
              onOpenChange(false);
              logout();
            }}
          >
            <Icons.LogOut className="h-4 w-4" />
            <span>{t("dashboard:logout")}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
export default MobileNavDrawer;
