import React from "react";
import { OverviewEntityItem } from "../types";
import { OverviewSection } from "./overview-section";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import { getOverviewProgressColor } from "../helpers/overview-helpers";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

interface OverviewEntityListProps {
  titleKey?: string;
  titleFallback: string;
  viewAllKey?: string;
  viewAllFallback?: string;
  viewAllHref?: string;
  items: OverviewEntityItem[];
  icon?: React.ReactNode;
}

export function OverviewEntityList({
  titleKey,
  titleFallback,
  viewAllKey,
  viewAllFallback = "View All",
  viewAllHref,
  items,
  icon,
}: OverviewEntityListProps) {
  const { t } = useTranslation();

  const title = titleKey && t(`common:${titleKey}`) !== `common:${titleKey}` ? t(`common:${titleKey}`) : titleFallback;
  const viewAllLabel = viewAllKey && t(`common:${viewAllKey}`) !== `common:${viewAllKey}` ? t(`common:${viewAllKey}`) : viewAllFallback;

  return (
    <OverviewSection
      title={
        <>
          {icon || <FileText className="h-4.5 w-4.5 text-primary" />}
          {title}
        </>
      }
      actionButton={
        viewAllHref && (
          <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-semibold gap-1 text-primary hover:text-primary/95 cursor-pointer">
            <Link href={viewAllHref}>
              {viewAllLabel}
              <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            </Link>
          </Button>
        )
      }
      className="border-border bg-card shadow-sm min-h-[260px] max-h-[360px] flex flex-col h-full"
      contentClassName={items.length === 0 ? "flex-1 p-6 pt-0 flex flex-col items-center justify-center min-h-[120px]" : "flex-1 overflow-y-auto p-6 pt-0 flex flex-col justify-start space-y-3"}
    >
      {items.length === 0 ? (
        <EmptyState
          title={t("common:overview_no_items") || "No items to display"}
          description={t("common:overview_no_items") || "No items found."}
          compact
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="py-2 first:pt-0 last:pb-0 space-y-1.5">
              <div className="flex justify-between items-start text-xs gap-3">
                <div className="min-w-0">
                  {item.href ? (
                    <Link href={item.href} className="font-bold text-foreground hover:text-primary transition-all truncate block">
                      {item.title}
                    </Link>
                  ) : (
                    <p className="font-bold text-foreground truncate">{item.title}</p>
                  )}
                  {item.subtitle && (
                    <p className="text-[10px] text-muted-foreground font-semibold truncate">{item.subtitle}</p>
                  )}
                </div>
                <div className="text-end shrink-0 space-y-0.5">
                  {item.statusKey && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground">
                      {t(`common:${item.statusKey}`) !== `common:${item.statusKey}` ? t(`common:${item.statusKey}`) : item.statusFallback}
                    </span>
                  )}
                  {item.metaText && (
                    <p className="text-[10px] text-muted-foreground font-medium">{item.metaText}</p>
                  )}
                </div>
              </div>

              {item.progress !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getOverviewProgressColor(item.progress)}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </OverviewSection>
  );
}
export default OverviewEntityList;
