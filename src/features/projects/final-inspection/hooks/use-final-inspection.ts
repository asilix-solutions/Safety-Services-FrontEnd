"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { passFinalInspection, failFinalInspection } from "@/domains/projects/workflow";

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

      const updatedProject = passFinalInspection({
        project,
        inspectedBy: engineerName,
        notes,
      });

      setSuccessMessage("projects:inspection.approvedSuccess");
      if (onSuccess) {
        onSuccess(updatedProject, null);
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

      const updatedProject = failFinalInspection({
        project,
        inspectedBy: engineerName,
        notes,
      });

      setSuccessMessage("projects:inspection.returnedSuccess");
      if (onSuccess) {
        onSuccess(updatedProject, null);
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
