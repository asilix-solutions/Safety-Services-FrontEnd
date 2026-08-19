import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { ClipboardCheck } from "lucide-react";
import { Project } from "@/types/project";
import { TFunction } from "./types";

interface InspectionStatusCardProps {
  project: Project;
  t: TFunction;
}

export function InspectionStatusCard({ project, t }: InspectionStatusCardProps) {
  const inspection = project.workspace?.inspection;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          {t("projects:overview.inspection.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-2 text-xs">
        {inspection?.completedAt ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("projects:inspection.completedAt")}</span>
              <span className="font-semibold">{inspection.completedAt}</span>
            </div>
            <Badge variant={inspection.approved ? "success" : "warning"}>
              {inspection.approved
                ? t("projects:inspection.approveBtn")
                : t("projects:inspection.requestFixesBtn")}
            </Badge>
            {inspection.notes && <p className="text-muted-foreground pt-1">{inspection.notes}</p>}
          </>
        ) : (
          <p className="text-muted-foreground">{t("projects:overview.inspection.awaiting")}</p>
        )}
      </CardContent>
    </Card>
  );
}
