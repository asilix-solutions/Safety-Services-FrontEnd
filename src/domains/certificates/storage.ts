import { ClientCertificate } from "./types";

export function getCertificates(): ClientCertificate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_CERTIFICATES");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_CERTIFICATES", err);
    return [];
  }
}

export function saveCertificates(certificates: ClientCertificate[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CERTIFICATES", JSON.stringify(certificates));
  } catch (err) {
    console.error("Failed to save SSLM_CERTIFICATES", err);
  }
}

export function createOrUpdateCertificate(certificate: ClientCertificate): void {
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
