"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getScopedRequestByJobNumber, upsertRequest } from "@/domains/requests/storage";
import { getEngineeringReviewByJobNumber, saveEngineeringReview } from "@/domains/engineering/storage";
import {
  approveRequestForQuotation,
  returnRequestForModification,
  returnRequestForMissingDocuments,
} from "@/domains/requests/workflow";
import {
  engineeringApi,
  OccupancyHazardClass,
  EngineeringComplianceStatus,
} from "@/domains/engineering";
import { buildBlueprintReviewViewModel, toLicensingRequest, BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";
import { Sbc801ComplianceData } from "../components/review-decision-actions";
import { useTranslation } from "@/providers/i18n-provider";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { useRouter } from "next/navigation";

export function useBlueprintWorkspace(jobNumber: string) {
  const router = useRouter();
  const { t } = useTranslation();
  const tenantContext = useTenantContext();

  const [viewModel, setViewModel] = useState<BlueprintReviewViewModel | null>(null);
  const [engineerNotes, setEngineerNotes] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [missingDocumentsNote, setMissingDocumentsNote] = useState("");

  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showMissingDocsDialog, setShowMissingDocsDialog] = useState(false);

  const [validationError, setValidationError] = useState("");

  // Load request and review record
  const loadData = () => {
    if (!jobNumber) return;
    const request = getScopedRequestByJobNumber(jobNumber, tenantContext);
    if (request) {
      const reviewRecord = getEngineeringReviewByJobNumber(jobNumber);
      const vm = buildBlueprintReviewViewModel(request, reviewRecord);
      setViewModel(vm);
      setEngineerNotes(reviewRecord.notes || "");
      setCorrectionReason(reviewRecord.correctionReason || "");
      setMissingDocumentsNote(reviewRecord.missingDocumentsNote || "");
    } else {
      setViewModel(null);
    }
  };

  useEffect(() => {
    loadData();
  }, [jobNumber, tenantContext]);

  // Check if assigned/eligible for engineering review
  const isEngineeringEligible = useMemo(() => {
    if (!viewModel) return false;
    const queue = viewModel.assignedQueue;
    const classification = viewModel.classification;
    return (
      queue === "ENGINEERING" ||
      queue === "HIGH_HAZARD" ||
      classification === "engineering_project" ||
      classification === "high_hazard_review" ||
      viewModel.engineeringReviewRequired
    );
  }, [viewModel]);

  const isReadonly = !isEngineeringEligible;

  // Validate blueprint files
  // Check if at least one uploaded document has extension: .pdf, .dwg, .dxf, .png
  const hasValidBlueprint = useMemo(() => {
    if (!viewModel) return false;
    const validExtensions = [".pdf", ".dwg", ".dxf", ".png"];
    return viewModel.documents.some((doc) => {
      if (!doc.uploaded || !doc.fileName) return false;
      const lowerFile = doc.fileName.toLowerCase();
      return validExtensions.some((ext) => lowerFile.endsWith(ext));
    });
  }, [viewModel]);

  const handleApprove = (complianceData?: Sbc801ComplianceData) => {
    if (!viewModel || isReadonly) return;

    if (!hasValidBlueprint) {
      setValidationError(t("requests:blueprintReview.validation.missingDocsForApprove"));
      return;
    }

    setValidationError("");

    const hazardClass = complianceData?.occupancyHazardClass ?? OccupancyHazardClass.OrdinaryHazard1;
    const compartmentArea = complianceData?.isolatedCompartmentAreaM2 ?? 1200;
    const sprinklerDensity = complianceData?.requiredSprinklerDensity ?? 0.15;
    const remarks = complianceData?.technicalRemarks || engineerNotes || "Approved according to SBC 801";

    // 1. Save EngineeringReviewRecord with status APPROVED
    const reviewRecord = {
      jobNumber,
      status: "APPROVED" as const,
      notes: remarks,
    };
    saveEngineeringReview(reviewRecord);

    // 2. Advance the request through the canonical transition, which writes
    //    status + currentStage + updatedAt and appends the audit event.
    upsertRequest(approveRequestForQuotation(toLicensingRequest(viewModel)));

    // 3. Asynchronously record SBC 801 compliance on backend if instance exists
    if (viewModel.id) {
      engineeringApi
        .recordReview(viewModel.id, {
          occupancyHazardClass: hazardClass,
          isolatedCompartmentAreaM2: compartmentArea,
          requiredSprinklerDensity: sprinklerDensity,
          pumpHeadRatingMeters: complianceData?.pumpHeadRatingMeters,
          smokeVentilationAirChangesPerHour: complianceData?.smokeVentilationAirChangesPerHour,
          complianceStatus: EngineeringComplianceStatus.Compliant,
          technicalRemarks: remarks,
        })
        .catch((err) => {
          console.warn("Backend engineering review sync error:", err);
        });
    }

    toast.success(t("requests:blueprintReview.status.APPROVED"));
    
    // Reload model
    loadData();

    // Redirect to quotations or show toast
    setTimeout(() => {
      router.push("/quotations");
    }, 2000);
  };

  const handleReturnForModification = () => {
    if (!viewModel || isReadonly) return;

    if (!correctionReason.trim()) {
      setValidationError(t("requests:blueprintReview.validation.reasonRequired"));
      return;
    }

    setValidationError("");

    // Save EngineeringReviewRecord with status MODIFICATION_REQUIRED
    const reviewRecord = {
      jobNumber,
      status: "MODIFICATION_REQUIRED" as const,
      notes: engineerNotes,
      correctionReason,
    };
    saveEngineeringReview(reviewRecord);

    // Send the request itself back to the client, carrying the reason.
    upsertRequest(
      returnRequestForModification(toLicensingRequest(viewModel), correctionReason)
    );

    // Record review modification on backend
    if (viewModel.id) {
      engineeringApi
        .recordReview(viewModel.id, {
          occupancyHazardClass: OccupancyHazardClass.OrdinaryHazard1,
          isolatedCompartmentAreaM2: 1500,
          requiredSprinklerDensity: 0.15,
          complianceStatus: EngineeringComplianceStatus.RequiresModifications,
          technicalRemarks: correctionReason,
        })
        .catch((err) => {
          console.warn("Backend engineering review sync error:", err);
        });
    }

    setShowReturnDialog(false);
    toast.success(t("requests:blueprintReview.status.MODIFICATION_REQUIRED"));

    loadData();
  };

  const handleRequestMissingDocs = () => {
    if (!viewModel || isReadonly) return;

    if (!missingDocumentsNote.trim()) {
      setValidationError(t("requests:blueprintReview.validation.noteRequired"));
      return;
    }

    setValidationError("");

    // Save EngineeringReviewRecord with status MISSING_DOCUMENTS
    const reviewRecord = {
      jobNumber,
      status: "MISSING_DOCUMENTS" as const,
      notes: engineerNotes,
      missingDocumentsNote,
    };
    saveEngineeringReview(reviewRecord);

    // Send the request itself back to the client, carrying the note.
    upsertRequest(
      returnRequestForMissingDocuments(toLicensingRequest(viewModel), missingDocumentsNote)
    );

    setShowMissingDocsDialog(false);
    toast.success(t("requests:blueprintReview.status.MISSING_DOCUMENTS"));

    loadData();

  };

  return {
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
    validationError,
    setValidationError,
    isReadonly,
    hasValidBlueprint,
    handleApprove,
    handleReturnForModification,
    handleRequestMissingDocs,
  };
}
