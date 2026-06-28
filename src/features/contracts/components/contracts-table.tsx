import React from "react";
import { ClientContract } from "@/domains/contracts/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { FileCheck2, FileSignature, Archive, Download, Eye } from "lucide-react";
import { getContractStatusBadgeClass, formatSARCurrency } from "../helpers/formatters";

import { useTranslation } from "@/providers/i18n-provider";
import { ActionMenu } from "@/shared/components/action-menu";

interface ContractsTableProps {
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

export function ContractsTable({
  contracts,
  isAdmin,
  userRole,
  statusFilter,
  onStatusFilterChange,
  onSignContract,
  onArchiveContract,
  onDownloadContract,
  onViewDetails,
}: ContractsTableProps) {
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
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getContractStatusBadgeClass(row.status)}`}>
          {t(`common:contract_status_${row.status}`)}
        </span>
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
        const canSign = row.status === "generated" && userRole === "Client";
        const canArchive = row.status === "signed" && isAdmin;

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
              className="h-8 gap-1.5 text-xs"
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
              className="h-8 gap-1.5 text-xs"
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
              className="h-8 gap-1.5 text-xs"
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
              className="h-8 gap-1.5 text-xs"
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
          <DataTable
            data={filteredContracts}
            columns={contractColumns}
            searchKey="title"
          />
        )}
      </CardContent>
    </Card>
  );
}
