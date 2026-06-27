import React from "react";
import { OverviewActionItem } from "../types";
import { OverviewSection } from "./overview-section";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { AlertCircle, CreditCard, FileSignature, AlertOctagon } from "lucide-react";
import Link from "next/link";

interface OverviewActionListProps {
  titleKey?: string;
  titleFallback: string;
  items: OverviewActionItem[];
}

export function OverviewActionList({
  titleKey,
  titleFallback,
  items,
}: OverviewActionListProps) {
  const { t } = useTranslation();

  const getActionIcon = (type?: OverviewActionItem["type"]) => {
    const cls = "h-4.5 w-4.5";
    switch (type) {
      case "pay_invoice":
        return <CreditCard className={`${cls} text-rose-500`} />;
      case "sign_contract":
        return <FileSignature className={`${cls} text-amber-500`} />;
      default:
        return <AlertOctagon className={`${cls} text-primary`} />;
    }
  };

  const title = titleKey && t(`common:${titleKey}`) !== `common:${titleKey}` ? t(`common:${titleKey}`) : titleFallback;

  return (
    <OverviewSection
      title={
        <>
          <AlertCircle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
          {title}
          {items.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
              {items.length}
            </span>
          )}
        </>
      }
      className="border-border bg-card shadow-sm h-full flex flex-col"
      contentClassName={items.length === 0 ? "flex-1 flex flex-col items-center justify-center p-6" : "flex-1 p-0"}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <span className="text-muted-foreground text-xs font-semibold">{t("common:overview_no_actions")}</span>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-muted/40 shrink-0">
                  {getActionIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {t(`common:${item.titleKey}`) !== `common:${item.titleKey}` ? t(`common:${item.titleKey}`) : item.titleFallback}
                  </p>
                  {item.referenceId && (
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{item.referenceId}</p>
                  )}
                </div>
              </div>
              <Link href={item.href} passHref legacyBehavior>
                <Button size="sm" className="h-8 text-xs font-semibold shrink-0 cursor-pointer">
                  {t(`common:${item.actionLabelKey}`) !== `common:${item.actionLabelKey}` ? t(`common:${item.actionLabelKey}`) : item.actionLabelFallback}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </OverviewSection>
  );
}
export default OverviewActionList;
