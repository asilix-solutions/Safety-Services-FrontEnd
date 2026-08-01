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

/**
 * A single certificate by id, unscoped.
 *
 * Internal: for workflow guards that must see the row whoever owns it — a
 * scoped read would turn a cross-tenant revoke into a plain not-found instead
 * of a rejection. UI must use `getScopedCertificateById`.
 */
export function getCertificateById(id: string): ClientCertificate | null {
  const certificates = getCertificates();
  return certificates.find((c) => c.id === id) || null;
}

/** Unscoped. Internal, for the duplicate guard in `issueCertificate`. */
export function getCertificateByContractId(contractId: string): ClientCertificate | null {
  const certificates = getCertificates();
  return certificates.find((c) => c.contractId === contractId) || null;
}

/**
 * Unscoped. Internal, for the duplicate guard in the issuing workflow. UI must
 * use `getScopedCertificateByProjectId`.
 */
export function getCertificateByProjectId(projectId: string): ClientCertificate | null {
  const certificates = getCertificates();
  return certificates.find((c) => c.projectId === projectId) || null;
}

/** Certificates visible to the caller's tenant. The getter UI lists must use. */
export function getScopedCertificates(ctx: TenantContext): ClientCertificate[] {
  return scopeToTenant(getCertificates(), ctx);
}

/**
 * The single-record reader every UI surface must use.
 *
 * Same rule as the list reader: a certificate outside the caller's tenant comes
 * back as null rather than as a viewable record, so an id guessed from the
 * certificate-number sequence leaks neither the facility nor its compliance
 * standing.
 *
 * Super Admin still reads across tenants — `scopeToTenant` short-circuits on
 * `isCrossTenant` before any filtering.
 */
export function getScopedCertificateById(
  id: string,
  ctx: TenantContext
): ClientCertificate | null {
  const found = getCertificateById(id);
  if (!found) return null;
  return scopeToTenant([found], ctx)[0] ?? null;
}

/** The project-bound certificate visible to the caller's tenant. The getter the UI must use. */
export function getScopedCertificateByProjectId(
  projectId: string,
  ctx: TenantContext
): ClientCertificate | null {
  const found = getCertificateByProjectId(projectId);
  if (!found) return null;
  return scopeToTenant([found], ctx)[0] ?? null;
}
