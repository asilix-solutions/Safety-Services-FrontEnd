import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";

interface RequestSummaryCardProps {
  request: BlueprintReviewViewModel;
}

export function RequestSummaryCard({ request }: RequestSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-foreground">
          {t("requests:quotations.details.requestSummary")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground block">{t("requests:blueprintReview.workspace.client")}</span>
            <span className="font-semibold text-foreground text-sm">{request.clientName}</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block">{t("requests:blueprintReview.workspace.facility")}</span>
            <span className="font-semibold text-foreground text-sm">{request.facilityName}</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block">{t("requests:blueprintReview.workspace.crNumber")}</span>
            <span className="font-mono font-semibold text-foreground text-sm">{request.crNumber || "N/A"}</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block">{t("requests:blueprintReview.workspace.area")}</span>
            <span className="font-semibold text-foreground text-sm">{request.area} m²</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block">{t("requests:blueprintReview.workspace.activity")}</span>
            <span className="font-semibold text-foreground text-sm">{request.activityName}</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block">{t("requests:blueprintReview.workspace.isic")}</span>
            <span className="font-mono font-semibold text-foreground text-sm">{request.isicCode || "N/A"}</span>
          </div>

          <div className="space-y-1 border-t border-border pt-3 md:col-span-2">
            <span className="text-muted-foreground block">{t("requests:blueprintReview.workspace.coordinator")}</span>
            <span className="font-semibold text-foreground text-sm">{request.onSiteCoordinatorName || request.contactName || "N/A"}</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block">{t("requests:blueprintReview.workspace.phone")}</span>
            <span className="font-mono font-semibold text-foreground text-sm">{request.onSiteCoordinatorPhone || request.contactPhone || "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
