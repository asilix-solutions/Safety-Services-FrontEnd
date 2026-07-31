import React from "react";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ServiceDetailsCard } from "@/features/requests/components/service-details-card";
import { ArrowLeft, AlertTriangle, Check, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useBlueprintWorkspace } from "../hooks/use-blueprint-workspace";
import { RequestSummaryCard } from "./request-summary-card";
import { ClassificationMatrixCard } from "./classification-matrix-card";
import { BlueprintFilesCard } from "./blueprint-files-card";
import { EngineeringNotesCard } from "./engineering-notes-card";
import { ReviewDecisionActions } from "./review-decision-actions";
import { BlueprintViewer } from "./blueprint-viewer";
import { WorkflowTimeline } from "./workflow-timeline";
import { ActivityTimeline } from "./activity-timeline";
import { getQueueDisplayName, getWorkflowStageDisplayName } from "@/domains/requests/workflow";

interface BlueprintWorkspaceProps {
  jobNumber: string;
}

export function BlueprintWorkspace({ jobNumber }: BlueprintWorkspaceProps) {
  const { t } = useTranslation();
  useNamespaceTranslations(["requests", "common", "dashboard"]);

  const {
    viewModel,
    engineerNotes,
    setEngineerNotes,
    correctionReason,
    setCorrectionReason,
    missingDocumentsNote,
    setMissingDocumentsNote,
    showReturnDialog,
    setShowReturnDialog,
    showMissingDocsDialog,
    setShowMissingDocsDialog,
    successMessage,
    validationError,
    isReadonly,
    handleApprove,
    handleReturnForModification,
    handleRequestMissingDocs,
  } = useBlueprintWorkspace(jobNumber);

  if (!viewModel) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <p>{t("requests:engineeringWorkspace.requestNotFound").replace("{{jobNumber}}", jobNumber)}</p>
        <Link href="/blueprint-review">
          <Button variant="outline" size="sm">
            {t("requests:blueprintReview.workspace.backToQueue")}
          </Button>
        </Link>
      </div>
    );
  }

  const isHighHazard =
    viewModel.assignedQueue === "HIGH_HAZARD" ||
    viewModel.classification === "high_hazard_review" ||
    viewModel.gasExtensions ||
    viewModel.hazardousMaterials ||
    viewModel.riskCategory === "high";

  // Google Maps URL derivation
  const mapsUrl = viewModel.gpsCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(viewModel.gpsCoordinates)}`
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-4 pb-12">
      {/* ==========================================
          HEADER & CONTEXT AREA
          ========================================== */}
      <div className="flex items-center gap-3">
        <Link href="/blueprint-review">
          <Button variant="ghost" size="icon" className="h-8 w-8 border border-border bg-card">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180 text-foreground" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground font-sans">
              {viewModel.jobNumber}
            </span>
            <Badge variant="outline" className="font-semibold text-[10px]">
              {getWorkflowStageDisplayName(viewModel.currentStage, t)}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground block mt-0.5">
            {viewModel.facilityName}
          </span>
        </div>
      </div>

      {/* Workflow Stage Progress Line */}
      <WorkflowTimeline currentStage={viewModel.currentStage} />

      {/* Quick Summary Badges */}
      <div className="flex flex-wrap gap-2 pt-1 font-sans">
        {isHighHazard && (
          <Badge variant="destructive" className="font-bold text-[10px] px-2.5 py-0.5">
            {t("requests:blueprintReview.queue.highHazard")}
          </Badge>
        )}
        <Badge variant="default" className="font-semibold text-[10px] px-2.5 py-0.5">
          {getQueueDisplayName(viewModel.assignedQueue, t)}
        </Badge>
        <Badge variant="secondary" className="font-semibold text-[10px] px-2.5 py-0.5">
          {t("requests:blueprintReview.workspace.area")}: {viewModel.area} m²
        </Badge>
        <Badge variant="outline" className="font-semibold text-[10px] px-2.5 py-0.5 text-foreground bg-background">
          {viewModel.activityName}
        </Badge>
        {viewModel.reviewStatus && (
          <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-bold text-[10px] px-2.5 py-0.5">
            {t(`requests:blueprintReview.status.${viewModel.reviewStatus}`)}
          </Badge>
        )}
      </div>

      {/* Warning/Gatekeeper banner if read-only */}
      {isReadonly && (
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                {t("requests:blueprintReview.workspace.isReadonly")}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("requests:blueprintReview.workspace.readonlyWarning")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <Check className="h-4 w-4 shrink-0" />
          <span>
            {t("requests:engineeringWorkspace.successTransition")} ({t(`requests:blueprintReview.status.${successMessage}`)})
          </span>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ==========================================
          STEP 1: REQUEST CONTEXT
          ========================================== */}
      <RequestSummaryCard request={viewModel} />

      {/* ==========================================
          STEP 2: TECHNICAL DOCUMENTS (INSPECT)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BlueprintViewer request={viewModel} />
        </div>
        <div>
          <BlueprintFilesCard request={viewModel} />
        </div>
      </div>

      {/* ==========================================
          STEP 3: ENGINEERING EVALUATION (EVALUATE & DOCUMENT)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClassificationMatrixCard request={viewModel} />
        </div>
        <div>
          <EngineeringNotesCard
            value={engineerNotes}
            onChange={setEngineerNotes}
            disabled={isReadonly}
          />
        </div>
      </div>

      {/* ==========================================
          STEP 4: ENGINEERING DECISION (DECIDE)
          ========================================== */}
      <div className="flex justify-end">
        <ReviewDecisionActions
          onApprove={handleApprove}
          onReturn={() => setShowReturnDialog(true)}
          onRequestMissingDocs={() => setShowMissingDocsDialog(true)}
          disabled={isReadonly || viewModel.currentStage === "QUOTATION"}

          showReturnDialog={showReturnDialog}
          setShowReturnDialog={setShowReturnDialog}
          correctionReason={correctionReason}
          setCorrectionReason={setCorrectionReason}
          onSubmitReturn={handleReturnForModification}

          showMissingDocsDialog={showMissingDocsDialog}
          setShowMissingDocsDialog={setShowMissingDocsDialog}
          missingDocumentsNote={missingDocumentsNote}
          setMissingDocumentsNote={setMissingDocumentsNote}
          onSubmitMissingDocs={handleRequestMissingDocs}
        />
      </div>

      {/* ==========================================
          STEPS 5 & 6: AUDIT TRAIL & SUPPORTING REFERENCE
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-border pt-6">
        {/* Activity timeline history */}
        <div className="lg:col-span-2">
          <ActivityTimeline request={viewModel} />
        </div>

        {/* Location reference details */}
        <div className="space-y-6">
          <Card className="border-border bg-card h-full flex flex-col justify-between shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">
                {t("requests:blueprintReview.workspace.location")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px]">
                    {t("requests:blueprintReview.workspace.gps")}
                  </span>
                  <span className="font-semibold text-foreground flex items-center gap-1 font-mono text-[11px]">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {viewModel.gpsCoordinates || "N/A"}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px]">
                    {t("requests:blueprintReview.workspace.locationDesc")}
                  </span>
                  <span className="font-semibold text-foreground block text-[11px]">
                    {viewModel.city}, {viewModel.district} - {viewModel.addressDescription}
                  </span>
                </div>
              </div>

              {/* Compact Map Simulation Visual */}
              <div className="relative h-24 rounded-lg bg-secondary/20 flex flex-col items-center justify-center text-muted-foreground border border-border">
                <MapPin className="h-5 w-5 text-primary/50 mb-0.5 animate-pulse" />
                <span className="text-[10px] font-semibold text-foreground">
                  {t("requests:blueprintReview.workspace.mapSim")}
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">
                  {viewModel.gpsCoordinates || "24.7136, 46.6753"}
                </span>
              </div>

              {/* Google Maps External Action */}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 border-border bg-background text-foreground h-8">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("requests:blueprintReview.workspace.openMaps")}
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 7: Collapsible details */}
      <div className="border-t border-border pt-6">
        <ServiceDetailsCard values={viewModel} titleClassName="text-sm font-bold text-foreground" />
      </div>
    </div>
  );
}
