import { Project } from "../../types/project";
import { ClientContract } from "../contracts/types";
import { ValidationResult } from "./types";

import { getQuotations } from "../quotations/storage";

export function canGenerateContract(
  project?: Project | null,
  existingContract?: ClientContract | null
): ValidationResult {
  if (!project) {
    return { valid: false, reason: "Project does not exist." };
  }

  const isCompleted = project.status === "completed" || project.executionPhase === "completed";
  if (!isCompleted) {
    return {
      valid: false,
      reason: `Project is not completed (current status: ${project.status || "none"}, phase: ${project.executionPhase || "none"}).`,
    };
  }

  if (existingContract) {
    return {
      valid: false,
      reason: `A contract already exists for this project (Contract ID: ${existingContract.id}).`,
    };
  }

  // 4. Approved quotation exists for the same jobNumber
  if (project.jobNumber) {
    const quotations = getQuotations();
    const approvedQuotation = quotations.find(
      (q) => q.jobNumber === project.jobNumber && q.quotationStatus === "APPROVED"
    );
    if (!approvedQuotation) {
      return {
        valid: false,
        reason: "projects:contracts.errors.noApprovedQuotation",
      };
    }
  } else {
    return {
      valid: false,
      reason: "projects:contracts.errors.noApprovedQuotation",
    };
  }

  return { valid: true };
}

export function canSignContract(contract?: ClientContract | null): ValidationResult {
  if (!contract) {
    return { valid: false, reason: "Contract does not exist." };
  }

  if (contract.status !== "generated") {
    return {
      valid: false,
      reason: `Only generated contracts can be signed (current status: ${contract.status}).`,
    };
  }

  return { valid: true };
}

export function canArchiveContract(contract?: ClientContract | null): ValidationResult {
  if (!contract) {
    return { valid: false, reason: "Contract does not exist." };
  }

  if (contract.status !== "signed") {
    return {
      valid: false,
      reason: `Only signed contracts can be archived (current status: ${contract.status}).`,
    };
  }

  return { valid: true };
}
