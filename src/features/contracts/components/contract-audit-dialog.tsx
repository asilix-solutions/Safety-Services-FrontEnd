import React from "react";
import { ClientContract } from "@/domains/contracts/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { FileCheck2, Download } from "lucide-react";
import { formatSARCurrency, formatDateTime } from "../helpers/formatters";

import { useTranslation } from "@/providers/i18n-provider";

interface ContractAuditDialogProps {
  contract: ClientContract | null;
  onClose: () => void;
  onDownloadContract: (contract: ClientContract) => void;
}

export function ContractAuditDialog({
  contract,
  onClose,
  onDownloadContract,
}: ContractAuditDialogProps) {
  const { t } = useTranslation();

  if (!contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <Card className="max-w-md w-full border-border bg-card shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck2 className="h-4.5 w-4.5 text-primary" />
            {t("common:contracts_dialog_title")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("common:contracts_dialog_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* General Information Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">{t("common:contracts_general_info")}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_id")}</span>
                <span className="font-mono font-semibold text-foreground">{contract.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_project_id")}</span>
                <span className="font-mono font-semibold text-foreground">{contract.projectId || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_job_number")}</span>
                <span className="font-mono font-semibold text-foreground">{contract.jobNumber || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_client_company")}</span>
                <span className="font-semibold text-foreground">{contract.clientId || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_tenant")}</span>
                <span className="font-semibold text-foreground">{contract.tenantId || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_value")}</span>
                <span className="font-semibold text-foreground">{formatSARCurrency(contract.value)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_current_status")}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                  {t(`common:contract_status_${contract.status}`)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Lifecycle Audit Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">{t("common:contracts_lifecycle_trail")}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_created_at")}</span>
                <span className="font-semibold text-foreground">{formatDateTime(contract.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_signed_by")}</span>
                <span className="font-semibold text-foreground">{contract.signedBy || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_signed_at")}</span>
                <span className="font-semibold text-foreground">{formatDateTime(contract.signedAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_archived_by")}</span>
                <span className="font-semibold text-foreground">{contract.archivedBy || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_archived_at")}</span>
                <span className="font-semibold text-foreground">{formatDateTime(contract.archivedAt)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Actions Section */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadContract(contract)}
              className="gap-1.5 h-8 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {t("common:contracts_download_btn")}
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              {t("common:contracts_close")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
