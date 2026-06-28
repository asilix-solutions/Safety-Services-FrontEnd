import React from "react";
import { ClientContract } from "@/domains/contracts/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { ActionButton } from "@/shared/components/action-button";
import { Plus, Award } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

interface ReadyToIssueSectionProps {
  contracts: ClientContract[];
  onIssueCertificate: (contract: ClientContract) => void;
}

export function ReadyToIssueSection({
  contracts,
  onIssueCertificate,
}: ReadyToIssueSectionProps) {
  const { t } = useTranslation();

  if (contracts.length === 0) return null;

  const columns: ColumnDef<ClientContract>[] = [
    {
      header: t("common:certificates_contract_id"),
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: t("common:title") || "Title",
      accessorKey: "title",
      render: (row) => <span className="font-semibold text-foreground">{row.title}</span>,
    },
    {
      header: t("common:certificates_job_number"),
      accessorKey: "jobNumber",
      render: (row) => <span className="font-mono text-xs">{row.jobNumber}</span>,
    },
    {
      header: t("common:status") || "Status",
      render: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
          {t("common:certificates_milestone_contract_archived").toUpperCase()}
        </span>
      ),
    },
    {
      header: t("common:actions") || "Actions",
      render: (row) => (
        <ActionButton
          label={t("common:certificates_issue_btn")}
          icon={Plus}
          onClick={() => onIssueCertificate(row)}
          className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border-none"
        />
      ),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-emerald-500" />
          {t("common:certificates_ready_to_issue")}
        </CardTitle>
        <CardDescription>
          {t("common:certificates_ready_to_issue_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={contracts}
          columns={columns}
          searchKey="title"
        />
      </CardContent>
    </Card>
  );
}
