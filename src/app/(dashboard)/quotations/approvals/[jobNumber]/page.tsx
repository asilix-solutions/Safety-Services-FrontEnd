"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_REQUESTS } from "@/mock/requests";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { getClassificationDisplayName, getQueueDisplayName, getCanonicalRequestTypeDisplayName, getReviewPathDisplayName, getCommercialServiceLabel, getWorkflowStageDisplayName } from "@/domains/requests/workflow";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Quotation } from "@/domains/quotations/types";
import { useRouter, useParams } from "next/navigation";

export default function QuotationApprovalDetailsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["requests", "dashboard", "common"]);

  const getQuotationItemDescription = (desc: string) => {
    const map: Record<string, string> = {
      "Initial Maintenance Audit": t("requests:quotations.presets.initial_audit"),
      "Preventive Maintenance Visit": t("requests:quotations.presets.preventive_visit"),
      "Fire Alarm Device Testing": t("requests:quotations.presets.device_testing"),
      "Pump / Valve Inspection": t("requests:quotations.presets.valve_inspection"),
      "Emergency Lighting Check": t("requests:quotations.presets.lighting_check"),
      "Annual Maintenance Contract": t("requests:quotations.presets.annual_contract"),
      "Corrective Repair Visit": t("requests:quotations.presets.repair_visit"),
      "Engineering Review": t("requests:quotations.presets.eng_review"),
      "Shop Drawing Review": t("requests:quotations.presets.drawing_review"),
      "Site Inspection Visit": t("requests:quotations.presets.site_visit"),
      "Alarm System Installation": t("requests:quotations.presets.alarm_install"),
      "Fire Suppression System": t("requests:quotations.presets.suppression_install"),
      "Ventilation / Smoke Control": t("requests:quotations.presets.ventilation_control"),
      "Technical Report": t("requests:quotations.presets.tech_report"),
      "Compliance Report": t("requests:quotations.presets.compliance_report"),
      "Fit-out Review": t("requests:quotations.presets.fitout_review"),
      "Document Audit": t("requests:quotations.presets.document_audit"),
    };
    return map[desc] || desc;
  };
  const router = useRouter();
  const params = useParams();
  const jobNumber = params?.jobNumber as string;

  const [request, setRequest] = useState<LicensingRequest | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REQUEST_CHANGES" | "REJECT" | null>(null);
  const [inputText, setInputText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!jobNumber) return;

    let localList: LicensingRequest[] = [];
    let localQuotes: Quotation[] = [];

    try {
      const localReqs = localStorage.getItem("SSLM_CLIENT_REQUESTS");
      if (localReqs) {
        localList = JSON.parse(localReqs);
      }
      const quotes = localStorage.getItem("SSLM_QUOTATIONS");
      if (quotes) {
        localQuotes = JSON.parse(quotes);
      }
    } catch (err) {
      console.error("Failed to read local data", err);
    }

    // Find request
    const foundReq = localList.find((r) => r.jobNumber === jobNumber) || 
                     MOCK_REQUESTS.find((r) => r.jobNumber === jobNumber);
    if (foundReq) {
      setRequest(foundReq);
    }

    // Find quotation
    const foundQuote = localQuotes.find((q) => q.jobNumber === jobNumber);
    if (foundQuote) {
      setQuotation(foundQuote);
    }
  }, [jobNumber]);

  if (!user || user.role !== "Company Admin") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("common:unauthorized") || "Access Denied"}</p>
      </div>
    );
  }

  if (!request || !quotation) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">
          {t("requests:quotations.builder.notFound", { jobNumber }) || "Quotation not found"}
        </p>
        <Link href="/quotations/approvals">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t("requests:quotations.details.back")}
          </Button>
        </Link>
      </div>
    );
  }

  const handleDecisionSubmit = () => {
    setErrorMsg("");
    if ((actionType === "REQUEST_CHANGES" || actionType === "REJECT") && !inputText.trim()) {
      setErrorMsg(t("common:requiredField") || "This field is required");
      return;
    }

    const timestamp = new Date().toISOString();
    const updaterName = user.name || user.role;

    // Load fresh storage arrays
    let localQuotes: Quotation[] = [];
    let localRequests: LicensingRequest[] = [];

    try {
      const quotesStr = localStorage.getItem("SSLM_QUOTATIONS");
      if (quotesStr) localQuotes = JSON.parse(quotesStr);

      const reqsStr = localStorage.getItem("SSLM_CLIENT_REQUESTS");
      if (reqsStr) localRequests = JSON.parse(reqsStr);
    } catch (err) {
      console.error(err);
    }

    // Update Quotation Record
    const qIndex = localQuotes.findIndex((q) => q.jobNumber === jobNumber);
    const updatedQuote = { ...quotation };

    if (actionType === "APPROVE") {
      updatedQuote.quotationStatus = "APPROVED";
      updatedQuote.approvedBy = updaterName;
      updatedQuote.approvedAt = timestamp;
      updatedQuote.updatedBy = updaterName;
      updatedQuote.updatedAt = timestamp;
    } else if (actionType === "REQUEST_CHANGES") {
      updatedQuote.quotationStatus = "CHANGES_REQUESTED";
      updatedQuote.reviewedBy = updaterName;
      updatedQuote.reviewedAt = timestamp;
      updatedQuote.reviewComments = inputText;
      updatedQuote.updatedBy = updaterName;
      updatedQuote.updatedAt = timestamp;
    } else if (actionType === "REJECT") {
      updatedQuote.quotationStatus = "REJECTED";
      updatedQuote.rejectedBy = updaterName;
      updatedQuote.rejectedAt = timestamp;
      updatedQuote.rejectionReason = inputText;
      updatedQuote.updatedBy = updaterName;
      updatedQuote.updatedAt = timestamp;
    }

    if (qIndex !== -1) {
      localQuotes[qIndex] = updatedQuote;
    } else {
      localQuotes.push(updatedQuote);
    }

    // Update Request Stage Record
    const rIndex = localRequests.findIndex((r) => r.jobNumber === jobNumber);
    let targetRequest = rIndex !== -1 ? localRequests[rIndex] : { ...request };

    const WORKFLOW_STAGES = [
      "DRAFT",
      "SUBMITTED",
      "UNDER_REVIEW",
      "QUOTATION",
      "QUOTATION_APPROVAL",
      "PAYMENT_CONFIRMED",
      "PROJECT_CREATED",
      "FIELD_EXECUTION",
      "FINAL_INSPECTION",
      "COMPLETED"
    ];

    if (actionType === "APPROVE") {
      const currentIdx = WORKFLOW_STAGES.indexOf(targetRequest.currentStage);
      const targetIdx = WORKFLOW_STAGES.indexOf("PAYMENT_CONFIRMED");
      if (currentIdx < targetIdx) {
        targetRequest.currentStage = "PAYMENT_CONFIRMED" as WorkflowStage;
        targetRequest.updatedAt = timestamp;
      }

      // Generate invoice
      try {
        const invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

        const newInvoice = {
          id: invoiceId,
          tenantId: targetRequest.tenantId || "default-tenant",
          jobNumber: targetRequest.jobNumber,
          quotationJobNumber: targetRequest.jobNumber,
          subtotal: updatedQuote.subtotal || 0,
          vatAmount: updatedQuote.vat || 0,
          grandTotal: updatedQuote.grandTotal || 0,
          currency: "SAR" as const,
          status: "unpaid" as const,
          dueDate: dueDate.toISOString(),
          issuedAt: timestamp,
        };

        // Save invoice locally
        const invoicesStr = localStorage.getItem("SSLM_INVOICES");
        const invoices = invoicesStr ? JSON.parse(invoicesStr) : [];
        const invIndex = invoices.findIndex((i: any) => i.jobNumber === targetRequest.jobNumber);
        if (invIndex !== -1) {
          invoices[invIndex] = newInvoice;
        } else {
          invoices.push(newInvoice);
        }
        localStorage.setItem("SSLM_INVOICES", JSON.stringify(invoices));
      } catch (err) {
        console.error("Failed to generate or save invoice", err);
      }
    } else if (actionType === "REQUEST_CHANGES" || actionType === "REJECT") {
      if (targetRequest.currentStage === "QUOTATION_APPROVAL") {
        targetRequest.currentStage = "QUOTATION" as WorkflowStage;
        targetRequest.updatedAt = timestamp;
      }
    }

    if (rIndex !== -1) {
      localRequests[rIndex] = targetRequest;
    } else {
      localRequests.push(targetRequest);
    }

    // Persist and redirect
    localStorage.setItem("SSLM_QUOTATIONS", JSON.stringify(localQuotes));
    localStorage.setItem("SSLM_CLIENT_REQUESTS", JSON.stringify(localRequests));

    router.push("/quotations/approvals");
  };

  const getRequestTypeLabel = (type: string) => {
    return getCanonicalRequestTypeDisplayName(request, t);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/quotations/approvals">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {t("requests:quotations.details.back")}
          </Button>
        </Link>
        <Badge variant="warning">{t("requests:quotations.status.submitted")}</Badge>
      </div>

      <PageHeader
        title={t("requests:quotations.details.title")}
        description={`${t("requests:quotations.builder.fieldJobNumber")}: ${jobNumber}`}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Request Summary Card */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                {t("requests:quotations.details.requestSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:quotations.builder.fieldJobNumber")}
                </span>
                <span className="font-mono font-bold text-foreground">{request.jobNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:quotations.builder.fieldRequestType")}
                </span>
                <span className="font-semibold text-foreground">{getRequestTypeLabel(request.requestType)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:quotations.builder.fieldFacilityName")}
                </span>
                <span className="font-semibold text-foreground">{request.facilityName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:quotations.builder.fieldClientName")}
                </span>
                <span className="font-semibold text-foreground">{request.clientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:details.reviewPathLabel") || "Review Path"}
                </span>
                <span className="font-semibold text-foreground">
                  {getReviewPathDisplayName(request, t)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:details.serviceScopeLabel") || "Service Scope"}
                </span>
                <span className="font-semibold text-foreground">
                  {getCommercialServiceLabel(request, t)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:quotations.builder.fieldAssignedDepartment")}
                </span>
                <span className="font-semibold text-foreground">
                  {getQueueDisplayName(request.assignedQueue, t)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:list.fields.area")}
                </span>
                <span className="font-semibold text-foreground">
                  {request.area} {t("requests:wizard.areaUnit") || "sqm"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("requests:quotations.builder.fieldCurrentStage")}
                </span>
                <Badge variant="outline" className="mt-1">
                  {getWorkflowStageDisplayName(request.currentStage, t)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quotation Items Card */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                {t("requests:quotations.details.quotationItems")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-medium">
                      <th className="p-3 font-semibold">{t("requests:quotations.builder.itemDescription")}</th>
                      <th className="p-3 text-center font-semibold">{t("requests:quotations.builder.quantity")}</th>
                      <th className="p-3 text-right font-semibold">{t("requests:quotations.builder.unitPrice")}</th>
                      <th className="p-3 text-center font-semibold">{t("requests:quotations.builder.taxable")}</th>
                      <th className="p-3 text-right font-semibold">{t("requests:quotations.builder.lineTotal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/40 hover:bg-secondary/10 last:border-0">
                        <td className="p-3 font-medium text-foreground">{getQuotationItemDescription(item.description)}</td>
                        <td className="p-3 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {item.unitPrice.toLocaleString()} {t("common:sar") || "SAR"}
                        </td>
                        <td className="p-3 text-center text-muted-foreground">
                          {item.taxable ? t("common:yes") || "Yes" : t("common:no") || "No"}
                        </td>
                        <td className="p-3 text-right font-semibold text-foreground">
                          {(item.quantity * item.unitPrice).toLocaleString()} {t("common:sar") || "SAR"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action / Financial Sidebar */}
        <div className="space-y-6">
          
          {/* Financials & Decision Actions */}
          <Card className="border-border/60 bg-card shadow-md">
            <CardHeader className="bg-secondary/20">
              <CardTitle className="text-base font-bold">
                {t("requests:quotations.details.financialSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("requests:quotations.builder.subtotal")}</span>
                <span className="font-semibold text-foreground">
                  {quotation.subtotal.toLocaleString()} {t("common:sar") || "SAR"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("requests:quotations.builder.vat")}</span>
                <span className="font-semibold text-foreground">
                  {quotation.vat.toLocaleString()} {t("common:sar") || "SAR"}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">{t("requests:quotations.builder.grandTotal")}</span>
                <span className="font-extrabold text-primary text-lg">
                  {quotation.grandTotal.toLocaleString()} {t("common:sar") || "SAR"}
                </span>
              </div>

              {/* Action Buttons */}
              {actionType === null ? (
                <div className="grid grid-cols-1 gap-2 pt-4 border-t border-border/80">
                  <Button
                    onClick={() => setActionType("APPROVE")}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t("requests:quotations.details.approve")}
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType("REQUEST_CHANGES");
                      setInputText("");
                      setErrorMsg("");
                    }}
                    variant="outline"
                    className="w-full border-warning/50 text-warning hover:bg-warning/5 gap-1.5"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {t("requests:quotations.details.requestChanges")}
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType("REJECT");
                      setInputText("");
                      setErrorMsg("");
                    }}
                    variant="outline"
                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/5 gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("requests:quotations.details.reject")}
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-border/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {actionType === "APPROVE"
                        ? t("requests:quotations.details.approveDialogTitle")
                        : actionType === "REQUEST_CHANGES"
                        ? t("requests:quotations.details.requestChangesDialogTitle")
                        : t("requests:quotations.details.rejectDialogTitle")}
                    </span>
                    <Button variant="ghost" size="xs" onClick={() => setActionType(null)} className="text-xs">
                      {t("requests:quotations.details.close") || "Cancel"}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-normal">
                    {actionType === "APPROVE"
                      ? t("requests:quotations.details.approveDialogDesc")
                      : actionType === "REQUEST_CHANGES"
                      ? t("requests:quotations.details.requestChangesDialogDesc")
                      : t("requests:quotations.details.rejectDialogDesc")}
                  </p>

                  {(actionType === "REQUEST_CHANGES" || actionType === "REJECT") && (
                    <div className="space-y-1.5">
                      <Label htmlFor="reviewText" className="text-xs font-semibold">
                        {actionType === "REQUEST_CHANGES"
                          ? t("requests:quotations.details.commentsLabel")
                          : t("requests:quotations.details.reasonLabel")}
                      </Label>
                      <Textarea
                        id="reviewText"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={
                          actionType === "REQUEST_CHANGES"
                            ? t("requests:quotations.details.commentsPlaceholder")
                            : t("requests:quotations.details.reasonPlaceholder")
                        }
                        className="bg-background min-h-[80px]"
                      />
                      {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
                    </div>
                  )}

                  <Button onClick={handleDecisionSubmit} className="w-full gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    {t("requests:quotations.details.submit")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail Card */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("requests:quotations.details.auditTrail")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              {quotation.createdBy && (
                <div>
                  <span className="text-muted-foreground block">{t("requests:quotations.details.createdBy")}</span>
                  <span className="font-semibold text-foreground">{quotation.createdBy}</span>
                  <span className="text-muted-foreground block text-[10px]">
                    {quotation.createdAt ? new Date(quotation.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
              )}
              {quotation.submittedBy && (
                <div>
                  <span className="text-muted-foreground block">{t("requests:quotations.details.submittedBy")}</span>
                  <span className="font-semibold text-foreground">{quotation.submittedBy}</span>
                  <span className="text-muted-foreground block text-[10px]">
                    {quotation.submittedAt ? new Date(quotation.submittedAt).toLocaleString() : "-"}
                  </span>
                </div>
              )}
              {quotation.reviewedBy && (
                <div>
                  <span className="text-muted-foreground block">{t("requests:quotations.details.reviewedBy")}</span>
                  <span className="font-semibold text-foreground">{quotation.reviewedBy}</span>
                  <span className="text-muted-foreground block text-[10px]">
                    {quotation.reviewedAt ? new Date(quotation.reviewedAt).toLocaleString() : "-"}
                  </span>
                  {quotation.reviewComments && (
                    <div className="mt-1 p-2 rounded bg-amber-500/10 text-amber-500 font-mono text-[11px]">
                      {quotation.reviewComments}
                    </div>
                  )}
                </div>
              )}
              {quotation.approvedBy && (
                <div>
                  <span className="text-muted-foreground block">{t("requests:quotations.details.approvedBy")}</span>
                  <span className="font-semibold text-foreground">{quotation.approvedBy}</span>
                  <span className="text-muted-foreground block text-[10px]">
                    {quotation.approvedAt ? new Date(quotation.approvedAt).toLocaleString() : "-"}
                  </span>
                </div>
              )}
              {quotation.rejectedBy && (
                <div>
                  <span className="text-muted-foreground block">{t("requests:quotations.details.rejectedBy")}</span>
                  <span className="font-semibold text-foreground">{quotation.rejectedBy}</span>
                  <span className="text-muted-foreground block text-[10px]">
                    {quotation.rejectedAt ? new Date(quotation.rejectedAt).toLocaleString() : "-"}
                  </span>
                  {quotation.rejectionReason && (
                    <div className="mt-1 p-2 rounded bg-destructive/10 text-destructive font-mono text-[11px]">
                      {quotation.rejectionReason}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
