import React from "react";
import { OverviewQuickAccessItem } from "../types";
import { Card, CardContent } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { getOverviewIcon } from "../helpers/overview-helpers";
import Link from "next/link";

interface OverviewQuickAccessProps {
  titleKey?: string;
  titleFallback: string;
  links: OverviewQuickAccessItem[];
}

export function OverviewQuickAccess({
  titleKey,
  titleFallback,
  links,
}: OverviewQuickAccessProps) {
  const { t } = useTranslation();

  const title = titleKey && t(`common:${titleKey}`) !== `common:${titleKey}` ? t(`common:${titleKey}`) : titleFallback;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {links.map((link) => (
          <Link key={link.id} href={link.href}>
            <Card className="border-border bg-card shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className="p-2 rounded-xl bg-muted/40 group-hover:bg-primary/5 transition-all">
                  {link.iconName && getOverviewIcon(link.iconName, "h-5 w-5")}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-all">
                    {t(`common:${link.labelKey}`) !== `common:${link.labelKey}` ? t(`common:${link.labelKey}`) : link.labelFallback}
                  </p>
                  {link.count !== undefined && (
                    <p className="text-[10px] text-muted-foreground font-mono">{link.count}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
