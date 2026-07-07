import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { FinalInspectionPanel } from "@/features/projects/final-inspection";

interface InspectionTabProps {
  project: Project;
  request: LicensingRequest | null;
  setProject: (p: Project | null) => void;
  setRequest: (r: LicensingRequest | null) => void;
  user: { role: string; name: string };
  loadData: () => void;
  t: (key: string) => string;
}

export function InspectionTab({ project, request, setProject, setRequest, user, loadData, t }: InspectionTabProps) {
  if (project.executionPhase !== "READY_FOR_FINAL_INSPECTION") {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-8 text-center text-muted-foreground text-xs">
          {t("projects:inspection.awaitingDecisionDesc") || "Final inspection is not yet available for this project's current phase."}
        </CardContent>
      </Card>
    );
  }

  return (
    <FinalInspectionPanel
      project={project}
      request={request}
      userRole={user.role}
      userName={user.name}
      onSuccess={(updatedProject, updatedRequest) => {
        setProject(updatedProject);
        if (updatedRequest) {
          setRequest(updatedRequest);
        }
        loadData();
      }}
    />
  );
}
