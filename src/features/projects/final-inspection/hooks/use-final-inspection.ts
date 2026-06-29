"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { approveFinalInspection, requestFinalInspectionFixes } from "@/domains/projects/workflow";

interface UseFinalInspectionProps {
  project: Project;
  request: LicensingRequest | null;
  engineerName: string;
  onSuccess?: (updatedProject: Project, updatedRequest: LicensingRequest | null) => void;
}

export function useFinalInspection({
  project,
  request,
  engineerName,
  onSuccess,
}: UseFinalInspectionProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simulate network request delay if any
      await new Promise((resolve) => setTimeout(resolve, 800));

      const { updatedProject, updatedRequest } = approveFinalInspection({
        project,
        request,
        notes,
        engineerName,
      });

      setSuccessMessage("projects:inspection.approvedSuccess");
      if (onSuccess) {
        onSuccess(updatedProject, updatedRequest);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during approval.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestFixes = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const { updatedProject, updatedRequest } = requestFinalInspectionFixes({
        project,
        request,
        notes,
        engineerName,
      });

      setSuccessMessage("projects:inspection.returnedSuccess");
      if (onSuccess) {
        onSuccess(updatedProject, updatedRequest);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during rejection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    notes,
    setNotes,
    isSubmitting,
    error,
    successMessage,
    handleApprove,
    handleRequestFixes,
  };
}
