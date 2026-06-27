import React from "react";
import { OverviewActivityItem } from "../types";
import { OverviewSection } from "./overview-section";
import { useTranslation } from "@/providers/i18n-provider";
import { getOverviewIcon } from "../helpers/overview-helpers";
import { formatOverviewDate } from "../helpers/overview-helpers";
import { History } from "lucide-react";

interface OverviewRecentActivityProps {
  titleKey?: string;
  titleFallback: string;
  events: OverviewActivityItem[];
}

export function OverviewRecentActivity({
  titleKey,
  titleFallback,
  events,
}: OverviewRecentActivityProps) {
  const { t } = useTranslation();

  const getFeedIcon = (type?: OverviewActivityItem["type"]) => {
    const cls = "h-3.5 w-3.5 text-white";
    switch (type) {
      case "request":
        return <div className="p-1 rounded-full bg-emerald-500 shrink-0">{getOverviewIcon("request", cls)}</div>;
      case "project":
        return <div className="p-1 rounded-full bg-sky-500 shrink-0">{getOverviewIcon("project", cls)}</div>;
      case "contract":
        return <div className="p-1 rounded-full bg-amber-500 shrink-0">{getOverviewIcon("contract", cls)}</div>;
      case "invoice":
        return <div className="p-1 rounded-full bg-indigo-500 shrink-0">{getOverviewIcon("invoice", cls)}</div>;
      case "certificate":
        return <div className="p-1 rounded-full bg-teal-500 shrink-0">{getOverviewIcon("certificate", cls)}</div>;
      default:
        return <div className="p-1 rounded-full bg-slate-500 shrink-0">{getOverviewIcon("help", cls)}</div>;
    }
  };

  const title = titleKey && t(`common:${titleKey}`) !== `common:${titleKey}` ? t(`common:${titleKey}`) : titleFallback;

  return (
    <OverviewSection
      title={
        <>
          <History className="h-4.5 w-4.5 text-primary" />
          {title}
        </>
      }
    >
      {events.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-6">
          {t("common:overview_no_items")}
        </div>
      ) : (
        <div className="relative border-s border-border ps-4 ms-2 space-y-5">
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-3 items-start">
              <div className="absolute -start-[23px] mt-0.5 ring-4 ring-background rounded-full bg-background">
                {getFeedIcon(event.type)}
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex justify-between items-center text-xs gap-3">
                  <span className="font-bold text-foreground truncate">
                    {t(`common:${event.titleKey}`) !== `common:${event.titleKey}` 
                      ? t(`common:${event.titleKey}`) 
                      : event.titleFallback}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                    {formatOverviewDate(event.timestamp, t)}
                  </span>
                </div>
                {event.referenceId && (
                  <p className="text-[10px] font-mono text-muted-foreground">{event.referenceId}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </OverviewSection>
  );
}
export default OverviewRecentActivity;
