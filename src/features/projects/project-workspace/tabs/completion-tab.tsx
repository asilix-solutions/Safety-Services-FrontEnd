import React from "react";
import { Project } from "@/types/project";
import { EmptyState } from "@/shared/components/empty-state";
import { CheckCircle } from "lucide-react";
import { ProjectCompletedCard } from "../components/project-completed-card";
import { ClosurePanel } from "../closure";

interface CompletionTabProps {
  project: Project;
  t: (key: string) => string;
}

export function CompletionTab({ project, t }: CompletionTabProps) {
  return (
    <div className="space-y-6">
      {project.executionPhase !== "COMPLETED" ? (
        <EmptyState
          icon={<CheckCircle />}
          title={t("projects:completed.title") || "Project Completed & Approved"}
          description={t("projects:inspection.awaitingDecisionDesc") || "Closure details appear here once the project is completed."}
        />
      ) : (
        <ProjectCompletedCard project={project} t={t} />
      )}
      <ClosurePanel projectId={project.id} />
    </div>
  );
}
