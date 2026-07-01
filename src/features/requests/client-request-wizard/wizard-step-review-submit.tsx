"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { RequiredDocument, RequestType } from "@/domains/requests/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Check, Eye, Download, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { getClassificationDisplayName } from "@/domains/requests/workflow";
import { ServiceDetailsCard } from "../components/service-details-card";

interface ReviewSubmitStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  documents: RequiredDocument[];
  classificationText: string;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export function ReviewSubmitStep({
  form,
  documents,
  classificationText,
  onSaveDraft,
  onSubmit,
  onPrev,
  isSubmitting,
}: ReviewSubmitStepProps) {
  const { t } = useTranslation();
  const { watch } = form;
  const [termsAccepted, setTermsAccepted] = useState(false);

  const values = watch();

  const getRequestTypeLabel = (type: RequestType) => {
    const map: Record<RequestType, string> = {
      new_license: t("requests:wizard.requestTypes.newLicense.title"),
      maintenance_contract: t("requests:wizard.requestTypes.maintenanceContract.title"),
      engineering_blueprint: t("requests:wizard.requestTypes.engineeringBlueprint.title"),
      technical_report: t("requests:wizard.requestTypes.technicalReport.title"),
    };
    return map[type] || type;
  };

  const getClassificationLabel = (cls: string) => {
    return getClassificationDisplayName(cls, t);
  };

  const getReviewPathSummary = (cls: string) => {
    switch (cls) {
      case "fast_track":
        return {
          path: t("requests:wizard.classification.fastReviewLabel"),
          duration: t("requests:wizard.classification.fastTrackTimeline"),
          nextStep: t("requests:wizard.review.pathSummary.fastReviewNextStep"),
        };
      case "maintenance_strategy":
        return {
          path: t("requests:wizard.classification.maintenanceReviewLabel"),
          duration: t("requests:wizard.classification.maintenanceTimeline"),
          nextStep: t("requests:wizard.review.pathSummary.maintenanceReviewNextStep"),
        };
      case "engineering_project":
        return {
          path: t("requests:wizard.classification.engineeringReviewLabel"),
          duration: t("requests:wizard.classification.engineeringTimeline"),
          nextStep: t("requests:wizard.review.pathSummary.engineeringReviewNextStep"),
        };
      case "high_hazard_review":
        return {
          path: t("requests:wizard.classification.enhancedSafetyReviewLabel"),
          duration: t("requests:wizard.classification.highHazardTimeline"),
          nextStep: t("requests:wizard.review.pathSummary.enhancedSafetyReviewNextStep"),
        };
      default:
        return {
          path: cls,
          duration: "",
          nextStep: "",
        };
    }
  };

  const pathSummary = getReviewPathSummary(classificationText);

  const handleMockView = (docName: string, fileName?: string) => {
    alert(`${t("requests:wizard.review.documents.view")}: ${fileName || docName}`);
  };

  const handleMockDownload = (docName: string, fileName?: string) => {
    alert(`${t("requests:wizard.review.documents.download")}: ${fileName || docName}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">
          {t("requests:wizard.review.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.review.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Side: Facility & Contact Summaries */}
        <div className="space-y-6">
          {/* Facility Summary */}
          <Card className="border-border bg-card shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("requests:wizard.review.facilityDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-1.5">
                <span className="text-muted-foreground block">{t("requests:wizard.review.facilityName")}</span>
                <span className="font-semibold text-foreground text-sm">{values.facilityName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div>
                  <span className="text-muted-foreground block">{t("requests:wizard.review.crNumber")}</span>
                  <span className="font-semibold text-foreground">{values.crNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("requests:wizard.review.totalArea")}</span>
                  <span className="font-semibold text-foreground">{values.area} m²</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <span className="text-muted-foreground block">{t("requests:wizard.review.address")}</span>
                <span className="font-semibold text-foreground">
                  {values.city}, {values.district} - {values.addressDescription}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <ServiceDetailsCard values={values} titleClassName="text-xs font-bold uppercase tracking-wider text-muted-foreground" />

          {/* Contact Summary */}
          <Card className="border-border bg-card shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("requests:wizard.review.contactRepresentative")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block">{t("requests:wizard.review.contactName")}</span>
                  <span className="font-semibold text-foreground">{values.contactName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("requests:wizard.review.contactPhone")}</span>
                  <span className="font-semibold text-foreground">{values.contactPhone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Path Summary & Documents */}
        <div className="space-y-6">
          {/* Review Path Summary */}
          <Card className="border-border bg-card shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-3 bg-secondary/5 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("requests:wizard.review.pathSummary.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("requests:wizard.review.pathSummary.path")}</span>
                <span className="font-bold text-foreground text-sm">{pathSummary.path}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-border/50">
                <span className="text-muted-foreground">{t("requests:wizard.review.pathSummary.duration")}</span>
                <Badge variant="secondary" className="font-semibold text-foreground">
                  {pathSummary.duration}
                </Badge>
              </div>
              <div className="flex flex-col items-start gap-1 pt-2.5 border-t border-border/50 text-left rtl:text-right">
                <span className="text-muted-foreground font-semibold">{t("requests:wizard.review.pathSummary.nextStep")}</span>
                <span className="text-muted-foreground leading-relaxed text-[11px] font-normal">
                  {pathSummary.nextStep}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Documents checklist */}
          <Card className="border-border bg-card shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("requests:wizard.review.documentsChecklist")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground flex items-center gap-1.5 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </span>
                    {doc.uploaded ? (
                      <Badge variant="success" className="text-[10px] h-5 px-1.5 shrink-0">
                        {t("requests:wizard.review.uploaded")}
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px] h-5 px-1.5 shrink-0">
                        {t("requests:wizard.review.documents.missing")}
                      </Badge>
                    )}
                  </div>
                  
                  {doc.uploaded && doc.fileName && (
                    <div 
                      className="text-[10px] font-mono text-muted-foreground bg-background py-1 px-2 rounded border border-border/40 truncate max-w-[220px] block overflow-hidden cursor-help"
                      title={doc.fileName}
                    >
                      {doc.fileName}
                    </div>
                  )}

                  {doc.uploaded ? (
                    <div className="flex items-center gap-2 mt-1 pt-1.5 border-t border-border/40 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] gap-1 px-2.5"
                        onClick={() => handleMockView(doc.name, doc.fileName)}
                      >
                        <Eye className="h-3 w-3" />
                        {t("requests:wizard.review.documents.view")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] gap-1 px-2.5"
                        onClick={() => handleMockDownload(doc.name, doc.fileName)}
                      >
                        <Download className="h-3 w-3" />
                        {t("requests:wizard.review.documents.download")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{t("requests:wizard.review.pendingUpload")}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pre-submit Notice & Terms & Submit button */}
      <div className="space-y-4 pt-5 border-t border-border mt-6">
        {/* Pre-submit notice banner */}
        <div className="p-3.5 rounded-xl border border-blue-500/10 bg-blue-500/[0.02] dark:bg-blue-950/[0.04] text-[11px] text-muted-foreground leading-relaxed flex flex-col gap-1.5 text-left rtl:text-right">
          <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
            <span>{t("requests:wizard.review.submitNoticeHeading")}</span>
          </div>
          <div className="pl-5.5 rtl:pr-5.5">
            {t("requests:wizard.review.submitNotice")}
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none py-1.5 text-left rtl:text-right">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500 mt-0.5"
          />
          <span className="text-[11px] text-muted-foreground leading-relaxed block">
            {t("requests:wizard.review.termsText.part1")}
            <br />
            {t("requests:wizard.review.termsText.part2")}
          </span>
        </label>

        <div className="flex flex-wrap gap-3 justify-between pt-2">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onPrev}>
              {t("requests:wizard.buttons.previous")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20"
              onClick={() => {
                onSaveDraft();
                alert(t("requests:wizard.review.saveDraftSuccess"));
              }}
            >
              {t("requests:wizard.buttons.saveDraft")}
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!termsAccepted || isSubmitting}
            isLoading={isSubmitting}
            onClick={onSubmit}
            className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/10 px-5"
          >
            {t("requests:wizard.review.submitButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
export default ReviewSubmitStep;
