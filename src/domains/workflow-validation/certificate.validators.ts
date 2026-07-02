import { ClientContract } from "../contracts/types";
import { ClientCertificate } from "../certificates/types";
import { ValidationResult } from "./types";
import { Project } from "@/types/project";

export interface CertificateEligibility {
  eligible: boolean;
  reason?: string;
  sourceType: "project" | "contract" | "site_visit";
  sourceId: string;
  title: string;
  jobNumber?: string;
  clientId: string;
  tenantId: string;
  facilityName: string;
}

export function canIssueCertificate(
  contract?: ClientContract | null,
  existingCertificate?: ClientCertificate | null
): ValidationResult {
  if (!contract) {
    return { valid: false, reason: "Contract does not exist." };
  }

  if (contract.status !== "archived") {
    return {
      valid: false,
      reason: `Contract must be archived before a certificate can be issued (current status: ${contract.status}).`,
    };
  }

  if (existingCertificate) {
    return {
      valid: false,
      reason: `A certificate has already been issued for this contract or project (Certificate ID: ${existingCertificate.id}).`,
    };
  }

  return { valid: true };
}

export function canRevokeCertificate(
  certificate?: ClientCertificate | null,
  reason?: string | null
): ValidationResult {
  if (!certificate) {
    return { valid: false, reason: "Certificate does not exist." };
  }

  if (certificate.status !== "active" && (certificate.status as string) !== "ISSUED") {
    return {
      valid: false,
      reason: `Only active/issued certificates can be revoked (current status: ${certificate.status}).`,
    };
  }

  if (!reason || !reason.trim()) {
    return {
      valid: false,
      reason: "Revocation reason is required.",
    };
  }

  return { valid: true };
}

export function checkProjectCertificateEligibility(
  project: Project,
  existingCertificates: ClientCertificate[]
): CertificateEligibility {
  if (!project.clientId || !project.tenantId) {
    return {
      eligible: false,
      reason: "Missing client or tenant identification on project.",
      sourceType: "project",
      sourceId: project.id,
      title: project.name,
      jobNumber: project.jobNumber,
      clientId: project.clientId || "",
      tenantId: project.tenantId || "",
      facilityName: project.name,
    };
  }

  // Safety compliance certificates are for licensing projects (projectType: "license")
  if (project.projectType !== "license") {
    return {
      eligible: false,
      reason: "Project is not a licensing/safety project type.",
      sourceType: "project",
      sourceId: project.id,
      title: project.name,
      jobNumber: project.jobNumber,
      clientId: project.clientId,
      tenantId: project.tenantId,
      facilityName: project.name,
    };
  }

  const isCompleted =
    project.status === "completed" ||
    project.executionPhase === "COMPLETED" ||
    project.executionPhase === "FINAL_INSPECTION_APPROVED" ||
    project.workspace?.inspection?.approved === true;

  if (!isCompleted) {
    return {
      eligible: false,
      reason: "Project execution or final inspection is not completed/approved.",
      sourceType: "project",
      sourceId: project.id,
      title: project.name,
      jobNumber: project.jobNumber,
      clientId: project.clientId,
      tenantId: project.tenantId,
      facilityName: project.name,
    };
  }

  const alreadyExists = existingCertificates.some(
    (c) => c.projectId === project.id || (project.jobNumber && c.jobNumber === project.jobNumber)
  );

  if (alreadyExists) {
    return {
      eligible: false,
      reason: "A compliance certificate has already been issued for this project.",
      sourceType: "project",
      sourceId: project.id,
      title: project.name,
      jobNumber: project.jobNumber,
      clientId: project.clientId,
      tenantId: project.tenantId,
      facilityName: project.name,
    };
  }

  return {
    eligible: true,
    sourceType: "project",
    sourceId: project.id,
    title: project.name,
    jobNumber: project.jobNumber,
    clientId: project.clientId,
    tenantId: project.tenantId,
    facilityName: project.name,
  };
}
