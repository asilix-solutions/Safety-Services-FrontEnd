import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Activity } from "lucide-react";
import { StatusBadge } from "@/shared/components/status-badge";

interface ProjectHealthCardProps {
  health: {
    color: string;
    labelKey: string;
  };
  projectStatus: string;
  t: any;
}

export function ProjectHealthCard({ health, projectStatus, t }: ProjectHealthCardProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("projects:health.label")}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3">
        <div className={`p-3 rounded-lg border flex items-center justify-between font-bold ${health.color}`}>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{t(health.labelKey)}</span>
          </div>
          <StatusBadge status={projectStatus} type="project" className="text-[10px]" />
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal">
          {t("projects:health.description")}
        </p>
      </CardContent>
    </Card>
  );
}
