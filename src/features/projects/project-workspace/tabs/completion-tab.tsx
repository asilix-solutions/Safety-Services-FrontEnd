import React from "react";
import { Project } from "@/types/project";
import { EmptyState } from "@/shared/components/empty-state";
import { CheckCircle } from "lucide-react";
import { ProjectCompletedCard } from "../components/project-completed-card";

interface CompletionTabProps {
  project: Project;
  t: (key: string) => string;
}

export function CompletionTab({ project, t }: CompletionTabProps) {
  if (project.executionPhase !== "COMPLETED") {
    return (
      <EmptyState
        icon={<CheckCircle />}
        title={t("projects:completed.title") || "Project Completed & Approved"}
        description={t("projects:inspection.awaitingDecisionDesc") || "Closure details appear here once the project is completed."}
      />
    );
  }

  return <ProjectCompletedCard project={project} t={t} />;
}
