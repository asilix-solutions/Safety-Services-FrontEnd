"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { LicensingRequest, RequestType, WorkflowStage } from "@/domains/requests/types";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { MapPin, ShieldAlert, ArrowLeft, Clock, Eye, Download, RefreshCw, Send, CreditCard, Activity } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import {
  WORKFLOW_STAGES,
  getQueueDisplayName,
  getClassificationDisplayName,
  getClassificationReason,
  getCanonicalRequestTypeDisplayName,
  getReviewPathDisplayName,
  getRequestStatusDisplayName,
  getWorkflowStageDisplayName
} from "@/domains/requests/workflow";

// Import new storage domains
import { ClientInvoice } from "@/domains/invoices/types";
import { getInvoices, createOrUpdateInvoice } from "@/domains/invoices/storage";
import { ClientPayment } from "@/domains/payments/types";
import { getMergedRequests, upsertRequest } from "@/domains/requests/storage";
import { Quotation } from "@/domains/quotations/types";
import { confirmMockPaymentAndInitializeProject } from "@/domains/payments/workflow";
import { Project } from "@/types/project";
import { getProjects } from "@/domains/projects/storage";
import { USER_ROLES } from "@/constants/roles";
import { getProjectExecutionPhaseLabel } from "@/domains/projects/workflow";

