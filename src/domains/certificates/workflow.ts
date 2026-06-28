import { ClientContract } from "../contracts/types";
import { ClientCertificate } from "./types";
import { canIssueCertificate, canRevokeCertificate } from "../workflow-validation";
import { getCertificateByContractId, getCertificateByProjectId, createOrUpdateCertificate, getCertificateById } from "./storage";
import { CERTIFICATE_VALIDITY_DAYS } from "./constants";
import { getRequests } from "../requests/storage";
import { mapRequestTypeToCertificateType } from "./helpers/mappers";

export function issueCertificate(contract: ClientContract, issuerName: string): ClientCertificate {
  // Check if a certificate already exists for this contract or project
  const existingByContract = getCertificateByContractId(contract.id);
  const existingByProject = getCertificateByProjectId(contract.projectId);
  const existing = existingByContract || existingByProject;

  const validation = canIssueCertificate(contract, existing);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const now = new Date();
  const expires = new Date(now.getTime() + CERTIFICATE_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

  // Retrieve originating request details for metadata snapshot
  const requests = getRequests();
  const request = requests.find((r) => r.jobNumber === contract.jobNumber);
  const facilityName = request?.facilityName || contract.title.replace(" - Completion Agreement", "");
  const type = request ? mapRequestTypeToCertificateType(request.requestType) : "safety";

  const certificate: ClientCertificate = {
    id: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
    tenantId: contract.tenantId,
    clientId: contract.clientId,
    projectId: contract.projectId,
    contractId: contract.id,
    jobNumber: contract.jobNumber,
    title: contract.title.replace("Completion Agreement", "Compliance Certificate"),
    status: "active",
    type,
    facilityName,
    issuedAt: now.toISOString(),
    issuedBy: issuerName,
    expiresAt: expires.toISOString(),
    documentUrl: "#",
    contractSnapshot: {
      status: "archived",
      archivedAt: contract.archivedAt || now.toISOString(),
    },
  };

  createOrUpdateCertificate(certificate);
  return certificate;
}

export function revokeCertificate(
  certificateId: string,
  revokedBy: string,
  reason?: string
): ClientCertificate {
  const certificate = getCertificateById(certificateId);
  if (!certificate) {
    throw new Error("Certificate not found");
  }
  const validation = canRevokeCertificate(certificate, reason);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const updated: ClientCertificate = {
    ...certificate,
    status: "revoked",
    revokedAt: new Date().toISOString(),
    revokedBy,
    revokedReason: reason || "Administrative Revocation",
  };

  createOrUpdateCertificate(updated);
  return updated;
}
