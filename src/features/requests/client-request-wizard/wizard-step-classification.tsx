"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { ShieldCheck, HardHat, FileSignature, MapPin, BadgeAlert } from "lucide-react";
import { RequestClassification, RequestType, LicensingRequest } from "@/domains/requests/types";
import { useTranslation } from "@/providers/i18n-provider";
import { getClassificationReason, getClassificationDisplayName } from "@/domains/requests/workflow";

interface AutoClassificationProps {
  classification: RequestClassification;
  siteVisitRequired: boolean;
  engineeringReviewRequired: boolean;
  instantReportAllowed: boolean;
  area: number;
  requestType: RequestType;
  requestData: Partial<LicensingRequest>;
  onNext: () => void;
  onPrev: () => void;
}

export function ClassificationStep({
  classification,
  siteVisitRequired,
  engineeringReviewRequired,
  instantReportAllowed,
  area,
  requestType,
  requestData,
  onNext,
  onPrev,
}: AutoClassificationProps) {
  const { t } = useTranslation();

  const getClientMetadata = () => {
    switch (classification) {
      case "fast_track":
        return {
          title: t("requests:wizard.classification.fastReviewLabel"),
          desc: t("requests:wizard.classification.fastTrackClientDesc"),
          timeline: t("requests:wizard.classification.fastTrackTimeline"),
          colorClass: "border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-950/[0.08] text-emerald-800 dark:text-emerald-300",
          icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
        };
      case "maintenance_strategy":
        return {
          title: t("requests:wizard.classification.maintenanceReviewLabel"),
          desc: t("requests:wizard.classification.maintenanceClientDesc"),
          timeline: t("requests:wizard.classification.maintenanceTimeline"),
          colorClass: "border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-950/[0.08] text-amber-800 dark:text-amber-300",
          icon: <HardHat className="h-6 w-6 text-amber-500" />,
        };
      case "engineering_project":
        return {
          title: t("requests:wizard.classification.engineeringReviewLabel"),
          desc: t("requests:wizard.classification.engineeringClientDesc"),
          timeline: t("requests:wizard.classification.engineeringTimeline"),
          colorClass: "border-indigo-500/20 bg-indigo-500/[0.03] dark:bg-indigo-950/[0.08] text-indigo-800 dark:text-indigo-300",
          icon: <FileSignature className="h-6 w-6 text-indigo-500" />,
        };
      case "high_hazard_review":
        return {
          title: t("requests:wizard.classification.enhancedSafetyReviewLabel"),
          desc: t("requests:wizard.classification.highHazardClientDesc"),
          timeline: t("requests:wizard.classification.highHazardTimeline"),
          colorClass: "border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-950/[0.08] text-amber-800 dark:text-amber-300",
          icon: <BadgeAlert className="h-6 w-6 text-amber-500" />,
        };
    }
  };

  const clientMeta = getClientMetadata();

  return (
    <div className="space-y-6">
      {/* Success Confirmation Banner */}
      <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] dark:bg-emerald-950/[0.08] text-xs flex gap-3 items-start">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-left rtl:text-right">
          <h4 className="font-bold text-foreground">{t("requests:wizard.classification.bannerTitle")}</h4>
          <p className="text-muted-foreground leading-relaxed">
            {t("requests:wizard.classification.bannerDesc")}
          </p>
        </div>
      </div>

      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">
          {t("requests:wizard.classification.clientTitle")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.classification.clientSubtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Classification Result Card */}
        <div className={`p-5 rounded-xl border flex gap-4 transition-all duration-200 ${clientMeta.colorClass}`}>
          <div className="p-3 bg-background rounded-xl border border-border/40 shadow-sm shrink-0 self-start">
            {clientMeta.icon}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Assigned Path</span>
            <h3 className="font-bold text-base tracking-tight text-foreground">{clientMeta.title}</h3>
          </div>
        </div>

        {/* What Happens Next Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("requests:wizard.classification.nextStepTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-foreground leading-relaxed">
              {clientMeta.desc}
            </p>
            
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("requests:wizard.classification.timeline")}:</span>
                <span className="font-bold text-foreground bg-secondary px-2.5 py-1 rounded text-[11px]">
                  {clientMeta.timeline}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal italic">
                {t("requests:wizard.classification.timelineHelper")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Reminder Card */}
        <div className="p-4 rounded-xl border border-border bg-secondary/15 text-xs text-muted-foreground leading-relaxed">
          {t("requests:wizard.classification.trackingReminder")}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          {t("requests:wizard.buttons.previous")}
        </Button>
        <Button type="button" size="sm" onClick={onNext}>
          {t("requests:wizard.classification.continueToReview")}
        </Button>
      </div>
    </div>
  );
}
export default ClassificationStep;
