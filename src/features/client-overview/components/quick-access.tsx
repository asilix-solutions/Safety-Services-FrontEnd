import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { FileQuestion, FolderOpen, FileText, Receipt, Award } from "lucide-react";
import Link from "next/link";

interface QuickAccessProps {
  counts: {
    requests: number;
    projects: number;
    invoices: number;
    contracts: number;
    certificates: number;
  };
}

export function QuickAccess({ counts }: QuickAccessProps) {
  const { t } = useTranslation();

  const links = [
    {
      label: t("common:overview_type_request"),
      count: counts.requests,
      icon: <FileQuestion className="h-5 w-5 text-emerald-500" />,
      href: "/requests",
    },
    {
      label: t("common:overview_type_project"),
      count: counts.projects,
      icon: <FolderOpen className="h-5 w-5 text-sky-500" />,
      href: "/projects",
    },
    {
      label: t("common:overview_type_invoice"),
      count: counts.invoices,
      icon: <Receipt className="h-5 w-5 text-indigo-500" />,
      href: "/invoices",
    },
    {
      label: t("common:overview_type_contract"),
      count: counts.contracts,
      icon: <FileText className="h-5 w-5 text-amber-500" />,
      href: "/contracts",
    },
    {
      label: t("common:overview_type_certificate"),
      count: counts.certificates,
      icon: <Award className="h-5 w-5 text-teal-500" />,
      href: "/certificates",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground">{t("common:overview_quick_access")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {links.map((link, idx) => (
          <Link key={idx} href={link.href} passHref legacyBehavior>
            <Card className="border-border bg-card shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className="p-2 rounded-xl bg-muted/40 group-hover:bg-primary/5 transition-all">
                  {link.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-all">
                    {link.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">{link.count}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
