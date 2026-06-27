import React from "react";
import { Project } from "@/types/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { Button } from "@/shared/ui/button";
import { Plus, ShieldAlert } from "lucide-react";

interface ReadyToGenerateSectionProps {
  projects: Project[];
  onGenerateContract: (project: Project) => void;
}

export function ReadyToGenerateSection({
  projects,
  onGenerateContract,
}: ReadyToGenerateSectionProps) {
  if (projects.length === 0) return null;

  const projectColumns: ColumnDef<Project>[] = [
    {
      header: "Project ID",
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: "Project Name",
      accessorKey: "name",
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    {
      header: "Client Name",
      accessorKey: "clientName",
      render: (row) => <span>{row.clientName}</span>,
    },
    {
      header: "Completion Status",
      render: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          COMPLETED
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <Button
          size="sm"
          onClick={() => onGenerateContract(row)}
          className="h-8 gap-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Generate Contract
        </Button>
      ),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
          Projects Ready for Contract Generation
        </CardTitle>
        <CardDescription>
          These projects are completed but do not yet have signed completion contracts or legal closure agreements.
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
