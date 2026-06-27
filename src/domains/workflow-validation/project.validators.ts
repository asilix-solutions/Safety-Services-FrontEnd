import { Project } from "../../types/project";
import { LicensingRequest } from "../requests/types";
import { ValidationResult } from "./types";

export function canStartProjectExecution(
  project?: Project,
  request?: LicensingRequest | null
): ValidationResult {
  if (!project) {
    return { valid: false, reason: "Project does not exist." };
  }

  const approved = project.workspace?.kickoff?.approved;
  if (!approved) {
    return { valid: false, reason: "Project kickoff must be approved." };
  }

  const inspector = project.workspace?.kickoff?.assignedInspector;
  if (!inspector || !inspector.trim()) {
    return { valid: false, reason: "An inspector must be assigned before execution." };
  }

  return { valid: true };
}

export function canCompleteExecution(
  project?: Project,
  request?: LicensingRequest | null
): ValidationResult {
  if (!project) {
    return { valid: false, reason: "Project does not exist." };
  }

  if (project.executionPhase !== "active_execution") {
    return {
      valid: false,
      reason: `Project execution must be active (current phase: ${project.executionPhase || "none"}).`,
    };
  }

  const downPaymentConfirmed = project.workspace?.execution?.downPaymentConfirmed;
  if (!downPaymentConfirmed) {
    return { valid: false, reason: "Down payment must be confirmed to complete execution." };
  }

  return { valid: true };
}
