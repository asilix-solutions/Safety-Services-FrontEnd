import { useState, useEffect, useMemo } from "react";
import { getRequestByJobNumber, upsertRequest } from "@/domains/requests/storage";
import { getEngineeringReviewByJobNumber, saveEngineeringReview } from "@/domains/engineering/storage";
import { buildBlueprintReviewViewModel, BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";
import { useTranslation } from "@/providers/i18n-provider";
import { useRouter } from "next/navigation";

export function useBlueprintWorkspace(jobNumber: string) {
  const router = useRouter();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<BlueprintReviewViewModel | null>(null);
  const [engineerNotes, setEngineerNotes] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [missingDocumentsNote, setMissingDocumentsNote] = useState("");

  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showMissingDocsDialog, setShowMissingDocsDialog] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  // Load request and review record
  const loadData = () => {
    if (!jobNumber) return;
    const request = getRequestByJobNumber(jobNumber);
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
  }, [jobNumber]);

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

  const handleApprove = () => {
    if (!viewModel || isReadonly) return;

    if (!hasValidBlueprint) {
      setValidationError(t("requests:blueprintReview.validation.missingDocsForApprove"));
      return;
    }

    setValidationError("");

    // 1. Save EngineeringReviewRecord with status APPROVED
    const reviewRecord = {
      jobNumber,
      status: "APPROVED" as const,
      notes: engineerNotes,
    };
    saveEngineeringReview(reviewRecord);

    // 2. Update request.currentStage to QUOTATION
    const updatedRequest = {
      ...viewModel,
      currentStage: "QUOTATION" as const,
    };
    // Delete viewmodel-specific extensions before saving to request storage
    delete (updatedRequest as any).reviewRecord;
    delete (updatedRequest as any).reviewStatus;

    upsertRequest(updatedRequest);

    setSuccessMessage(t("requests:blueprintReview.status.APPROVED"));
    
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

    setShowReturnDialog(false);
    setSuccessMessage(t("requests:blueprintReview.status.MODIFICATION_REQUIRED"));
    
    loadData();

    setTimeout(() => setSuccessMessage(""), 4000);
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

    setShowMissingDocsDialog(false);
    setSuccessMessage(t("requests:blueprintReview.status.MISSING_DOCUMENTS"));

    loadData();

    setTimeout(() => setSuccessMessage(""), 4000);
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
    successMessage,
    validationError,
    setValidationError,
    isReadonly,
    hasValidBlueprint,
    handleApprove,
    handleReturnForModification,
    handleRequestMissingDocs,
  };
}
