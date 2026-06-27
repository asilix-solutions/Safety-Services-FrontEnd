import { Project } from "../../types/project";
import { LicensingRequest } from "../requests/types";
import { ValidationResult } from "./types";

export function canApproveInspection(
  project?: Project,
  request?: LicensingRequest | null,
  notes?: string
): ValidationResult {
  if (!project) {
    return { valid: false, reason: "Project does not exist." };
  }

  if (project.executionPhase !== "ready_for_final_inspection") {
    return {
      valid: false,
      reason: `Project must be ready for final inspection (current phase: ${project.executionPhase || "none"}).`,
    };
  }

  const approved = project.workspace?.inspection?.approved;
  if (approved === true) {
    return { valid: false, reason: "Inspection is already approved." };
  }

  if (!notes || !notes.trim()) {
    return { valid: false, reason: "Approval notes are required." };
  }

  return { valid: true };
}

export function canReturnInspection(
  project?: Project,
  request?: LicensingRequest | null,
  reason?: string
): ValidationResult {
  if (!project) {
    return { valid: false, reason: "Project does not exist." };
  }

  if (project.executionPhase !== "ready_for_final_inspection") {
    return {
      valid: false,
      reason: `Project must be ready for final inspection (current phase: ${project.executionPhase || "none"}).`,
    };
  }

  if (!reason || !reason.trim()) {
    return { valid: false, reason: "Return reason is required." };
  }

  return { valid: true };
}
