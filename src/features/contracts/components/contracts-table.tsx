import React from "react";
import { ClientContract } from "@/domains/contracts/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { FileCheck2, FileSignature, Archive, Download, Eye } from "lucide-react";
import { getContractStatusBadgeClass, formatSARCurrency } from "../helpers/formatters";

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
      header: "Contract ID",
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: "Title",
      accessorKey: "title",
      render: (row) => <span className="font-semibold text-foreground">{row.title}</span>,
    },
    {
      header: "Value (SAR)",
      accessorKey: "value",
      render: (row) => <span>{formatSARCurrency(row.value)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getContractStatusBadgeClass(row.status)}`}>
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Created Date",
      accessorKey: "createdAt",
      render: (row) => <span className="text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "generated" && userRole === "Client" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSignContract(row.id)}
              className="h-8 gap-1 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
            >
              <FileSignature className="h-3.5 w-3.5" />
              Sign & Approve
            </Button>
          )}
          {row.status === "signed" && isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onArchiveContract(row.id)}
              className="h-8 gap-1 text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(row)}
            className="h-8 gap-1 text-xs border-border hover:bg-secondary/40"
          >
            <Eye className="h-3.5 w-3.5" />
            Audit Details
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownloadContract(row)}
            className="h-8 gap-1 text-xs hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {isAdmin ? "All Compliance Agreements" : "My Agreements"}
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
              All
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
              Generated
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
              Signed
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
              Archived
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "archived" ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"}`}>
                {counts.archived}
              </span>
            </Button>
          </div>
        )}

        {contracts.length === 0 ? (
          <EmptyState
            title="No agreements found"
            description={
              isAdmin
                ? "Contracts will appear here once generated for completed projects."
                : "No completion agreements have been issued to your account yet."
            }
            icon={<FileCheck2 className="h-6 w-6 text-muted-foreground" />}
          />
        ) : filteredContracts.length === 0 ? (
          <EmptyState
            title="No matching agreements"
            description={`There are no contracts currently in the "${statusFilter}" status.`}
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
