"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { Eye, Briefcase } from "lucide-react";
import Link from "next/link";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Project } from "@/types/project";
import { getProjects } from "@/domains/projects/storage";
import { StatusBadge } from "@/shared/components/status-badge";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["projects", "common"]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const list = getProjects();
    if (user?.role === "Client") {
      const filtered = list.filter((p) => p.clientId === user.companyId);
      setProjects(filtered);
    } else {
      setProjects(list);
    }
  }, [user]);

  if (!user) return null;

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
        <StatusBadge status={row.executionPhase === "ready_for_final_inspection" ? "ready_for_final_inspection" : row.status} type="project" />
      ),
    },
    {
      header: t("common:actions") || "Actions",
      render: (row) => (
        <Link href={`/projects/${row.id}`}>
          <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <Eye className="h-3.5 w-3.5" />
            {t("common:view") || "View"}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("projects:list.title") || "Safety Execution Projects"}
        description={t("projects:list.desc") || "Monitor active compliance projects and licensing requests."}
      />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t("projects:list.title") || "Safety Execution Projects"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <EmptyState
              title={t("projects:emptyTitle") || "No compliance projects found"}
              description={t("projects:emptyDesc") || "Approved compliance requests will populate execution projects here."}
              icon={<Briefcase className="h-6 w-6 text-muted-foreground" />}
            />
          ) : (
            <DataTable
              data={projects}
              columns={columns}
              searchKey="name"
              searchPlaceholder={t("common:search") || "Search..."}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
