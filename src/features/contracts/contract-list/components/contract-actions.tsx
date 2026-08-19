import React from "react";
import { ClientContract } from "@/domains/contracts/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FileCheck2, Download } from "lucide-react";
import { formatSARCurrency, formatDateTime, getContractStatusBadgeVariant } from "../helpers/helpers";
import { useTranslation } from "@/providers/i18n-provider";

interface ContractActionsProps {
  contract: ClientContract | null;
  onClose: () => void;
  onDownloadContract: (contract: ClientContract) => void;
}

export function ContractActions({
  contract,
  onClose,
  onDownloadContract,
}: ContractActionsProps) {
  const { t } = useTranslation();

  const [activeContract, setActiveContract] = React.useState<ClientContract | null>(contract);

  React.useEffect(() => {
    if (contract) setActiveContract(contract);
  }, [contract]);

  const currentContract = contract || activeContract;
  if (!currentContract) return null;

  return (
    <Dialog open={!!contract} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck2 className="h-4.5 w-4.5 text-primary" />
            {t("common:contracts_dialog_title")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("common:contracts_dialog_desc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* General Information Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">{t("common:contracts_general_info")}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_id")}</span>
                <span className="font-mono font-semibold text-foreground">{currentContract.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_project_id")}</span>
                <span className="font-mono font-semibold text-foreground">{currentContract.projectId || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_job_number")}</span>
                <span className="font-mono font-semibold text-foreground">{currentContract.jobNumber || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_client_company")}</span>
                <span className="font-semibold text-foreground">{currentContract.clientId || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_tenant")}</span>
                <span className="font-semibold text-foreground">{currentContract.tenantId || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_value")}</span>
                <span className="font-semibold text-foreground">{formatSARCurrency(currentContract.value)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_current_status")}</span>
                <Badge variant={getContractStatusBadgeVariant(currentContract.status)} className="uppercase text-[9px] mt-0.5">
                  {t(`common:contract_status_${currentContract.status}`)}
                </Badge>
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
                <span className="font-semibold text-foreground">{formatDateTime(currentContract.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_signed_by")}</span>
                <span className="font-semibold text-foreground">{currentContract.signedBy || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_signed_at")}</span>
                <span className="font-semibold text-foreground">{formatDateTime(currentContract.signedAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_archived_by")}</span>
                <span className="font-semibold text-foreground">{currentContract.archivedBy || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("common:contracts_archived_at")}</span>
                <span className="font-semibold text-foreground">{formatDateTime(currentContract.archivedAt)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Actions Section */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadContract(currentContract)}
              className="gap-1.5 h-8 text-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              {t("common:contracts_download_btn")}
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="h-8 text-xs cursor-pointer"
            >
              {t("common:contracts_close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default ContractActions;
