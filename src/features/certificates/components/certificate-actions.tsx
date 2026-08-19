import React from "react";
import { ClientCertificate } from "@/domains/certificates/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Award, Download, History, Calendar, FileText } from "lucide-react";
import {
  deriveCertificateDisplayStatus,
  getRemainingValidityDays,
  getExpirationWarningLevel,
  getCertificateStatusBadgeVariant,
} from "../helpers/formatters";
import { useTranslation } from "@/providers/i18n-provider";

interface CertificateActionsProps {
  certificate: ClientCertificate | null;
  onClose: () => void;
  onDownloadCertificate: (certificate: ClientCertificate) => void;
}

export function CertificateActions({
  certificate,
  onClose,
  onDownloadCertificate,
}: CertificateActionsProps) {
  const { t, dir } = useTranslation();
  const side = dir === "rtl" ? "right" : "left";
  if (!certificate) return null;

  const displayStatus = deriveCertificateDisplayStatus(certificate.status, certificate.expiresAt);
  const remainingDays = getRemainingValidityDays(certificate.expiresAt);
  const warningLevel = getExpirationWarningLevel(certificate.expiresAt, certificate.status);
  const badgeVariant = getCertificateStatusBadgeVariant(certificate.status, certificate.expiresAt);

  const formatDateTime = (dateStr?: string | null): string => {
    if (!dateStr) return t("common:certificates_milestone_not_reached") || "Not Reached";
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const archivedDate = certificate.contractSnapshot?.archivedAt || null;
  const isRevoked = certificate.status === "revoked" || certificate.status === "REVOKED";

  return (
    <Sheet open={!!certificate} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side={side} className="w-full sm:max-w-md h-full p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6 flex-1">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <SheetTitle className="text-lg font-bold text-foreground">
                {t("common:certificates_audit_title") || "Compliance Certificate Details"}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground font-mono mt-1">{certificate.id}</SheetDescription>
            <div className="flex gap-2 mt-2">
              <Badge variant={badgeVariant} className="uppercase text-[10px]">
                {t(`common:certificates_tab_${displayStatus}`).toUpperCase()}
              </Badge>
              <Badge variant="outline" className="uppercase text-[10px]">
                {certificate.type && ["safety", "installation", "maintenance"].includes(certificate.type)
                  ? t(`common:certificateTypes.${certificate.type}`)
                  : t("common:certificateTypes.safety")}
              </Badge>
            </div>
          </div>

          {/* Section 1: Snapshots */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-secondary/15">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {t("common:certificates_snapshots_title") || "Immutable Registry Snapshot"}
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  {t("common:certificateSummary.facilityName") || "Facility / Scope"}
                </span>
                <span className="font-semibold text-foreground">
                  {certificate.facilitySnapshot?.facilityName || certificate.facilityName || "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  {t("common:certificates_client_company") || "Customer Company"}
                </span>
                <span className="font-semibold text-foreground">
                  {certificate.customerSnapshot?.companyName || certificate.clientId || "—"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    {t("common:certificates_job_number") || "Job Number"}
                  </span>
                  <span className="font-mono text-foreground">
                    {certificate.originatingSnapshot?.requestJobNumber || certificate.jobNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    {t("common:certificates_project_id") || "Project ID"}
                  </span>
                  <span className="font-mono text-foreground">{certificate.projectId || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Validity */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-secondary/15">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {t("common:certificates_validity_title") || "Validity & Schedule"}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  {t("common:certificates_issued_at") || "Issued At"}
                </span>
                <span className="font-semibold text-foreground">{formatDateTime(certificate.issuedAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  {t("common:certificates_expires_at") || "Expires At"}
                </span>
                <span className="font-semibold text-foreground">{formatDateTime(certificate.expiresAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  {t("common:certificates_issued_by") || "Issued By"}
                </span>
                <span className="font-semibold text-foreground">{certificate.issuedBy}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  {t("common:certificateSummary.validityDays") || "Remaining Days"}
                </span>
                <span className="font-semibold text-foreground">{remainingDays} {t("common:days") || "days"}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Timeline & Audit */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-secondary/15">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
              <History className="h-4 w-4 text-muted-foreground" />
              {t("common:certificates_timeline") || "Audit Timeline"}
            </h4>
            <div className="space-y-3 text-xs ps-2 border-s-2 border-primary/20 ms-2">
              <div className="relative">
                <span className="absolute -start-[15px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="font-semibold block">{t("common:certificates_milestone_issued") || "Certificate Issued"}</span>
                <span className="text-[10px] text-muted-foreground">{formatDateTime(certificate.issuedAt)}</span>
              </div>
              
              <div className="relative">
                <span className="absolute -start-[15px] top-1 h-2.5 w-2.5 rounded-full bg-success" />
                <span className="font-semibold block">{t("common:certificates_milestone_downloaded") || "PDF Access Registered"}</span>
                <span className="text-[10px] text-muted-foreground">{t("common:certificates_timeline_download_desc") || "System ready for branded verification download"}</span>
              </div>

              {isRevoked && (
                <div className="relative text-destructive">
                  <span className="absolute -start-[15px] top-1 h-2.5 w-2.5 rounded-full bg-destructive" />
                  <span className="font-bold block">{t("common:certificates_milestone_revoked") || "Certificate Revoked"}</span>
                  <span className="text-[10px] block">{formatDateTime(certificate.revokedAt)}</span>
                  <span className="text-[10px] block mt-0.5 text-muted-foreground">
                    {t("common:certificates_revoked_by") || "By"}: {certificate.revokedBy || "—"}
                  </span>
                  <span className="text-[10px] block mt-0.5 text-muted-foreground">
                    {t("common:certificates_revocation_reason") || "Reason"}: {certificate.revokedReason || "—"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-border flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadCertificate(certificate)}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {t("common:certificates_download_btn") || "Download PDF"}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose} className="cursor-pointer">
            {t("common:close")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
export default CertificateActions;
