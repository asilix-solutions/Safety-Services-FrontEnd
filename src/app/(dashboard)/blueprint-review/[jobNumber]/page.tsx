"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_REQUESTS } from "@/mock/requests";
import { LicensingRequest, RequestType, WorkflowStage, RequestQueue } from "@/domains/requests/types";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Textarea } from "@/shared/ui/textarea";
import { EmptyState } from "@/shared/components/empty-state";
import { MapPin, ShieldAlert, ArrowLeft, FileText, CheckCircle2, AlertTriangle, Play, Check, CornerUpLeft, DollarSign } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/providers/i18n-provider";
import {
  getQueueDisplayName,
  getClassificationDisplayName,
  getClassificationReason,
  mapStatusToStage,
  canTransition,
  getCanonicalRequestTypeDisplayName,
  getWorkflowStageDisplayName,
  getReviewPathDisplayName
} from "@/domains/requests/workflow";

export default function EngineeringWorkspacePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  
  const [request, setRequest] = useState<LicensingRequest | null>(null);
  const [engineerNotes, setEngineerNotes] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const jobNumber = params?.jobNumber as string;

  useEffect(() => {
    if (jobNumber) {
      let localList: LicensingRequest[] = [];
      try {
        const local = localStorage.getItem("SSLM_CLIENT_REQUESTS");
        if (local) {
          localList = JSON.parse(local);
        }
      } catch (err) {
        console.error("Failed to read requests", err);
      }

      const merged = [...localList, ...MOCK_REQUESTS].map((r) => ({
        ...r,
        currentStage: r.currentStage || mapStatusToStage(r.status),
        assignedQueue: r.assignedQueue || (r.classification === "high_hazard_review" ? "HIGH_HAZARD" : r.classification === "engineering_project" ? "ENGINEERING" : r.classification === "maintenance_strategy" ? "MAINTENANCE" : "FAST_TRACK")
      }));

      const found = merged.find((r) => r.jobNumber === jobNumber);
      if (found) {
        setRequest(found);
      }
    }
  }, [jobNumber]);

  if (!user) return null;

  if (!request) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <p>Request with reference {jobNumber} not found.</p>
        <Link href="/requests">
          <Button variant="outline" size="sm">Back to Requests</Button>
        </Link>
      </div>
    );
  }

  const getRequestTypeLabel = (type: RequestType) => {
    return getCanonicalRequestTypeDisplayName({ requestType: type }, t);
  };

  // Determine if queue is engineering
  const isEngineeringQueue = request.assignedQueue === "ENGINEERING" || request.assignedQueue === "HIGH_HAZARD";

  // Check if decision is allowed based on stage
  // Decisions allowed in DRAFT, SUBMITTED, UNDER_REVIEW
  const isDecisionAllowed = isEngineeringQueue && (
    request.currentStage === "DRAFT" || 
    request.currentStage === "SUBMITTED" || 
    request.currentStage === "UNDER_REVIEW"
  );

  const handleApproveForQuotation = () => {
    if (!isDecisionAllowed) return;

    // Transition state locally
    const updatedRequest = { ...request, currentStage: "QUOTATION" as WorkflowStage };
    setRequest(updatedRequest);
    
    // Save state in localStorage
    try {
      const local = localStorage.getItem("SSLM_CLIENT_REQUESTS");
      const list: LicensingRequest[] = local ? JSON.parse(local) : [];
      const idx = list.findIndex(r => r.jobNumber === request.jobNumber);

      if (idx !== -1) {
        list[idx] = updatedRequest;
      } else {
        list.unshift(updatedRequest);
      }

      localStorage.setItem("SSLM_CLIENT_REQUESTS", JSON.stringify(list));
    } catch(e) {
      console.error("Failed to persist quotation transition", e);
    }
    
    setSuccessMessage(t("requests:engineeringWorkspace.successTransition"));
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleReturnToClient = () => {
    if (!isDecisionAllowed) return;
    if (!returnReason.trim()) {
      alert(t("requests:engineeringWorkspace.enterReasonError"));
      return;
    }

    // Mock return to client behavior
    alert(`Mock Action: Request ${request.jobNumber} returned to client.\nReason: ${returnReason}`);
    setShowReturnDialog(false);
    setReturnReason("");
  };

  const handleCreateQuote = () => {
    alert(t("requests:engineeringWorkspace.quoteWorkflowNotice"));
  };

  // Look for any blueprint or permit file
  const blueprintDoc = request.documents.find(
    (d) => d.name.toLowerCase().includes("blueprint") || d.name.toLowerCase().includes("permit") || d.fileName?.toLowerCase().includes("permit") || d.fileName?.toLowerCase().includes("blueprint")
  );

  return (
    <div className="space-y-6">
      {/* Back navigation & Header */}
      <div className="flex items-center gap-2">
        <Link href="/requests">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <PageHeader
          title={t("requests:engineeringWorkspace.title")}
          description={t("requests:engineeringWorkspace.subtitle")}
        />
      </div>

      {/* Warning Card for non-engineering queue */}
      {!isEngineeringQueue && (
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                {t("requests:engineeringWorkspace.warningNotAssigned")}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This request is currently routed to the <strong>{getQueueDisplayName(request.assignedQueue, t)}</strong>. 
                You are viewing this request in read-only mode. Workspace decisions are disabled.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <Check className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: Summaries and attachments */}
        <div className="md:col-span-2 space-y-6">
          {/* Metadata Summary Card */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">{t("requests:quotations.details.requestSummary")}</CardTitle>
                <CardDescription className="text-muted-foreground">{getRequestTypeLabel(request.requestType)}</CardDescription>
              </div>
              <div className="flex gap-1.5 font-sans">
                <Badge variant={request.assignedQueue === "HIGH_HAZARD" ? "destructive" : "secondary"}>
                  {getWorkflowStageDisplayName(request.currentStage, t)}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {getReviewPathDisplayName(request, t)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3"> 
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block">{t("requests:quotations.builder.fieldClientName")}</span>
                  <span className="font-semibold text-foreground">{request.clientName}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block">{t("requests:quotations.builder.fieldFacilityName")}</span>
                  <span className="font-semibold text-foreground">{request.facilityName}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block">{t("dashboard:safety_activity_isic")}</span>
                  <span className="font-semibold text-foreground">{request.activityName} ({request.isicCode})</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block">{t("requests:list.fields.area")}</span>
                  <span className="font-semibold text-foreground">{request.area} {t("requests:wizard.areaUnit")}</span>
                </div>
                <div className="space-y-1.5 col-span-2 border-t border-border pt-2.5">
                  <span className="text-muted-foreground block">{t("dashboard:location_address")}</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {request.city}, {request.district} - {request.addressDescription}
                  </span>
                </div>
                <div className="space-y-1.5 border-t border-border pt-2.5">
                  <span className="text-muted-foreground block">{t("dashboard:contact_representative")}</span>
                  <span className="font-semibold text-foreground">{request.contactName}</span>
                </div>
                <div className="space-y-1.5 border-t border-border pt-2.5">
                  <span className="text-muted-foreground block">{t("requests:wizard.facilityInfo.contactPhone")}</span>
                  <span className="font-semibold text-foreground">{request.contactPhone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classification Details */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">{t("requests:engineeringWorkspace.classificationRoutingMatrix")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block mb-1">{t("requests:engineeringWorkspace.workflowRoutingQueue")}</span>
                  <Badge variant={request.assignedQueue === "HIGH_HAZARD" ? "destructive" : "default"}>
                    {getQueueDisplayName(request.assignedQueue, t)}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">{t("requests:engineeringWorkspace.classificationPathway")}</span>
                  <span className="font-bold text-foreground capitalize">
                    {getClassificationDisplayName(request.classification, t)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground block mb-1">{t("requests:engineeringWorkspace.classificationLogicExplanation")}</span>
                <p className="text-xs text-foreground leading-relaxed bg-secondary/25 p-2.5 rounded-lg border border-border">
                  {getClassificationReason(request, t)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Checklist */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">{t("requests:engineeringWorkspace.complianceAttachments")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {request.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 border border-border bg-secondary/10 rounded-lg">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">{doc.name}</span>
                    <span className="text-[10px] text-muted-foreground">{t("common:fileFormats")}: {doc.type.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.uploaded ? (
                      <div className="text-end">
                        <span className="text-emerald-500 font-bold block text-[10px]">✓ {t("dashboard:uploaded_label")}</span>
                        <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[140px] block">
                          {doc.fileName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-500 font-medium">{t("requests:wizard.uploads.pending")}</span>
                    )}

                    <div className="flex gap-1">
                      {doc.uploaded && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-muted-foreground"
                            onClick={() => alert(`${t("requests:details.simulatedView").replace("{{fileName}}", doc.fileName || "")}`)}
                          >
                            {t("common:view")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-muted-foreground"
                            onClick={() => alert(`${t("requests:details.simulatedDownload").replace("{{fileName}}", doc.fileName || "")}`)}
                          >
                            {t("requests:engineeringWorkspace.download") || "Download"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Blueprint preview and decisions */}
        <div className="space-y-6">
          {/* Blueprint document preview panel */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">{t("requests:engineeringWorkspace.blueprintPreview")}</CardTitle>
            </CardHeader>
            <CardContent>
              {blueprintDoc && blueprintDoc.uploaded ? (
                <div className="p-4 border border-dashed border-indigo-500/30 rounded-xl bg-indigo-500/5 text-center space-y-3">
                  <div className="mx-auto h-10 w-10 bg-indigo-600/10 text-indigo-600 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-foreground block truncate">{blueprintDoc.fileName}</span>
                    <span className="text-[10px] text-muted-foreground block">{blueprintDoc.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => alert(`${t("requests:engineeringWorkspace.alertCADViewerLaunch").replace("{{fileName}}", blueprintDoc.fileName || "")}`)}
                  >
                    {t("requests:engineeringWorkspace.launchCAD")}
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title={t("requests:engineeringWorkspace.blueprintPreview")}
                  description={t("requests:engineeringWorkspace.noBlueprint")}
                />
              )}
            </CardContent>
          </Card>

          {/* Internal notes */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">{t("requests:engineeringWorkspace.reviewNotesTitle")}</CardTitle>
              <CardDescription>{t("requests:engineeringWorkspace.reviewNotesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={engineerNotes}
                onChange={(e) => setEngineerNotes(e.target.value)}
                placeholder={t("requests:engineeringWorkspace.notesPlaceholder")}
                className="h-32 bg-background"
              />
            </CardContent>
          </Card>

          {/* Decision actions panel */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">{t("requests:engineeringWorkspace.reviewActionsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                className="w-full h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                disabled={!isDecisionAllowed}
                onClick={handleApproveForQuotation}
              >
                <Check className="h-4 w-4" />
                {t("requests:engineeringWorkspace.decisionApprove")}
              </Button>

              <Button
                variant="outline"
                className="w-full h-9 text-xs gap-1.5 text-rose-500 border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-500"
                disabled={!isDecisionAllowed}
                onClick={() => setShowReturnDialog(true)}
              >
                <CornerUpLeft className="h-4 w-4" />
                {t("requests:engineeringWorkspace.decisionReturn")}
              </Button>

              <Button
                variant="outline"
                className="w-full h-9 text-xs gap-1.5 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/5 hover:text-indigo-600"
                onClick={handleCreateQuote}
              >
                <DollarSign className="h-4 w-4" />
                {t("requests:engineeringWorkspace.decisionCreateQuote")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Return to Client Reason Dialog */}
      {showReturnDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <Card className="max-w-md w-full border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold">{t("requests:engineeringWorkspace.decisionReturn")}</CardTitle>
              <CardDescription>{t("requests:engineeringWorkspace.returnDialogDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder={t("requests:engineeringWorkspace.returnReasonPlaceholder")}
                className="h-28 bg-background"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReturnDialog(false);
                    setReturnReason("");
                  }}
                >
                  {t("requests:engineeringWorkspace.cancel")}
                </Button>
                <Button
                  size="sm"
                  className="bg-rose-600 text-white hover:bg-rose-600/90"
                  onClick={handleReturnToClient}
                >
                  {t("requests:engineeringWorkspace.returnRequest")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
