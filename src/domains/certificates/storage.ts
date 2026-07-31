import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";
import { ClientCertificate } from "./types";

export function getCertificates(): ClientCertificate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_CERTIFICATES_V2");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_CERTIFICATES", err);
    return [];
  }
}

export function saveCertificates(certificates: ClientCertificate[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CERTIFICATES_V2", JSON.stringify(certificates));
  } catch (err) {
    console.error("Failed to save SSLM_CERTIFICATES", err);
  }
}

export function createOrUpdateCertificate(certificate: ClientCertificate): void {
  // Unscoped on purpose: saving a scoped list would drop other tenants' rows.
  const certificates = getCertificates();
  const index = certificates.findIndex((c) => c.id === certificate.id);
  if (index !== -1) {
    certificates[index] = certificate;
  } else {
    certificates.push(certificate);
  }
  saveCertificates(certificates);
}

export function getCertificateById(id: string): ClientCertificate | null {
  const certificates = getCertificates();
  return certificates.find((c) => c.id === id) || null;
}

export function getCertificateByContractId(contractId: string): ClientCertificate | null {
  const certificates = getCertificates();
  return certificates.find((c) => c.contractId === contractId) || null;
}

export function getCertificateByProjectId(projectId: string): ClientCertificate | null {
  const certificates = getCertificates();
  return certificates.find((c) => c.projectId === projectId) || null;
}

/** Certificates visible to the caller's tenant. The getter UI lists must use. */
export function getScopedCertificates(ctx: TenantContext): ClientCertificate[] {
  return scopeToTenant(getCertificates(), ctx);
}
