import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";

interface WorkspaceHeaderProps {
  projectId: string;
  projectName: string;
  clientName: string;
  projectStatus: string;
  projectProgramLabel: string;
  backText: string;
  workspaceTitle: string;
}

export function WorkspaceHeader({
  projectId,
  projectName,
  clientName,
  projectStatus,
  projectProgramLabel,
  backText,
  workspaceTitle
}: WorkspaceHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <PageHeader
          title={`${workspaceTitle}: ${projectId}`}
          description={`${projectName} (${clientName})`}
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-1 rounded">
          {projectProgramLabel}
        </span>
        <StatusBadge status={projectStatus} type="project" />
      </div>
    </div>
  );
}
