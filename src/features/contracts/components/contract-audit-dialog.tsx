import React from "react";
import { ClientContract } from "@/domains/contracts/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { FileCheck2, Download } from "lucide-react";
import { formatSARCurrency, formatDateTime } from "../helpers/formatters";

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
  if (!contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <Card className="max-w-md w-full border-border bg-card shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck2 className="h-4.5 w-4.5 text-primary" />
            Completion Agreement Details
          </CardTitle>
          <CardDescription className="text-xs">
            Detailed audit trail and legal completion metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* General Information Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">General Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block mb-0.5">Contract ID</span>
                <span className="font-mono font-semibold text-foreground">{contract.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Project ID</span>
                <span className="font-mono font-semibold text-foreground">{contract.projectId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Job Number</span>
                <span className="font-mono font-semibold text-foreground">{contract.jobNumber || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Client Company</span>
                <span className="font-semibold text-foreground">{contract.clientId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Tenant</span>
                <span className="font-semibold text-foreground">{contract.tenantId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Contract Value</span>
                <span className="font-semibold text-foreground">{formatSARCurrency(contract.value)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Current Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary uppercase">
                  {contract.status}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Lifecycle Audit Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">Lifecycle & Audit Trail</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block mb-0.5">Created At</span>
                <span className="font-semibold text-foreground">{formatDateTime(contract.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Signed By</span>
                <span className="font-semibold text-foreground">{contract.signedBy || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Signed At</span>
                <span className="font-semibold text-foreground">{formatDateTime(contract.signedAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Archived By</span>
                <span className="font-semibold text-foreground">{contract.archivedBy || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Archived At</span>
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
              Download Contract
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
