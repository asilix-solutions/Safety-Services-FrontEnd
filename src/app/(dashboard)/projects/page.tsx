"use client";
import { useTenantContext } from "@/hooks/use-tenant-context";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/shared/components/page-header";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Project } from "@/types/project";
import { getScopedProjects } from "@/domains/projects/storage";
import { isRole } from "@/constants/permissions";
import { ProjectsTable } from "@/features/projects/components/projects-table";

export default function ProjectsPage() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();
  useNamespaceTranslations(["projects", "common"]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const list = getScopedProjects(tenantContext);
    if (isRole(user?.role, ["Client"])) {
      const filtered = list.filter((p) => p.clientId === user!.companyId);
      setProjects(filtered);
    } else {
      setProjects(list);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("projects:list.title") || "Safety Execution Projects"}
        description={t("projects:list.desc") || "Monitor active compliance projects and licensing requests."}
      />

      <ProjectsTable projects={projects} />
    </div>
  );
}
