import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";

interface WelcomeCardProps {
  clientName: string;
  companyName: string;
  activeRequestsCount: number;
  activeProjectsCount: number;
}

export function WelcomeCard({
  clientName,
  companyName,
  activeRequestsCount,
  activeProjectsCount,
}: WelcomeCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>{t("common:overview_welcome_back")}</span>
            <span className="text-primary">{clientName}</span>
          </h2>
          <p className="text-xs text-muted-foreground font-semibold">{companyName}</p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {activeRequestsCount} {t("common:overview_active_requests")}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
              {activeProjectsCount} {t("common:overview_active_projects")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href="/requests/new" passHref legacyBehavior>
            <Button className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              {t("common:overview_new_request")}
            </Button>
          </Link>
          <Link href="/requests" passHref legacyBehavior>
            <Button variant="outline" className="h-9 gap-1.5 text-xs font-semibold cursor-pointer border-border">
              <Search className="h-4 w-4" />
              {t("common:overview_track_requests")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
