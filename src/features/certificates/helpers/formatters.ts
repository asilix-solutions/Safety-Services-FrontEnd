import { ClientCertificate, CertificateStatus } from "@/domains/certificates/types";

export type CertificateDisplayStatus = "active" | "expired" | "revoked";

export function deriveCertificateDisplayStatus(
  status: CertificateStatus,
  expiresAt: string
): CertificateDisplayStatus {
  if (status === "revoked" || status === "REVOKED") return "revoked";
  if ((status === "active" || status === "ISSUED") && new Date(expiresAt) < new Date()) {
    return "expired";
  }
  return "active";
}

export function getCertificateStatusBadgeClass(
  status: CertificateStatus,
  expiresAt: string
): string {
  const displayStatus = deriveCertificateDisplayStatus(status, expiresAt);
  switch (displayStatus) {
    case "active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "expired":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    case "revoked":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

export function getCertificateStatusBadgeVariant(
  status: CertificateStatus,
  expiresAt: string
): "success" | "destructive" | "warning" | "default" | "secondary" | "outline" {
  const displayStatus = deriveCertificateDisplayStatus(status, expiresAt);
  switch (displayStatus) {
    case "active":
      return "success";
    case "expired":
      return "destructive";
    case "revoked":
      return "warning";
    default:
      return "default";
  }
}

export function getRemainingValidityDays(expiresAt: string): number {
  const diffTime = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export function getRemainingValidityText(expiresAt: string, status: CertificateStatus, t: any): string {
  if (status === "revoked" || status === "REVOKED") {
    return t("common:remainingValidity.revoked") || "Revoked";
  }
  const days = getRemainingValidityDays(expiresAt);
  if (days <= 0) {
    return t("common:remainingValidity.expired") || "Expired";
  }
  const text = t("common:remainingValidity.daysRemaining") || "{days} days remaining";
  return text.replace("{days}", String(days));
}

export function getExpirationWarningLevel(expiresAt: string, status: CertificateStatus): "normal" | "warning" | "critical" {
  if (status === "revoked" || status === "REVOKED") return "critical";
  const days = getRemainingValidityDays(expiresAt);
  if (days > 90) return "normal";
  if (days >= 30) return "warning";
  return "critical";
}

export function getExpirationBadgeVariant(expiresAt: string, status: CertificateStatus): string {
  const level = getExpirationWarningLevel(expiresAt, status);
  switch (level) {
    case "normal":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "critical":
    default:
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  }
}

export function canIssueCertificate(userRole: string): boolean {
  return ["Company Admin", "Super Admin"].includes(userRole);
}

export function canRevokeCertificate(certificate: ClientCertificate, userRole: string): boolean {
  return (certificate.status === "active" || certificate.status === "ISSUED") && ["Company Admin", "Super Admin"].includes(userRole);
}
