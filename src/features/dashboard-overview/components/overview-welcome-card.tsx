import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { OverviewWelcomeBtn, OverviewStatItem } from "../types";
import { getOverviewIcon, getOverviewBadgeClass } from "../helpers/overview-helpers";
import Link from "next/link";

interface OverviewWelcomeCardProps {
  name: string;
  roleLabel?: string;
  roleLabelKey?: string;
  subtitle?: string;
  stats?: OverviewStatItem[];
  actions?: OverviewWelcomeBtn[];
}

export function OverviewWelcomeCard({
  name,
  roleLabel,
  roleLabelKey,
  subtitle,
  stats,
  actions,
}: OverviewWelcomeCardProps) {
  const { t } = useTranslation();

  const getRoleLabel = () => {
    if (roleLabelKey) {
      const translated = t(`common:${roleLabelKey}`);
      if (translated !== `common:${roleLabelKey}`) return translated;
    }
    return roleLabel || "";
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 flex-wrap">
            <span>{t("common:overview_welcome_back")}</span>
            <span className="text-primary">{name}</span>
            {getRoleLabel() && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                {getRoleLabel()}
              </span>
            )}
          </h2>
          {subtitle && <p className="text-xs text-muted-foreground font-semibold">{subtitle}</p>}
          
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              {stats.map((stat, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold border ${getOverviewBadgeClass(stat.badgeVariant || "info")}`}
                >
                  {stat.count} {t(`common:${stat.labelKey}`) !== `common:${stat.labelKey}` ? t(`common:${stat.labelKey}`) : stat.labelFallback}
                </span>
              ))}
            </div>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-3 shrink-0">
            {actions.map((act, idx) => (
              <Link key={idx} href={act.href} passHref legacyBehavior>
                <Button
                  variant={act.variant || "default"}
                  className="h-9 gap-1.5 text-xs font-semibold cursor-pointer border-border"
                >
                  {act.iconName && getOverviewIcon(act.iconName, "h-4 w-4")}
                  {t(`common:${act.labelKey}`) !== `common:${act.labelKey}` ? t(`common:${act.labelKey}`) : act.labelFallback}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