export default function RequestDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const { t } = useTranslation();
  useNamespaceTranslations(["requests", "dashboard", "common", "projects"]);
  const [request, setRequest] = useState<LicensingRequest | null>(null);
  const [invoice, setInvoice] = useState<ClientInvoice | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [linkedProject, setLinkedProject] = useState<Project | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const jobNumber = params?.jobNumber as string;

  const loadData = () => {
    if (jobNumber) {
      const merged = getMergedRequests();
      
      const found = merged.find((r) => r.jobNumber === jobNumber);
      if (found) {
        setRequest(found);
      }

      // Load invoice if exists
      const invoices = getInvoices();
      const foundInvoice = invoices.find((i) => i.jobNumber === jobNumber);
      if (foundInvoice) {
        setInvoice(foundInvoice);
      } else {
        setInvoice(null);
      }

      // Load linked project if exists
      const projects = getProjects();
      const foundProject = projects.find((p) => p.jobNumber === jobNumber);
      if (foundProject) {
        setLinkedProject(foundProject);
      } else {
        setLinkedProject(null);
      }

      // Load quotation if exists
      try {
        const quotesStr = localStorage.getItem("SSLM_QUOTATIONS");
        const quotes: Quotation[] = quotesStr ? JSON.parse(quotesStr) : [];
        const foundQuote = quotes.find((q) => q.jobNumber === jobNumber);
        if (foundQuote) {
          setQuotation(foundQuote);
        } else {
          setQuotation(null);
        }
      } catch (e) {
        console.error("Failed to read quotations", e);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [jobNumber]);

  const handleRegenerateInvoice = () => {
    if (!quotation || quotation.quotationStatus !== "APPROVED") return;

    try {
      const invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const newInvoice: ClientInvoice = {
        id: invoiceId,
        tenantId: request?.tenantId || "default-tenant",
        jobNumber: jobNumber,
        quotationJobNumber: jobNumber,
        subtotal: quotation.subtotal || 0,
        vatAmount: quotation.vat || 0,
        grandTotal: quotation.grandTotal || 0,
        currency: "SAR",
        status: "unpaid",
        dueDate: dueDate.toISOString(),
        issuedAt: new Date().toISOString(),
      };

      createOrUpdateInvoice(newInvoice);
      alert(t("requests:details.alertInvoiceRegenerated"));
      loadData();
    } catch (err) {
      console.error("Failed to regenerate invoice", err);
    }
  };

  if (!user) return null;

  if (!request) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <p>{t("requests:engineeringWorkspace.requestNotFound").replace("{{jobNumber}}", jobNumber)}</p>
        <Link href="/requests">
          <Button variant="outline" size="sm">{t("requests:engineeringWorkspace.backToRequests")}</Button>
        </Link>
      </div>
    );
  }

  const getRequestTypeLabel = (type: RequestType) => {
    return getCanonicalRequestTypeDisplayName(request, t);
  };

  const getTimelineEventComment = (event: { status: string; comment: string }) => {
    const c = event.comment || "";
    const lower = c.toLowerCase();

    if (lower === "request initialized." || lower === "request draft initialized." || lower === "request draft initialized by client.") {
      return t("requests:timeline.comments.draft");
    }
    if (lower === "request submitted." || lower === "request successfully submitted.") {
      return t("requests:timeline.comments.submitted");
    }
    if (lower === "inspecting engineer assigned for blueprint audit.") {
      return t("requests:timeline.comments.insulationEngineer");
    }
    if (c.startsWith("Payment Confirmed. Ref: ")) {
      const ref = c.substring("Payment Confirmed. Ref: ".length);
      return t("requests:timeline.comments.paymentConfirmedRef").replace("{{ref}}", ref);
    }
    if (lower === "payment confirmed. safety compliance project has been initialized.") {
      return t("requests:timeline.comments.paymentConfirmed");
    }
    if (c.startsWith("Project Execution Started. Project Ref: ")) {
      const ref = c.substring("Project Execution Started. Project Ref: ".length);
      return t("requests:timeline.comments.executionStartedRef").replace("{{ref}}", ref);
    }
    if (lower === "project execution started. field team assigned.") {
      return t("requests:timeline.comments.executionStarted");
    }
    if (c.startsWith("Project execution completed. Ready for final inspection. Notes: ")) {
      const notes = c.substring("Project execution completed. Ready for final inspection. Notes: ".length);
      return t("requests:timeline.comments.executionCompletedNotes").replace("{{notes}}", notes);
    }
    if (lower === "project execution completed. awaiting final inspection.") {
      return t("requests:timeline.comments.executionCompleted");
    }

    return c;
  };

  const getNextStepInstructions = (req: LicensingRequest) => {
    const stage = req.currentStage;
    const queueNorm = (req.assignedQueue || "").toUpperCase();
    const classNorm = (req.classification || "").toUpperCase().replace(/_/, "");
    const isMaintenance = queueNorm === "MAINTENANCE" || classNorm === "MAINTENANCESTRATEGY" || classNorm === "MAINTENANCE";
    const isFastTrack = queueNorm === "FAST_TRACK" || classNorm === "FASTTRACK" || classNorm === "FAST";
    const isHighHazard = queueNorm === "HIGH_HAZARD" || classNorm === "HIGHHAZARDREVIEW" || classNorm === "HIGHHAZARD" || classNorm === "HAZARD";

    switch (stage) {
      case "DRAFT":
        return t("requests:nextStep.DRAFT");
      case "SUBMITTED":
        if (isMaintenance) {
          return t("requests:nextStep.SUBMITTED.MAINTENANCE");
        }
        if (isFastTrack) {
          return t("requests:nextStep.SUBMITTED.FAST_TRACK");
        }
        if (isHighHazard) {
          return t("requests:nextStep.SUBMITTED.HIGH_HAZARD");
        }
        return t("requests:nextStep.SUBMITTED.ENGINEERING");
      case "UNDER_REVIEW":
        if (isMaintenance) {
          return t("requests:nextStep.UNDER_REVIEW.MAINTENANCE");
        }
        if (isFastTrack) {
          return t("requests:nextStep.UNDER_REVIEW.FAST_TRACK");
        }
        if (isHighHazard) {
          return t("requests:nextStep.UNDER_REVIEW.HIGH_HAZARD");
        }
        return t("requests:nextStep.UNDER_REVIEW.ENGINEERING");
      case "QUOTATION":
        return t("requests:nextStep.QUOTATION");
      case "QUOTATION_APPROVAL":
        return t("requests:nextStep.QUOTATION_APPROVAL");
      case "PAYMENT_CONFIRMED":
        return t("requests:nextStep.PAYMENT_CONFIRMED");
      case "PROJECT_CREATED":
        return t("requests:nextStep.PROJECT_CREATED");
      case "FIELD_EXECUTION":
        return t("requests:nextStep.FIELD_EXECUTION");
      case "FINAL_INSPECTION":
        return t("requests:nextStep.FINAL_INSPECTION");
      case "COMPLETED":
        return t("requests:nextStep.COMPLETED");
      default:
        return t("common:inProgress");
    }
  };

  const isReplaceAllowed = (stage: WorkflowStage) => {
    if (stage === "DRAFT") return "ALLOWED";
    if (stage === "SUBMITTED") return "CONFIRM_REQUIRED";
    return "READ_ONLY";
  };

  const handleReplaceFile = (docIndex: number) => {
    const rule = isReplaceAllowed(request.currentStage);
    if (rule === "READ_ONLY") {
      alert(t("requests:details.alertFileLocked"));
      return;
    }
    if (rule === "CONFIRM_REQUIRED") {
      const ok = window.confirm(t("requests:details.confirmFileReplace"));
      if (!ok) return;
    }
    
    const newFileName = prompt(t("requests:details.promptReplaceFileName"), request.documents[docIndex].fileName || "document.pdf");
    if (newFileName) {
      const updatedDocs = [...request.documents];
      updatedDocs[docIndex] = { ...updatedDocs[docIndex], uploaded: true, fileName: newFileName };
      const updatedRequest = { ...request, documents: updatedDocs };
      setRequest(updatedRequest);
      
      // Update using centralized upsert
      try {
        upsertRequest(updatedRequest);
      } catch(e) {
        console.error("Failed to sync file replacement to localStorage", e);
      }
      alert(t("requests:details.alertFileReplaced"));
    }
  };

  const handleApproveForQuotation = () => {
    const updatedRequest: LicensingRequest = { 
      ...request, 
      currentStage: "QUOTATION" as WorkflowStage,
      updatedAt: new Date().toISOString()
    };
    setRequest(updatedRequest);
    
    try {
      upsertRequest(updatedRequest);
      alert(t("requests:details.alertTransitionQuotation"));
    } catch (e) {
      console.error("Failed to transition request to Quotation", e);
    }
  };

  const handleConfirmMockPayment = () => {
    if (!invoice || invoice.status === "paid" || isProcessing) return;
    if (!request) return;

    setIsProcessing(true);

    try {
      const { updatedRequest, updatedInvoice } = confirmMockPaymentAndInitializeProject({ request, invoice });
      setInvoice(updatedInvoice);
      setRequest(updatedRequest);

      alert(t("requests:details.alertPaymentConfirmed"));
      loadData();
    } catch (err) {
      console.error("Failed to complete mock payment", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentStageIndex = WORKFLOW_STAGES.indexOf(request.currentStage);

  const isConsultingEngineer = user?.role === USER_ROLES.CONSULTING_ENGINEER;
  const isClient = user?.role === USER_ROLES.CLIENT;
  const queueNorm = (request.assignedQueue || "").toUpperCase();
  const classNorm = (request.classification || "").toUpperCase().replace(/_/, "");
  const isFastOrMaintenance = queueNorm === "FAST_TRACK" || queueNorm === "MAINTENANCE" || classNorm.includes("FAST") || classNorm.includes("MAINTENANCE");
  const isPreQuotationStage = request.currentStage === "SUBMITTED" || request.currentStage === "UNDER_REVIEW";
  const showApproveForQuotationAction = isConsultingEngineer && isFastOrMaintenance && isPreQuotationStage;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/requests">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <PageHeader
          title={`${t("dashboard:request_details_title")}: ${request.jobNumber}`}
          description={t("dashboard:track_progress_desc")}
        />
      </div>

      {/* Next Action Card */}
      <Card className="border-indigo-500/20 bg-indigo-500/5 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">{t("requests:details.nextStepTitle")}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getNextStepInstructions(request)}
              </p>
            </div>
          </div>
          {showApproveForQuotationAction && (
            <Button
              size="sm"
              onClick={handleApproveForQuotation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-sm gap-1.5 text-xs h-9"
            >
              <Send className="h-3.5 w-3.5" />
              {t("requests:engineeringWorkspace.decisionApprove") || "Approve for Quotation"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* MVP Payment and Billing Card - Clients Only */}
      {isClient && request.currentStage === "PAYMENT_CONFIRMED" && (
        <Card className="border-indigo-600 bg-indigo-500/5 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <CreditCard className="h-5 w-5" />
              <CardTitle className="text-base font-bold">{t("requests:details.billingTitle")}</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {t("requests:details.billingDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!invoice ? (
              <div className="p-3 border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-400 rounded-lg text-xs space-y-2">
                <p>
                  <strong>{t("common:warning") || "Warning"}:</strong> {t("requests:details.invoiceMissing")}
                </p>
                {quotation && quotation.quotationStatus === "APPROVED" && (
                  <div className="pt-1 flex justify-start">
                    <Button
                      size="sm"
                      onClick={handleRegenerateInvoice}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] h-7 px-3"
                    >
                      {t("requests:details.regenerateInvoice")}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                <div className="py-2 grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">{t("requests:details.invoiceRef")}:</span>
                  <span className="col-span-2 font-mono font-semibold text-foreground">{invoice.id}</span>
                </div>
                <div className="py-2 grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">{t("requests:details.amount")}:</span>
                  <span className="col-span-2 font-semibold text-foreground">{invoice.subtotal.toFixed(2)} {invoice.currency}</span>
                </div>
                <div className="py-2 grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">{t("requests:details.vat")}:</span>
                  <span className="col-span-2 font-semibold text-foreground">{invoice.vatAmount.toFixed(2)} {invoice.currency}</span>
                </div>
                <div className="py-2 grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">{t("requests:details.grandTotalLabel")}:</span>
                  <span className="col-span-2 font-bold text-foreground text-sm">{invoice.grandTotal.toFixed(2)} {invoice.currency}</span>
                </div>
                <div className="py-2 grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">{t("requests:details.paymentStatus")}:</span>
                  <span className="col-span-2">
                    <Badge variant={invoice.status === "paid" ? "success" : "warning"} className="text-[10px]">
                      {invoice.status === "paid" ? (t("common:status_Completed") || "Paid") : t("requests:details.awaitingPayment")}
                    </Badge>
                  </span>
                </div>
                
                {invoice.status !== "paid" && (
                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={handleConfirmMockPayment}
                      disabled={isProcessing}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2"
                    >
                      {isProcessing ? t("requests:details.processingPayment") : t("requests:details.confirmPaymentBtn")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Detail Specifications */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">{t("dashboard:facility_location_metadata")}</CardTitle>
                <CardDescription className="text-muted-foreground">{t("dashboard:verified_municipal_desc")}</CardDescription>
              </div>
              <Badge variant="warning" className="capitalize">
                {getRequestStatusDisplayName(request.status, t)}
              </Badge>
            </CardHeader>
            <CardContent className="divide-y divide-border text-xs space-y-1">
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:facility_name")}</span>
                <span className="col-span-2 font-semibold text-foreground">{request.facilityName}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:commercial_cr")}</span>
                <span className="col-span-2 font-mono font-semibold text-foreground">{request.crNumber}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:safety_activity_isic")}</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {request.activityName} ({request.isicCode})
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:facility_area")}</span>
                <span className="col-span-2 font-semibold text-foreground">{request.area} m²</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("requests:details.reviewPathLabel") || "Review Path"}</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {getReviewPathDisplayName(request, t)}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("requests:details.classificationReason") || "Classification Reason"}</span>
                <span className="col-span-2 font-semibold text-foreground leading-relaxed">
                  {getClassificationReason(request, t)}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("requests:details.assignedDepartment") || "Assigned Department"}</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {getQueueDisplayName(request.assignedQueue, t)}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:location_address")}</span>
                <span className="col-span-2 font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {request.city}, {request.district} - {request.addressDescription}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:contact_representative")}</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {request.contactName} ({request.contactPhone})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents checklist */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">{t("dashboard:uploaded_compliance_files")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("dashboard:submitted_certificates_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {request.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border bg-secondary/15 rounded-lg">
                  <div>
                    <span className="font-semibold block text-foreground">{doc.name}</span>
                    <span className="text-[10px] text-muted-foreground">{t("common:fileFormats")}: {doc.type.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.uploaded ? (
                      <div className="text-end mr-2">
                        <span className="text-emerald-500 font-bold block text-[10px]">✓ {t("dashboard:uploaded_label")}</span>
                        <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[120px] block">
                          {doc.fileName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-500 font-medium mr-2">{t("dashboard:pending_document")}</span>
                    )}

                    <div className="flex gap-1 shrink-0">
                      {doc.uploaded && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => alert(t("requests:details.simulatedView").replace("{{fileName}}", doc.fileName || ""))}
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => alert(t("requests:details.simulatedDownload").replace("{{fileName}}", doc.fileName || ""))}
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isReplaceAllowed(request.currentStage) === "READ_ONLY"}
                        onClick={() => handleReplaceFile(idx)}
                        title="Replace"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right side tracking timeline */}
        <div className="space-y-4">
          {/* Linked Project Execution Snapshot */}
          {linkedProject && (
            <Card className="border-indigo-500/25 bg-indigo-500/5 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  {t("projects:details.linkedProject") || "Linked Project Execution"}
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">
                  {t("projects:details.opsDesc") || "Active field operations tracker"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground block uppercase">{t("projects:details.id") || "Project ID"}</span>
                  <span className="font-mono font-bold text-foreground">{linkedProject.id}</span>
                </div>
                
                {isClient ? (
                  <div className="space-y-1">
                    <span className="text-[9px] text-muted-foreground block uppercase">{t("projects:status") || "Status"}</span>
                    <span className="font-semibold text-foreground capitalize">{t(`projects:status.${linkedProject.status}`) || linkedProject.status}</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase">{t("projects:phases.title") || "Execution Phase"}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                        {getProjectExecutionPhaseLabel(linkedProject.executionPhase, t) || t("projects:phases.created")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase">{t("projects:details.type") || "Workspace Profile"}</span>
                      <span className="font-semibold text-foreground capitalize">
                        {(() => {
                          const { getProjectTemplateMetadata } = require("@/domains/projects/storage");
                          return getProjectTemplateMetadata(linkedProject.workspaceTemplate || "installation_full", t).projectProgramLabel;
                        })()}
                      </span>
                    </div>
                  </>
                )}

                <div className="pt-2 border-t border-border">
                  <Link href={`/projects/${linkedProject.id}`}>
                    <Button size="sm" className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-8">
                      {isClient ? t("requests:details.viewProject") : t("requests:details.openWorkspace")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Workflow Stepper Timeline */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">{t("requests:details.stageTimelineTitle")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("requests:details.stageTimelineDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {WORKFLOW_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isActive = idx === currentStageIndex;
                  
                  return (
                    <div key={stage} className="flex items-center gap-3 text-xs">
                      <div className="shrink-0">
                        {isCompleted ? (
                          <div className="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                            ✓
                          </div>
                        ) : isActive ? (
                          <div className="h-5 w-5 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] animate-pulse">
                            ●
                          </div>
                        ) : (
                          <div className="h-5 w-5 bg-secondary border border-border text-muted-foreground rounded-full flex items-center justify-center font-bold text-[10px]">
                            ○
                          </div>
                        )}
                      </div>
                      <span className={`font-semibold ${isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                        {getWorkflowStageDisplayName(stage, t)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity History Timeline */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">{t("dashboard:workflow_tracking")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("dashboard:safety_evaluation_timeline_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative border-s border-border ps-4 ms-2 space-y-6">
                {request.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-background" />
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground capitalize">
                          {event.status === "ready_for_final_inspection"
                            ? (t("requests:timeline.readyForFinalInspection") || "Final Inspection Ready")
                            : getRequestStatusDisplayName(event.status, t)
                          }
                        </span>
                        <span className="text-[10px] text-muted-foreground">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{getTimelineEventComment(event)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* V2 Expand message */}
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 text-xs flex gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">{t("dashboard:mvp_placeholder_node")}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                {t("dashboard:mvp_placeholder_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
