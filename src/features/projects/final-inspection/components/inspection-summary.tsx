"use client";

import React from "react";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Clipboard, UserCheck, Calendar } from "lucide-react";

interface InspectionSummaryProps {
  project: Project;
  request: LicensingRequest | null;
  t: (key: string) => string;
}

export function InspectionSummary({ project, request, t }: InspectionSummaryProps) {
  const ws = project.workspace;
  const isNew = ws && "kickoff" in ws;

  const inspector = isNew ? ws.kickoff?.assignedInspector : (ws as any).assignedInspector;
  const completionNotes = isNew ? ws.completion?.notes : (ws as any).executionCompletionNotes;

  return (
    <Card className="border-border bg-card shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clipboard className="h-4 w-4 text-indigo-500" />
          {t("projects:inspection.completionNotes") || "Submitted Execution Details"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 text-xs space-y-4">
        {/* completion notes */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            {t("projects:completion.notesLabel") || "Execution Notes"}
          </span>
          <p className="p-3 bg-secondary/30 border border-border rounded-lg text-foreground italic leading-relaxed">
            {completionNotes || t("requests:details.noNotes") || "No completion notes submitted."}
          </p>
        </div>

        {/* inspector info */}
        <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-border">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
              {t("projects:kickoff.inspector") || "Assigned Inspector"}
            </span>
            <span className="font-semibold text-foreground text-sm block">
              {inspector || "Unassigned"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              {t("projects:details.startDate") || "Kickoff Date"}
            </span>
            <span className="font-semibold text-foreground text-sm block">
              {project.startDate}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
