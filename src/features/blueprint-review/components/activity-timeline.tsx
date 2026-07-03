import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { ClipboardList, AlertTriangle, FileText, CheckCircle2, DollarSign } from "lucide-react";
import { BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";

interface ActivityTimelineProps {
  request: BlueprintReviewViewModel;
}

export function ActivityTimeline({ request }: ActivityTimelineProps) {
  const { t } = useTranslation();

  // Sort timeline newest first
  const sortedTimeline = [...(request.timeline || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getTimelineIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case "submitted":
        return <ClipboardList className="h-4 w-4 text-primary" />;
      case "assigned":
      case "under_review":
        return <ClipboardList className="h-4 w-4 text-indigo-500" />;
      case "quotation_created":
      case "awaiting_approval":
      case "awaiting_payment":
        return <DollarSign className="h-4 w-4 text-amber-500" />;
      case "approved":
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:
        return <FileText className="h-4 w-4 text-foreground" />;
    }
  };

  return (
    <Card className="border-border bg-card max-h-[350px] overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-foreground">
          {t("requests:blueprintReview.activity.title")}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {t("requests:blueprintReview.activity.desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {sortedTimeline.length > 0 ? (
          <div className="relative border-s border-border ps-3 space-y-4 font-sans text-xs">
            {sortedTimeline.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Node Dot Icon */}
                <div className="absolute -start-6 top-0 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center">
                  {getTimelineIcon(item.status)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground capitalize">
                      {item.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-xs">
            {t("requests:blueprintReview.activity.empty")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
