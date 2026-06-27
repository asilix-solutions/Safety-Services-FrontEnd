import { ActivityEvent } from "../view-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { History, FileQuestion, FolderOpen, FileText, Receipt, Award } from "lucide-react";

interface RecentActivityProps {
  events: ActivityEvent[];
}

export function RecentActivity({ events }: RecentActivityProps) {
  const { t } = useTranslation();

  const getIcon = (type: ActivityEvent["type"]) => {
    const cls = "h-3.5 w-3.5 text-white";
    switch (type) {
      case "request":
        return <div className="p-1 rounded-full bg-emerald-500 shrink-0"><FileQuestion className={cls} /></div>;
      case "project":
        return <div className="p-1 rounded-full bg-sky-500 shrink-0"><FolderOpen className={cls} /></div>;
      case "contract":
        return <div className="p-1 rounded-full bg-amber-500 shrink-0"><FileText className={cls} /></div>;
      case "invoice":
        return <div className="p-1 rounded-full bg-indigo-500 shrink-0"><Receipt className={cls} /></div>;
      default:
        return <div className="p-1 rounded-full bg-teal-500 shrink-0"><Award className={cls} /></div>;
    }
  };

  const getEventTimeLabel = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return t("common:overview_today");
      }
      if (diffDays === 1) {
        return t("common:overview_yesterday");
      }
      return t("common:overview_days_ago", { days: String(diffDays) }).replace("{days}", String(diffDays));
    } catch {
      return "";
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-primary" />
          {t("common:overview_recent_updates")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {events.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">
            {t("common:noRecords")}
          </div>
        ) : (
          <div className="relative border-s border-border ps-4 ms-2 space-y-5">
            {events.map((event) => (
              <div key={event.id} className="relative flex gap-3 items-start">
                <div className="absolute -start-[23px] mt-0.5 ring-4 ring-background rounded-full bg-background">
                  {getIcon(event.type)}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex justify-between items-center text-xs gap-3">
                    <span className="font-bold text-foreground truncate">
                      {t(`common:${event.titleKey}`) !== `common:${event.titleKey}` 
                        ? t(`common:${event.titleKey}`) 
                        : event.titleFallback}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                      {getEventTimeLabel(event.date)}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">{event.referenceId}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
