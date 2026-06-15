"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { clientRequestSchema, ClientRequestFormValues } from "@/schemas/client-request.schema";
import { useAuth } from "@/providers/AuthProvider";
import { RequiredDocument, RequestType, RequestClassification, RequestQueue, LicensingRequest } from "@/domains/requests/types";
import { DEFAULT_REQUIRED_DOCUMENTS, HIGH_HAZARD_KEYWORDS, HIGH_HAZARD_ISIC_CODES } from "@/domains/requests/constants";
import { getClassificationReason, getQueueDisplayName } from "@/domains/requests/workflow";

// Steps Components
import { WizardProgress } from "./wizard-progress";
import { RequestTypeStep } from "./wizard-step-request-type";
import { FacilityInfoStep } from "./wizard-step-facility-info";
import { SafetyRiskStep } from "./wizard-step-safety-risk";
import { DocumentsStep } from "./wizard-step-documents";
import { ClassificationStep } from "./wizard-step-classification";
import { ReviewSubmitStep } from "./wizard-step-review-submit";

// Shared UI
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle2, ChevronRight, ListTodo } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";

// Helper to determine if high hazard is triggered
function isHighHazardActivity(values: Partial<ClientRequestFormValues>): boolean {
  if (values.gasExtensions || values.hazardousMaterials || values.riskCategory === "high") {
    return true;
  }

  const actName = (values.activityName || "").toLowerCase();
  const isKeywordMatched = HIGH_HAZARD_KEYWORDS.some((kw) => actName.includes(kw));
  if (isKeywordMatched) return true;

  const code = values.isicCode || "";
  if (HIGH_HAZARD_ISIC_CODES.includes(code)) return true;

  return false;
}

