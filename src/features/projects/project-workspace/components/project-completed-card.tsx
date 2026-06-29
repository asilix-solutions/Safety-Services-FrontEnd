import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { CheckCircle } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectCompletedCardProps {
  project: Project;
  t: any;
}

export function ProjectCompletedCard({ project, t }: ProjectCompletedCardProps) {
  const inspection = project.workspace?.inspection;
  const decisionBy = inspection?.decisionBy || "Consulting Engineer";
  const notes = inspection?.notes || "Compliance checks passed successfully.";
  const completedAt = inspection?.completedAt 
    ? new Date(inspection.completedAt).toLocaleDateString() 
    : new Date().toLocaleDateString();

  return (
    <Card className="border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-950/[0.08]">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {t("projects:completed.title") || "Project Completed & Approved"}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("projects:completed.desc") || "This compliance project has been officially inspected and certified."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs pt-4">
        <div className="p-3 bg-secondary/35 rounded-lg border border-border space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:inspection.decisionBy") || "Approved By"}</span>
              <span className="font-semibold text-foreground">{decisionBy}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:inspection.completedAt") || "Completion Date"}</span>
              <span className="font-semibold text-foreground">{completedAt}</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-border">
            <span className="text-[10px] text-muted-foreground block uppercase mb-1">{t("projects:inspection.notesLabel") || "Inspection Decision Notes"}</span>
            <p className="font-mono text-[10px] text-foreground leading-relaxed bg-background p-2.5 rounded border border-border">
              {notes}
            </p>
          </div>
          {project.jobNumber && (
            <div className="pt-2.5 border-t border-border">
              <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:details.jobNumber") || "Job Number"}</span>
              <span className="font-mono font-bold text-foreground text-xs">{project.jobNumber}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
