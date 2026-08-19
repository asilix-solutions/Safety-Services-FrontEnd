import React from "react";
import { ClientContract } from "@/domains/contracts/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { FileCheck2, FileSignature, Archive, Download, Eye } from "lucide-react";
import { getContractStatusBadgeVariant, formatSARCurrency, canSignContract, canArchiveContract } from "../helpers/helpers";
import { useTranslation } from "@/providers/i18n-provider";
import { ActionMenu } from "@/shared/components/action-menu";
import { Badge } from "@/shared/ui/badge";

interface ContractTableProps {
  contracts: ClientContract[];
  isAdmin: boolean;
  userRole: string;
  statusFilter: "all" | "generated" | "signed" | "archived";
  onStatusFilterChange: (filter: "all" | "generated" | "signed" | "archived") => void;
  onSignContract: (contractId: string) => void;
  onArchiveContract: (contractId: string) => void;
  onDownloadContract: (contract: ClientContract) => void;
  onViewDetails: (contract: ClientContract) => void;
}

export function ContractTable({
  contracts,
  isAdmin,
  userRole,
  statusFilter,
  onStatusFilterChange,
  onSignContract,
  onArchiveContract,
  onDownloadContract,
  onViewDetails,
}: ContractTableProps) {
  const { t } = useTranslation();

  const filteredContracts = statusFilter === "all"
    ? contracts
    : contracts.filter((c) => c.status === statusFilter);

  const counts = {
    all: contracts.length,
    generated: contracts.filter((c) => c.status === "generated").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    archived: contracts.filter((c) => c.status === "archived").length,
  };

  const contractColumns: ColumnDef<ClientContract>[] = [
    {
      header: t("common:contracts_id"),
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: t("common:contract_title"),
      accessorKey: "title",
      render: (row) => <span className="font-semibold text-foreground">{row.title || "—"}</span>,
    },
    {
      header: t("common:contracts_value"),
      accessorKey: "value",
      render: (row) => <span>{formatSARCurrency(row.value)}</span>,
    },
    {
      header: t("common:status"),
      accessorKey: "status",
      render: (row) => (
        <Badge variant={getContractStatusBadgeVariant(row.status)} className="uppercase text-[10px]">
          {t(`common:contract_status_${row.status}`)}
        </Badge>
      ),
    },
    {
      header: t("common:contracts_created_at"),
      accessorKey: "createdAt",
      render: (row) => <span className="text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: t("common:actions"),
      render: (row) => {
        const canSign = canSignContract(row, userRole);
        const canArchive = canArchiveContract(row, userRole);

        const menuItems = [
          {
            id: "view-details",
            label: t("common:contracts_audit_details_btn"),
            icon: Eye,
            onClick: () => onViewDetails(row),
          },
          {
            id: "download",
            label: t("common:contracts_download_btn"),
            icon: Download,
            onClick: () => onDownloadContract(row),
          },
          ...(canSign
            ? [
                {
                  id: "sign",
                  label: t("common:contracts_sign_approve"),
                  icon: FileSignature,
                  onClick: () => onSignContract(row.id),
                  separatorBefore: true,
                },
              ]
            : []),
          ...(canArchive
            ? [
                {
                  id: "archive",
                  label: t("common:contracts_archive"),
                  icon: Archive,
                  onClick: () => onArchiveContract(row.id),
                  separatorBefore: true,
                },
              ]
            : []),
        ];

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {isAdmin ? t("common:contracts_table_title_admin") : t("common:contracts_table_title_client")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            <Button
              variant={statusFilter === "all" ? "default" : "ghost"}
              onClick={() => onStatusFilterChange("all")}
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              {t("common:contracts_tab_all")}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "all" ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"}`}>
                {counts.all}
              </span>
            </Button>
            <Button
              variant={statusFilter === "generated" ? "default" : "ghost"}
              onClick={() => onStatusFilterChange("generated")}
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              {t("common:contracts_tab_generated")}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "generated" ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"}`}>
                {counts.generated}
              </span>
            </Button>
            <Button
              variant={statusFilter === "signed" ? "default" : "ghost"}
              onClick={() => onStatusFilterChange("signed")}
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              {t("common:contracts_tab_signed")}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "signed" ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"}`}>
                {counts.signed}
              </span>
            </Button>
            <Button
              variant={statusFilter === "archived" ? "default" : "ghost"}
              onClick={() => onStatusFilterChange("archived")}
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              {t("common:contracts_tab_archived")}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "archived" ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"}`}>
                {counts.archived}
              </span>
            </Button>
          </div>
        )}

        {contracts.length === 0 ? (
          <EmptyState
            title={t("common:contracts_empty_state_title")}
            description={
              isAdmin
                ? t("common:contracts_empty_state_desc_admin")
                : t("common:contracts_empty_state_desc_client")
            }
            icon={<FileCheck2 className="h-6 w-6 text-muted-foreground" />}
          />
        ) : filteredContracts.length === 0 ? (
          <EmptyState
            title={t("common:contracts_no_matching")}
            description={t("common:contracts_no_matching_desc")}
            icon={<FileCheck2 className="h-6 w-6 text-muted-foreground" />}
          />
        ) : (
          <>
            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden space-y-3">
              {filteredContracts.map((c) => {
                const canSign = canSignContract(c, userRole);
                const canArchive = canArchiveContract(c, userRole);

                return (
                  <Card key={c.id} className="p-4 border-border bg-card space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{c.id}</span>
                      <Badge
                        variant={getContractStatusBadgeVariant(c.status)}
                        className="uppercase text-[10px]"
                      >
                        {t(`common:contract_status_${c.status}`)}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-foreground">{c.title || "—"}</p>
                      {c.jobNumber && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {c.jobNumber}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-secondary/20 border border-border/50">
                      <span className="text-muted-foreground">{t("common:contracts_value")}:</span>
                      <span className="font-bold text-foreground">{formatSARCurrency(c.value)}</span>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(c)}
                          className="h-8 text-xs gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("common:contracts_audit_details_btn") || "Details"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadContract(c)}
                          className="h-8 text-xs gap-1.5 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        {canSign && (
                          <Button
                            size="sm"
                            onClick={() => onSignContract(c.id)}
                            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                          >
                            <FileSignature className="h-3.5 w-3.5" />
                            {t("common:contracts_sign_approve")}
                          </Button>
                        )}
                        {canArchive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onArchiveContract(c.id)}
                            className="h-8 text-xs gap-1.5 cursor-pointer"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block">
              <DataTable
                data={filteredContracts}
                columns={contractColumns}
                searchKey="title"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
export default ContractTable;