export function ClientRequestWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  
  const STEPS = [
    t("requests:wizard.steps.type"),
    t("requests:wizard.steps.facility"),
    t("requests:wizard.steps.safety"),
    t("requests:wizard.steps.uploads"),
    t("requests:wizard.steps.classification"),
    t("requests:wizard.steps.review")
  ];

  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState<RequiredDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<LicensingRequest | null>(null);

  const form = useForm<ClientRequestFormValues>({
    resolver: zodResolver(clientRequestSchema),
    defaultValues: {
      requestType: "new_license",
      facilityName: "",
      crNumber: "",
      activityName: "",
      isicCode: "",
      area: undefined,
      city: "",
      district: "",
      addressDescription: "",
      contactName: "",
      contactPhone: "",
      safetyEquipment: false,
      fireAlarm: false,
      fireExtinguishers: false,
      emergencyExits: false,
      gasExtensions: false,
      hazardousMaterials: false,
      riskCategory: "low",
      notes: "",
    },
  });

  const selectedRequestType = form.watch("requestType");
  const formValues = form.watch();

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem("SSLM_CLIENT_REQUEST_DRAFT");
      if (draft) {
        const parsed = JSON.parse(draft);
        form.reset(parsed.values);
        setDocuments(parsed.documents || []);
        setStep(parsed.step || 1);
      } else {
        // Init default docs
        initDefaultDocuments("new_license");
      }
    } catch (err) {
      console.error("Failed to restore draft", err);
    }
  }, []);

  const initDefaultDocuments = (type: RequestType) => {
    const defaultDocs = DEFAULT_REQUIRED_DOCUMENTS[type] || [];
    setDocuments(defaultDocs.map((doc) => ({ ...doc, uploaded: false })));
  };

  // Re-init docs when requestType changes, only if not restored from draft
  useEffect(() => {
    if (selectedRequestType) {
      const draft = localStorage.getItem("SSLM_CLIENT_REQUEST_DRAFT");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.values.requestType === selectedRequestType) {
          // restored values match
          return;
        }
      }
      initDefaultDocuments(selectedRequestType);
    }
  }, [selectedRequestType]);

  const handleDocumentUploaded = (index: number, fileName: string) => {
    const updated = [...documents];
    if (fileName) {
      updated[index] = { ...updated[index], uploaded: true, fileName };
    } else {
      updated[index] = { ...updated[index], uploaded: false, fileName: undefined };
    }
    setDocuments(updated);
    // Auto save draft state
    saveDraftState(step, updated);
  };

  const saveDraftState = (currentStep: number, docs = documents) => {
    const state = {
      step: currentStep,
      values: form.getValues(),
      documents: docs,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("SSLM_CLIENT_REQUEST_DRAFT", JSON.stringify(state));
  };

  const handleNext = () => {
    if (step === 4) {
      const allUploaded = documents.every((doc) => doc.uploaded);
      if (!allUploaded) {
        alert(t("requests:wizard.validation.missingDocuments") || "Please upload all required documents before proceeding.");
        return;
      }
    }
    const nextStep = step + 1;
    setStep(nextStep);
    saveDraftState(nextStep);
  };

  const handlePrev = () => {
    const prevStep = step - 1;
    setStep(prevStep);
    saveDraftState(prevStep);
  };

  const handleSaveDraft = () => {
    saveDraftState(step);
    alert("Draft saved successfully! You can resume from this step later.");
  };

  // Compute auto-classification parameters
  const isHighHazard = isHighHazardActivity(formValues);
  const area = formValues.area || 0;

  let classification: RequestClassification = "fast_track";
  let siteVisitRequired = false;
  let engineeringReviewRequired = false;
  let instantReportAllowed = true;

  if (isHighHazard) {
    classification = "high_hazard_review";
    siteVisitRequired = true;
    engineeringReviewRequired = true;
    instantReportAllowed = false;
  } else {
    if (area < 150) {
      classification = "fast_track";
      siteVisitRequired = false;
      engineeringReviewRequired = false;
      instantReportAllowed = true;
    } else if (area >= 150 && area <= 1000) {
      classification = "maintenance_strategy";
      siteVisitRequired = true;
      engineeringReviewRequired = false;
      instantReportAllowed = false;
    } else {
      classification = "engineering_project";
      siteVisitRequired = true;
      engineeringReviewRequired = true;
      instantReportAllowed = false;
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true);

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get current requests list from local storage or empty array
    let currentRequests: LicensingRequest[] = [];
    try {
      const local = localStorage.getItem("SSLM_CLIENT_REQUESTS");
      if (local) {
        currentRequests = JSON.parse(local);
      }
    } catch (err) {
      console.error("Failed to read requests from localstorage", err);
    }

    // Generate Job Number
    const count = currentRequests.length + 1;
    const year = new Date().getFullYear();
    const jobNumber = `SSLM-${year}-${String(count).padStart(6, "0")}`;

    let assignedQueue: RequestQueue = "FAST_TRACK";
    if (classification === "high_hazard_review") {
      assignedQueue = "HIGH_HAZARD";
    } else if (classification === "engineering_project") {
      assignedQueue = "ENGINEERING";
    } else if (classification === "maintenance_strategy") {
      assignedQueue = "MAINTENANCE";
    }

    const newRequest: LicensingRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      jobNumber,
      tenantId: "tenant-1",
      requestType: selectedRequestType,
      status: "submitted",
      clientId: user?.id || "c-101",
      clientName: user?.name || "Emaar Properties",
      facilityName: formValues.facilityName,
      crNumber: formValues.crNumber,
      activityName: formValues.activityName,
      isicCode: formValues.isicCode,
      area: Number(formValues.area),
      city: formValues.city,
      district: formValues.district,
      addressDescription: formValues.addressDescription,
      contactName: formValues.contactName,
      contactPhone: formValues.contactPhone,
      safetyEquipment: formValues.safetyEquipment,
      fireAlarm: formValues.fireAlarm,
      fireExtinguishers: formValues.fireExtinguishers,
      emergencyExits: formValues.emergencyExits,
      gasExtensions: formValues.gasExtensions,
      hazardousMaterials: formValues.hazardousMaterials,
      riskCategory: formValues.riskCategory,
      notes: formValues.notes,
      classification,
      siteVisitRequired,
      engineeringReviewRequired,
      instantReportAllowed,
      currentStage: "SUBMITTED",
      assignedQueue,
      documents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { status: "draft", comment: "Request draft initialized by client.", date: new Date().toISOString() },
        { status: "submitted", comment: "Request successfully submitted.", date: new Date().toISOString() },
      ],
    };

    // Store in localStorage
    currentRequests.push(newRequest);
    localStorage.setItem("SSLM_CLIENT_REQUESTS", JSON.stringify(currentRequests));

    // Clear draft
    localStorage.removeItem("SSLM_CLIENT_REQUEST_DRAFT");

    setSubmittedRequest(newRequest);
    setSubmitting(false);
  };

  if (submittedRequest) {
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

    const pathSummary = getReviewPathSummary(submittedRequest.classification);

    return (
      <Card className="max-w-xl mx-auto border-border bg-card shadow-xl overflow-hidden rounded-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {t("requests:wizard.success.titleSubmitted")}
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {t("requests:wizard.success.description")}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-muted/20 max-w-md mx-auto space-y-3.5 text-left rtl:text-right">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{t("requests:wizard.success.requestNumber")}:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{submittedRequest.jobNumber}</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-border/50">
              <span className="text-muted-foreground">{t("requests:wizard.review.pathSummary.path")}:</span>
              <Badge variant="outline" className="font-semibold">{pathSummary.path}</Badge>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-border/50">
              <span className="text-muted-foreground">{t("requests:wizard.review.pathSummary.duration")}:</span>
              <Badge variant="secondary" className="font-semibold text-foreground">{pathSummary.duration}</Badge>
            </div>

            <div className="flex flex-col items-start gap-1 pt-2.5 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                {t("requests:wizard.review.pathSummary.nextStep")}:
              </span>
              <span className="text-xs text-foreground/80 leading-relaxed font-normal">
                {pathSummary.nextStep}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-4">
            <Link href="/requests" className="flex-1">
              <Button variant="outline" className="w-full text-xs gap-1.5 h-10 rounded-xl">
                <ListTodo className="h-4 w-4" /> {t("requests:wizard.success.backToRequests")}
              </Button>
            </Link>
            <Link href={`/requests/${submittedRequest.jobNumber}`} className="flex-1">
              <Button className="w-full text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white h-10 shadow-md shadow-indigo-600/10 rounded-xl">
                {t("requests:wizard.success.viewDetails")} <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto border-border bg-card shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <WizardProgress currentStep={step} steps={STEPS} />

        <form className="space-y-4">
          {step === 1 && (
            <RequestTypeStep
              value={selectedRequestType}
              onChange={(val) => form.setValue("requestType", val)}
              onNext={handleNext}
            />
          )}

          {step === 2 && <FacilityInfoStep form={form} onNext={handleNext} onPrev={handlePrev} />}

          {step === 3 && <SafetyRiskStep form={form} onNext={handleNext} onPrev={handlePrev} />}

          {step === 4 && (
            <DocumentsStep
              requestType={selectedRequestType}
              documents={documents}
              onDocumentUploaded={handleDocumentUploaded}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}

          {step === 5 && (
            <ClassificationStep
              classification={classification}
              siteVisitRequired={siteVisitRequired}
              engineeringReviewRequired={engineeringReviewRequired}
              instantReportAllowed={instantReportAllowed}
              area={area}
              requestType={selectedRequestType}
              requestData={formValues}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}

          {step === 6 && (
            <ReviewSubmitStep
              form={form}
              documents={documents}
              classificationText={classification}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              onPrev={handlePrev}
              isSubmitting={submitting}
            />
          )}
        </form>
      </CardContent>
    </Card>
  );
}
export default ClientRequestWizard;
