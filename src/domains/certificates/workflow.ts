import { ClientContract } from "../contracts/types";
import { ClientCertificate, CertificateType } from "./types";
import { canIssueCertificate, canRevokeCertificate, checkProjectCertificateEligibility } from "../workflow-validation";
import { getCertificateByContractId, getCertificateByProjectId, createOrUpdateCertificate, getCertificateById, getCertificates } from "./storage";
import { CERTIFICATE_VALIDITY_DAYS } from "./constants";
import { getRequests } from "../requests/storage";
import { mapRequestTypeToCertificateType } from "./helpers/mappers";
import { Project } from "@/types/project";

export function generateCertificateNumber(type: CertificateType): string {
  const year = new Date().getFullYear();
  const typeCode = type === "safety" ? "SAF" : type === "maintenance" ? "MNT" : "INS";
  const prefix = `CERT-${typeCode}-${year}-`;
  
  const certificates = getCertificates();
  const matching = certificates.filter(c => c.id.startsWith(prefix));
  let nextSeq = 1;
  if (matching.length > 0) {
    const seqs = matching.map(c => {
      const parts = c.id.split("-");
      const seqStr = parts[parts.length - 1];
      const parsed = parseInt(seqStr, 10);
      return isNaN(parsed) ? 0 : parsed;
    });
    nextSeq = Math.max(...seqs) + 1;
  }
  const seqStr = String(nextSeq).padStart(6, "0");
  return `${prefix}${seqStr}`;
}

export function issueCertificate(contract: ClientContract, issuerName: string): ClientCertificate {
  const existingByContract = getCertificateByContractId(contract.id);
  const existingByProject = getCertificateByProjectId(contract.projectId);
  const existing = existingByContract || existingByProject;

  const validation = canIssueCertificate(contract, existing);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const now = new Date();
  const expires = new Date(now.getTime() + CERTIFICATE_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

  const requests = getRequests();
  const request = requests.find((r) => r.jobNumber === contract.jobNumber);
  const facilityName = request?.facilityName || contract.title.replace(" - Completion Agreement", "");
  const type = request ? mapRequestTypeToCertificateType(request.requestType) : "safety";

  const certNumber = generateCertificateNumber(type);

  const certificate: ClientCertificate = {
    id: certNumber,
    tenantId: contract.tenantId,
    clientId: contract.clientId,
    projectId: contract.projectId,
    contractId: contract.id,
    jobNumber: contract.jobNumber,
    title: contract.title.replace("Completion Agreement", "Compliance Certificate"),
    status: "ISSUED",
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
    customerSnapshot: {
      companyName: contract.clientId,
      clientId: contract.clientId,
    },
    facilitySnapshot: {
      facilityName,
    },
    originatingSnapshot: {
      requestJobNumber: contract.jobNumber,
      requestType: request?.requestType || "new_license",
    }
  };

  createOrUpdateCertificate(certificate);
  return certificate;
}

export function issueCertificateFromProject(project: Project, issuerName: string): ClientCertificate {
  const now = new Date();
  const expires = new Date(now.getTime() + CERTIFICATE_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

  const allCertificates = getCertificates();
  const eligibility = checkProjectCertificateEligibility(project, allCertificates);
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason || "Project is not eligible for certificate.");
  }

  const certNumber = generateCertificateNumber("safety");

  const certificate: ClientCertificate = {
    id: certNumber,
    tenantId: project.tenantId,
    clientId: project.clientId,
    projectId: project.id,
    jobNumber: project.jobNumber || `JOB-${Math.floor(100000 + Math.random() * 900000)}`,
    title: `${project.name} Compliance Certificate`,
    status: "ISSUED",
    type: "safety",
    facilityName: project.name,
    issuedAt: now.toISOString(),
    issuedBy: issuerName,
    expiresAt: expires.toISOString(),
    documentUrl: "#",
    customerSnapshot: {
      companyName: project.clientName || project.clientId,
      clientId: project.clientId,
    },
    facilitySnapshot: {
      facilityName: project.name,
    },
    originatingSnapshot: {
      requestJobNumber: project.jobNumber || "",
      requestType: project.projectType === "license" ? "new_license" : "engineering_blueprint",
    }
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
    status: "REVOKED",
    revokedAt: new Date().toISOString(),
    revokedBy,
    revokedReason: reason || "Administrative Revocation",
  };

  createOrUpdateCertificate(updated);
  return updated;
}
