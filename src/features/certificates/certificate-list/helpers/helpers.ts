import { ClientCertificate } from "@/domains/certificates/types";

export type CertificateDisplayStatus = "active" | "expired" | "revoked";

export function deriveCertificateDisplayStatus(
  status: "active" | "revoked",
  expiresAt: string
): CertificateDisplayStatus {
  if (status === "revoked") return "revoked";
  if (status === "active" && new Date(expiresAt) < new Date()) {
    return "expired";
  }
  return "active";
}

export function getCertificateStatusBadgeVariant(
  status: "active" | "revoked",
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

export function getRemainingValidityText(expiresAt: string, status: "active" | "revoked", t: any): string {
  if (status === "revoked") {
    return t("common:remainingValidity.revoked") || "Revoked";
  }
  const days = getRemainingValidityDays(expiresAt);
  if (days <= 0) {
    return t("common:remainingValidity.expired") || "Expired";
  }
  const text = t("common:remainingValidity.daysRemaining") || "{days} days remaining";
  return text.replace("{days}", String(days));
}

export function getExpirationWarningLevel(expiresAt: string, status: "active" | "revoked"): "normal" | "warning" | "critical" {
  if (status === "revoked") return "critical";
  const days = getRemainingValidityDays(expiresAt);
  if (days > 90) return "normal";
  if (days >= 30) return "warning";
  return "critical";
}

export function canIssueCertificate(userRole: string): boolean {
  return ["Company Admin", "Super Admin"].includes(userRole);
}

export function canRevokeCertificate(certificate: ClientCertificate, userRole: string): boolean {
  return certificate.status === "active" && ["Company Admin", "Super Admin"].includes(userRole);
}
