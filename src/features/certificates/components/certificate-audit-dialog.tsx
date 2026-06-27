import React from "react";
import { ClientCertificate } from "@/domains/certificates/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Award, Download, ArrowDown } from "lucide-react";
import {
  deriveCertificateDisplayStatus,
  getRemainingValidityDays,
  getExpirationWarningLevel,
  getRemainingValidityText,
  getExpirationBadgeVariant
} from "../helpers/formatters";
import { useTranslation } from "@/providers/i18n-provider";

interface CertificateAuditDialogProps {
  certificate: ClientCertificate | null;
  onClose: () => void;
  onDownloadCertificate: (certificate: ClientCertificate) => void;
}

export function CertificateAuditDialog({
  certificate,
  onClose,
  onDownloadCertificate,
}: CertificateAuditDialogProps) {
  const { t } = useTranslation();
  if (!certificate) return null;

  const displayStatus = deriveCertificateDisplayStatus(certificate.status, certificate.expiresAt);
  const remainingDays = getRemainingValidityDays(certificate.expiresAt);
  const warningLevel = getExpirationWarningLevel(certificate.expiresAt, certificate.status);
  const warningBadgeVariant = getExpirationBadgeVariant(certificate.expiresAt, certificate.status);

  const formatDateTime = (dateStr?: string | null): string => {
    if (!dateStr) return t("common:certificates_milestone_not_reached") || "Not Reached";
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const archivedDate = certificate.contractSnapshot?.archivedAt || null;
  const isRevoked = certificate.status === "revoked";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <Card className="max-w-md w-full border-border bg-card shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-primary" />
            {t("common:certificates_audit_title")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("common:certificates_audit_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* 1. Certificate Summary Section */}
          <div className="space-y-3 bg-secondary/20 p-3 rounded-lg border border-border">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">
              {t("common:certificateSummary.title")}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificateSummary.type")}</span>
                <span className="font-semibold text-foreground">
                  {certificate.type && ["safety", "installation", "maintenance"].includes(certificate.type)
                    ? t(`common:certificateTypes.${certificate.type}`)
                    : t("common:certificateTypes.safety")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificateSummary.facilityName")}</span>
                <span className="font-semibold text-foreground">{certificate.facilityName || certificate.title || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificateSummary.duration")}</span>
                <span className="font-semibold text-foreground">365 {t("common:remainingValidity.days") || "Days"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificateSummary.validityDays")}</span>
                <span className="font-semibold text-foreground">{remainingDays}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-0.5">{t("common:certificateSummary.warningLevel")}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${warningBadgeVariant} uppercase`}>
                  {t(`common:warningLevels.${warningLevel}`)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* 2. Lifecycle Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">
              {t("common:certificates_lifecycle")}
            </h4>
            <div className="flex flex-col items-center gap-1.5 pt-1">
              {/* Contract Archived */}
              <div className="w-full flex items-center justify-between text-foreground">
                <span className="font-semibold">{t("common:certificates_milestone_contract_archived")}</span>
                <span className="text-muted-foreground font-mono text-[10px]">{formatDateTime(archivedDate)}</span>
              </div>

              <ArrowDown className="h-3 w-3 text-muted-foreground/60" />

              {/* Certificate Issued */}
              <div className="w-full flex items-center justify-between text-foreground">
                <span className="font-semibold">{t("common:certificates_milestone_issued")}</span>
                <span className="text-muted-foreground font-mono text-[10px]">{formatDateTime(certificate.issuedAt)}</span>
              </div>

              <ArrowDown className="h-3 w-3 text-muted-foreground/60" />

              {/* Certificate Valid Until */}
              <div className="w-full flex items-center justify-between text-foreground">
                <span className="font-semibold">{t("common:certificates_milestone_valid_until")}</span>
                <span className="text-muted-foreground font-mono text-[10px]">{formatDateTime(certificate.expiresAt)}</span>
              </div>

              {isRevoked && (
                <>
                  <ArrowDown className="h-3 w-3 text-red-500/60" />

                  {/* Certificate Revoked */}
                  <div className="w-full flex items-center justify-between text-red-600 dark:text-red-400">
                    <span className="font-bold">{t("common:certificates_milestone_revoked")}</span>
                    <span className="font-mono text-[10px]">{formatDateTime(certificate.revokedAt)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* 3. Audit Trail Section (General Information + Issued Logs) */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">
              {t("common:certificates_general_info")} & {t("common:certificates_audit_trail")}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_id")}</span>
                <span className="font-mono font-semibold text-foreground">{certificate.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_contract_id")}</span>
                <span className="font-mono font-semibold text-foreground">{certificate.contractId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_project_id")}</span>
                <span className="font-mono font-semibold text-foreground">{certificate.projectId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_job_number")}</span>
                <span className="font-mono font-semibold text-foreground">{certificate.jobNumber || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_client_company")}</span>
                <span className="font-semibold text-foreground">{certificate.clientId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_tenant")}</span>
                <span className="font-semibold text-foreground">{certificate.tenantId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_display_status")}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary uppercase">
                  {t(`common:certificates_tab_${displayStatus}`)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_workflow_status")}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground uppercase">
                  {t(`common:certificates_tab_${certificate.status}`)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_issued_by")}</span>
                <span className="font-semibold text-foreground">{certificate.issuedBy}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:certificates_issued_at")}</span>
                <span className="font-semibold text-foreground">{formatDateTime(certificate.issuedAt)}</span>
              </div>
            </div>
          </div>

          {isRevoked && (
            <>
              <div className="border-t border-border" />
              <div className="space-y-3">
                <h4 className="font-semibold text-[10px] text-red-500 tracking-wider uppercase">
                  {t("common:certificates_revocation_info")}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{t("common:certificates_revoked_at")}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{formatDateTime(certificate.revokedAt)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{t("common:certificates_revoked_by")}</span>
                    <span className="font-semibold text-foreground">{certificate.revokedBy || "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block mb-0.5">{t("common:certificates_revocation_reason")}</span>
                    <span className="font-semibold text-foreground">{certificate.revokedReason || "—"}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-border" />

          {/* 4. Actions Section / Download */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadCertificate(certificate)}
              className="gap-1.5 h-8 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {t("common:certificates_download_btn")}
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              {t("common:cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
