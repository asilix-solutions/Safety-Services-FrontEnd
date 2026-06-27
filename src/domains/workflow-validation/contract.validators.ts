import { Project } from "../../types/project";
import { ClientContract } from "../contracts/types";
import { ValidationResult } from "./types";

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
