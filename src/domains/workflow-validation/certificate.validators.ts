import { ClientContract } from "../contracts/types";
import { ClientCertificate } from "../certificates/types";
import { ValidationResult } from "./types";

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

  if (certificate.status !== "active") {
    return {
      valid: false,
      reason: `Only active certificates can be revoked (current status: ${certificate.status}).`,
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
