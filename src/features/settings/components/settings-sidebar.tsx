"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sliders, Globe, MessageSquare, Scale, ShieldCheck, Building } from "lucide-react";

export interface SettingsNavItem {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    title: "الإعدادات العامة والهوية",
    description: "تسمية مساحة العمل، اللغات الافتراضية، والتوقيت",
    href: "/settings/general",
    icon: Sliders,
  },
  {
    title: "محركات البحث والنطاق (SEO)",
    description: "بيانات OpenGraph، الكلمات الدلالية، وبطاقات التواصل",
    href: "/settings/seo",
    icon: Globe,
  },
  {
    title: "بوابات وقنوات الإشعار",
    description: "بوابات رسائل SMS وخوادم البريد الإلكتروني SMTP",
    href: "/settings/communication",
    icon: MessageSquare,
  },
  {
    title: "السياسات والامتثال (ZATCA)",
    description: "ضريبة القيمة المضافة 15%، السقوف المالية، وسلسلة الاعتمادات",
    href: "/settings/policies",
    icon: Scale,
  },
  {
    title: "تهيئة النظام والأمان",
    description: "مهلة الجلسة، التحقق بخطوتين (2FA)، وحدود المستندات",
    href: "/settings/system",
    icon: ShieldCheck,
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full lg:w-72 space-y-2 shrink-0">
      <div className="p-3 rounded-xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-md space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
          أقسام إعدادات المنشأة
        </p>

        <nav className="space-y-1">
          {SETTINGS_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === "/settings" && item.href === "/settings/general");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all select-none group cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold border border-primary/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
