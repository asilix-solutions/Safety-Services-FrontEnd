import React from "react";
import { Project } from "@/types/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { ActionButton } from "@/shared/components/action-button";
import { Plus, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

interface ReadyToGenerateSectionProps {
  projects: Project[];
  onGenerateContract: (project: Project) => void;
}

export function ReadyToGenerateSection({
  projects,
  onGenerateContract,
}: ReadyToGenerateSectionProps) {
  const { t } = useTranslation();

  if (projects.length === 0) return null;

  const projectColumns: ColumnDef<Project>[] = [
    {
      header: t("common:contracts_project_id"),
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: t("common:contracts_project_name"),
      accessorKey: "name",
      render: (row) => <span className="font-semibold text-foreground">{row.name || "—"}</span>,
    },
    {
      header: t("common:contracts_client_name"),
      accessorKey: "clientName",
      render: (row) => <span>{row.clientName || "—"}</span>,
    },
    {
      header: t("common:contracts_completion_status"),
      render: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          {t("common:status_Completed").toUpperCase()}
        </span>
      ),
    },
    {
      header: t("common:actions"),
      render: (row) => (
        <ActionButton
          label={t("common:contracts_generate_btn")}
          icon={Plus}
          onClick={() => onGenerateContract(row)}
          className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border-none"
        />
      ),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
          {t("common:contracts_ready_to_generate")}
        </CardTitle>
        <CardDescription>
          {t("common:contracts_ready_to_generate_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={projects}
          columns={projectColumns}
          searchKey="name"
        />
      </CardContent>
    </Card>
  );
}

