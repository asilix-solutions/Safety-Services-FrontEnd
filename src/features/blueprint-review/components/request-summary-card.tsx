import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent } from "@/shared/ui/card";
import { BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";

interface RequestSummaryCardProps {
  request: BlueprintReviewViewModel;
}

export function RequestSummaryCard({ request }: RequestSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardContent className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-[11px] font-sans">
          <div className="space-y-0.5">
            <span className="text-muted-foreground block text-[10px]">{t("requests:blueprintReview.workspace.client")}</span>
            <span className="font-bold text-foreground truncate block">{request.clientName}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground block text-[10px]">{t("requests:blueprintReview.workspace.facility")}</span>
            <span className="font-bold text-foreground truncate block">{request.facilityName}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground block text-[10px]">{t("requests:blueprintReview.workspace.crNumber")}</span>
            <span className="font-mono font-bold text-foreground">{request.crNumber || "N/A"}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground block text-[10px]">{t("requests:blueprintReview.workspace.area")}</span>
            <span className="font-bold text-foreground">{request.area} m²</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground block text-[10px]">{t("requests:blueprintReview.workspace.coordinator")}</span>
            <span className="font-bold text-foreground truncate block">{request.onSiteCoordinatorName || request.contactName || "N/A"}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground block text-[10px]">{t("requests:blueprintReview.workspace.phone")}</span>
            <span className="font-mono font-bold text-foreground truncate block">{request.onSiteCoordinatorPhone || request.contactPhone || "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
