"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { ClosureStatusViewModel } from "../view-models/closure.viewmodel";

interface ClosureSummaryProps {
  viewModel: ClosureStatusViewModel;
}

export function ClosureSummary({ viewModel }: ClosureSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-success/30 bg-success/[0.03]">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-success">
          <Lock className="h-4 w-4" />
          {t("closure:title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Badge variant="success" className="w-fit">
          {t("closure:summary.closedBadge")}
        </Badge>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground block uppercase">{t("closure:summary.closedAt")}</span>
            <span className="font-semibold text-foreground tabular-nums">{viewModel.closedAtLabel}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground block uppercase">{t("closure:summary.closedBy")}</span>
            <span className="font-semibold text-foreground">{viewModel.closedBy}</span>
          </div>
          {viewModel.methodLabelKey && (
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block uppercase">{t("closure:summary.method")}</span>
              <span className="font-semibold text-foreground">{t(viewModel.methodLabelKey)}</span>
            </div>
          )}
        </div>

        {viewModel.signatureImage && (
          <div className="max-w-xs overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewModel.signatureImage} alt={t("closure:summary.closedBadge")} className="w-full h-auto object-contain bg-card" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ClosureSummary;
