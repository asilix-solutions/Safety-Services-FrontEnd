"use client";

import React from "react";
import { Project } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { StatusBadge } from "@/shared/components/status-badge";
import { Eye, Briefcase, Building2, Layers } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";

interface ProjectsTableProps {
  projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const { t } = useTranslation();

  const columns: ColumnDef<Project>[] = [
    {
      header: t("projects:details.id") || "Project ID",
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: t("projects:details.jobNumber") || "Job Number",
      accessorKey: "jobNumber",
      render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.jobNumber}</span>,
    },
    {
      header: t("projects:projectName") || "Project Name",
      accessorKey: "name",
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    {
      header: t("projects:client") || "Client",
      accessorKey: "clientName",
      render: (row) => <span>{row.clientName}</span>,
    },
    {
      header: t("projects:status") || "Status",
      accessorKey: "status",
      render: (row) => (
        <StatusBadge
          status={
            row.executionPhase === "READY_FOR_FINAL_INSPECTION"
              ? "READY_FOR_FINAL_INSPECTION"
              : row.status
          }
          type="project"
        />
      ),
    },
    {
      header: t("common:actions") || "Actions",
      render: (row) => (
        <Link href={`/projects/${row.id}`}>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Eye className="h-3.5 w-3.5" />
            {t("common:view") || "View"}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {t("projects:list.title") || "Safety Execution Projects"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <EmptyState
            title={t("projects:emptyTitle") || "No compliance projects found"}
            description={
              t("projects:emptyDesc") ||
              "Approved compliance requests will populate execution projects here."
            }
            icon={<Briefcase className="h-6 w-6 text-muted-foreground" />}
          />
        ) : (
          <>
            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden space-y-3">
              {projects.map((prj) => (
                <Card key={prj.id} className="p-4 border-border bg-card space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{prj.id}</span>
                    <StatusBadge
                      status={
                        prj.executionPhase === "READY_FOR_FINAL_INSPECTION"
                          ? "READY_FOR_FINAL_INSPECTION"
                          : prj.status
                      }
                      type="project"
                    />
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-foreground">{prj.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{prj.clientName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground p-2 rounded-lg bg-secondary/20 border border-border/50">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{t("projects:details.jobNumber") || "Job No."}:</span>
                    </div>
                    <span className="font-mono font-medium text-foreground">{prj.jobNumber}</span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-end">
                    <Link href={`/projects/${prj.id}`}>
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("common:view") || "View"}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block">
              <DataTable
                data={projects}
                columns={columns}
                searchKey="name"
                searchPlaceholder={t("common:search") || "Search..."}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ProjectsTable;
