"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_REQUESTS } from "@/mock/requests";
import { LicensingRequest, RequestType, WorkflowStage } from "@/domains/requests/types";
import { mapStatusToStage, getQueueDisplayName, getClassificationDisplayName, WORKFLOW_STAGES, getCanonicalRequestTypeDisplayName, getReviewPathDisplayName, getCommercialServiceLabel } from "@/domains/requests/workflow";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Quotation, QuotationItem, QuotationStatus } from "@/domains/quotations/types";
import { Plus, Trash2, ArrowLeft, Save, Send, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";

export default function QuotationBuilderPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  useNamespaceTranslations(["requests", "dashboard", "common"]);

  const jobNumber = params?.jobNumber as string;

  const [request, setRequest] = useState<LicensingRequest | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [quotationStatus, setQuotationStatus] = useState<QuotationStatus>("DRAFT");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [existingQuotation, setExistingQuotation] = useState<Quotation | null>(null);

  const isReadOnly = quotationStatus === "APPROVED" || quotationStatus === "REJECTED" || quotationStatus === "SUBMITTED_FOR_APPROVAL";

  // Load request details and existing quotation if any
  useEffect(() => {
    if (jobNumber) {
      // Find request
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
        assignedQueue: r.assignedQueue || (
          r.classification === "high_hazard_review" ? "HIGH_HAZARD" :
          r.classification === "engineering_project" ? "ENGINEERING" :
          r.classification === "maintenance_strategy" ? "MAINTENANCE" : 
          "FAST_TRACK"
        )
      }));

      const foundRequest = merged.find((r) => r.jobNumber === jobNumber);
      if (foundRequest) {
        setRequest(foundRequest);
      }

      // Find existing quotation
      try {
        const localQuotes = localStorage.getItem("SSLM_QUOTATIONS");
        if (localQuotes) {
          const quotes: Quotation[] = JSON.parse(localQuotes);
          const foundQuote = quotes.find((q) => q.jobNumber === jobNumber);
          if (foundQuote) {
            setExistingQuotation(foundQuote);
            setItems(foundQuote.items);
            setQuotationStatus(foundQuote.quotationStatus);
          }
        }
      } catch (err) {
        console.error("Failed to read quotations", err);
      }
    }
  }, [jobNumber]);

  if (!user) return null;

  if (!request) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <p>{t("requests:quotations.builder.notFound").replace("{{jobNumber}}", jobNumber)}</p>
        <Link href="/quotations">
          <Button variant="outline" size="sm">
            {t("requests:quotations.builder.backToQuotations")}
          </Button>
        </Link>
      </div>
    );
  }

  const getRequestTypeLabel = (type: RequestType) => {
    return getCanonicalRequestTypeDisplayName(request, t);
  };

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxableSum = items.filter(item => item.taxable).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vat = taxableSum * 0.15;
  const grandTotal = subtotal + vat;

  // Add custom quotation item
  const handleAddItem = (descriptionText = "") => {
    const newItem: QuotationItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      description: descriptionText,
      quantity: 1,
      unitPrice: 0,
      taxable: true
    };
    setItems([...items, newItem]);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Update field
  const handleUpdateItemField = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Resolve context-aware suggestions
  const suggestedItems = typeof window !== "undefined" ? (() => {
    const { getQuotationSuggestedItems } = require("@/domains/quotations/workflow");
    return getQuotationSuggestedItems({
      requestType: request.requestType,
      classification: request.classification,
      assignedQueue: request.assignedQueue || undefined,
    }, t);
  })() : [];


  // Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (items.length === 0) {
      errors["general"] = t("requests:quotations.builder.errNoItems");
    }

    items.forEach((item) => {
      if (!item.description.trim()) {
        errors[`description-${item.id}`] = t("requests:wizard.validation.required");
      }
      if (item.quantity < 1) {
        errors[`quantity-${item.id}`] = t("requests:quotations.builder.errMinQuantity");
      }
      if (item.unitPrice < 0) {
        errors[`unitPrice-${item.id}`] = t("requests:quotations.builder.errMinPrice");
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save quotation
  const handleSave = (status: QuotationStatus) => {
    if (!validate()) {
      console.log("Validation failed for quotation", validationErrors);
      return;
    }

    try {
      const localQuotes = localStorage.getItem("SSLM_QUOTATIONS");
      let quotes: Quotation[] = localQuotes ? JSON.parse(localQuotes) : [];

      const userNameOrId = user.id || user.name;
      const timestamp = new Date().toISOString();

      const updatedQuote: Quotation = {
        tenantId: request.tenantId,
        jobNumber,
        quotationStatus: status,
        items,
        subtotal,
        vat,
        grandTotal,
        createdAt: existingQuotation ? existingQuotation.createdAt : timestamp,
        updatedAt: timestamp,
        createdBy: existingQuotation ? existingQuotation.createdBy : userNameOrId,
        updatedBy: userNameOrId
      };

      // Set/preserve submission metadata
      if (status === "SUBMITTED_FOR_APPROVAL") {
        updatedQuote.submittedBy = userNameOrId;
        updatedQuote.submittedAt = timestamp;
      } else {
        // Saving draft: preserve existing submitted details if they were already set previously
        if (existingQuotation?.submittedAt) {
          updatedQuote.submittedAt = existingQuotation.submittedAt;
        }
        if (existingQuotation?.submittedBy) {
          updatedQuote.submittedBy = existingQuotation.submittedBy;
        }
      }

      console.log("Saving quotation", updatedQuote);
      console.log("Existing quotations", quotes);

      const idx = quotes.findIndex((q) => q.jobNumber === jobNumber);
      if (idx !== -1) {
        quotes[idx] = updatedQuote;
      } else {
        quotes.push(updatedQuote);
      }

      console.log("Persisting SSLM_QUOTATIONS");
      localStorage.setItem("SSLM_QUOTATIONS", JSON.stringify(quotes));
      console.log("LocalStorage SSLM_QUOTATIONS value:", localStorage.getItem("SSLM_QUOTATIONS"));

      // Synchronize associated request stage in SSLM_CLIENT_REQUESTS
      if (status === "SUBMITTED_FOR_APPROVAL") {
        try {
          const localReqsStr = localStorage.getItem("SSLM_CLIENT_REQUESTS");
          const localRequests: LicensingRequest[] = localReqsStr ? JSON.parse(localReqsStr) : [];
          
          const requestIdx = localRequests.findIndex(r => r.jobNumber === jobNumber);
          const approvalStageIndex = WORKFLOW_STAGES.indexOf("QUOTATION_APPROVAL");
          
          if (requestIdx !== -1) {
            const currentStageIndex = WORKFLOW_STAGES.indexOf(localRequests[requestIdx].currentStage);
            if (currentStageIndex < approvalStageIndex) {
              localRequests[requestIdx].currentStage = "QUOTATION_APPROVAL" as WorkflowStage;
              localRequests[requestIdx].updatedAt = timestamp;
            }
          } else if (request) {
            const currentStageIndex = WORKFLOW_STAGES.indexOf(request.currentStage);
            const updatedReq = { ...request };
            if (currentStageIndex < approvalStageIndex) {
              updatedReq.currentStage = "QUOTATION_APPROVAL" as WorkflowStage;
              updatedReq.updatedAt = timestamp;
            }
            localRequests.push(updatedReq);
          }
          
          localStorage.setItem("SSLM_CLIENT_REQUESTS", JSON.stringify(localRequests));

          // Sync local request state
          if (request) {
            const currentStageIndex = WORKFLOW_STAGES.indexOf(request.currentStage);
            if (currentStageIndex < approvalStageIndex) {
              setRequest({
                ...request,
                currentStage: "QUOTATION_APPROVAL" as WorkflowStage,
                updatedAt: timestamp
              });
            }
          }
        } catch (err) {
          console.error("Failed to sync request stage to localStorage", err);
        }
      }

      setQuotationStatus(status);
      setExistingQuotation(updatedQuote);
      
      const msg = status === "DRAFT" 
        ? t("requests:quotations.builder.successSave") 
        : t("requests:quotations.builder.successSubmit");
      
      setSuccessMessage(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setSuccessMessage("");
        router.push("/quotations");
      }, 2000);

    } catch (err) {
      console.error("Failed to save quotation", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Link href="/quotations">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <PageHeader
          title={`${t("requests:quotations.builder.title")}: ${jobNumber}`}
          description={t("requests:quotations.builder.subtitle")}
        />
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {successMessage}
        </div>
      )}

      {existingQuotation?.reviewComments && quotationStatus === "CHANGES_REQUESTED" && (
        <div className="p-4 rounded-xl border border-warning/20 bg-warning/5 text-warning text-xs space-y-1">
          <p className="font-bold">{t("requests:quotations.details.commentsLabel") || "Review Feedback"}:</p>
          <p className="font-mono">{existingQuotation.reviewComments}</p>
        </div>
      )}

      {existingQuotation?.rejectionReason && quotationStatus === "REJECTED" && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs space-y-1">
          <p className="font-bold">{t("requests:quotations.details.reasonLabel") || "Rejection Reason"}:</p>
          <p className="font-mono">{existingQuotation.rejectionReason}</p>
        </div>
      )}

      {validationErrors["general"] && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs font-semibold">
          {validationErrors["general"]}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Columns: Quotation items and suggestions */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 2: Quotation Items */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">{t("requests:quotations.builder.items")}</CardTitle>
                <CardDescription>{t("requests:quotations.builder.itemsDescription")}</CardDescription>
              </div>
              <Button 
                onClick={() => handleAddItem()} 
                size="sm" 
                disabled={isReadOnly}
                className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("requests:quotations.builder.addCustomItem")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  {t("requests:quotations.builder.noItems")}
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 border border-border bg-background rounded-lg flex flex-col md:flex-row md:items-start gap-3 relative"
                    >
                      {/* Description input */}
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`desc-${item.id}`}>
                          {t("requests:quotations.builder.description")}
                        </Label>
                        <Input
                          id={`desc-${item.id}`}
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItemField(item.id, "description", e.target.value)}
                          placeholder={t("requests:quotations.builder.descriptionPlaceholder")}
                          disabled={isReadOnly}
                        />
                        {validationErrors[`description-${item.id}`] && (
                          <p className="text-[10px] text-destructive">{validationErrors[`description-${item.id}`]}</p>
                        )}
                      </div>

                      {/* Quantity input */}
                      <div className="w-full md:w-20 space-y-1">
                        <Label htmlFor={`qty-${item.id}`}>
                          {t("requests:quotations.builder.quantity")}
                        </Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemField(item.id, "quantity", parseInt(e.target.value) || 0)}
                          disabled={isReadOnly}
                        />
                        {validationErrors[`quantity-${item.id}`] && (
                          <p className="text-[10px] text-destructive">{validationErrors[`quantity-${item.id}`]}</p>
                        )}
                      </div>

                      {/* Unit Price input */}
                      <div className="w-full md:w-28 space-y-1">
                        <Label htmlFor={`price-${item.id}`}>
                          {t("requests:quotations.builder.unitPrice")} (SAR)
                        </Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItemField(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                        />
                        {validationErrors[`unitPrice-${item.id}`] && (
                          <p className="text-[10px] text-destructive">{validationErrors[`unitPrice-${item.id}`]}</p>
                        )}
                      </div>

                      {/* Taxable checkbox */}
                      <div className="flex items-center gap-1.5 md:self-center mt-3 md:mt-5">
                        <Checkbox
                          id={`taxable-${item.id}`}
                          checked={item.taxable}
                          onChange={(e: any) => handleUpdateItemField(item.id, "taxable", e.target.checked)}
                          disabled={isReadOnly}
                        />
                        <Label htmlFor={`taxable-${item.id}`} className="cursor-pointer select-none">
                          {t("requests:quotations.builder.taxable")}
                        </Label>
                      </div>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isReadOnly}
                        className="h-8 w-8 text-destructive hover:bg-destructive/5 self-end md:self-center md:mt-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2 (Extra): Suggested Items */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">{t("requests:quotations.builder.suggestions")}</CardTitle>
              <CardDescription>{t("requests:quotations.builder.suggestionsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestedItems.map((sug: any) => (
                  <Button
                    key={sug.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem = {
                        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                        description: sug.label,
                        quantity: 1,
                        unitPrice: sug.defaultUnitPrice || 0,
                        taxable: sug.taxable !== false
                      };
                      setItems([...items, newItem]);
                    }}
                    disabled={isReadOnly}
                    className="h-8 text-xs font-medium"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {sug.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column: Request Summary & Financial Summary */}
        <div className="space-y-6">
          {/* Section 1: Request Summary */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold">
                {t("requests:quotations.builder.requestSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-border/50 text-xs space-y-1">
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:quotations.builder.fieldJobNumber")}</span>
                <span className="font-mono font-bold text-primary text-right">{request.jobNumber}</span>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:quotations.builder.fieldClientName")}</span>
                <span className="font-semibold text-foreground text-right">{request.clientName}</span>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:quotations.builder.fieldFacilityName")}</span>
                <span className="font-semibold text-foreground text-right">{request.facilityName}</span>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:quotations.builder.fieldRequestType")}</span>
                <span className="font-semibold text-foreground text-right">{getRequestTypeLabel(request.requestType)}</span>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:details.reviewPathLabel") || "Review Path"}</span>
                <span className="font-semibold text-foreground text-right">
                  {getReviewPathDisplayName(request, t)}
                </span>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:details.serviceScopeLabel") || "Service Scope"}</span>
                <span className="font-semibold text-foreground text-right">
                  {getCommercialServiceLabel(request, t)}
                </span>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:quotations.builder.fieldAssignedDepartment")}</span>
                <span className="font-semibold text-foreground text-right">
                  {getQueueDisplayName(request.assignedQueue, t)}
                </span>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:quotations.builder.fieldArea")}</span>
                <span className="font-semibold text-foreground text-right">{request.area} m²</span>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t("requests:quotations.builder.fieldCurrentStage")}</span>
                <div className="text-right">
                  <Badge variant="warning" className="capitalize">
                    {request.currentStage.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Financial Summary */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold">
                {t("requests:quotations.builder.financialSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-border/50 text-xs space-y-1">
              <div className="py-2.5 flex justify-between">
                <span className="text-muted-foreground">{t("requests:quotations.builder.subtotal")}</span>
                <span className="font-semibold text-foreground">{subtotal.toFixed(2)} SAR</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-muted-foreground">{t("requests:quotations.builder.vat")}</span>
                <span className="font-semibold text-foreground">{vat.toFixed(2)} SAR</span>
              </div>
              <div className="py-3 flex justify-between text-sm font-bold pt-3">
                <span className="text-foreground">{t("requests:quotations.builder.grandTotal")}</span>
                <span className="text-primary">{grandTotal.toFixed(2)} SAR</span>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Actions */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">{t("requests:quotations.builder.actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                onClick={() => handleSave("DRAFT")}
                disabled={isReadOnly}
                className="w-full h-9 text-xs gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
              >
                <Save className="h-4 w-4" />
                {t("requests:quotations.builder.saveDraft")}
              </Button>
              
              <Button
                onClick={() => handleSave("SUBMITTED_FOR_APPROVAL")}
                disabled={isReadOnly}
                className="w-full h-9 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Send className="h-4 w-4" />
                {t("requests:quotations.builder.submitForApproval")}
              </Button>

              <Link href="/quotations" className="block">
                <Button
                  variant="outline"
                  className="w-full h-9 text-xs gap-1.5"
                >
                  <X className="h-4 w-4" />
                  {t("requests:quotations.builder.cancel")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
