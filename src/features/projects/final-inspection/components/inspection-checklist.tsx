"use client";

import React from "react";
import { Project } from "@/types/project";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { StatusBadge } from "@/shared/components/status-badge";
import { CheckSquare, Info } from "lucide-react";

interface InspectionChecklistProps {
  project: Project;
  t: (key: string) => string;
}

export function InspectionChecklist({ project, t }: InspectionChecklistProps) {
  const ws = project.workspace;
  const isNew = ws && "execution" in ws;
  const silos = isNew ? ws.execution?.silos : (ws as any).silos;

  const hasSilos = silos && silos.length > 0;

  return (
    <Card className="border-border bg-card shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CheckSquare className="h-4 w-4 text-indigo-500" />
          {t("projects:compliance.checklist") || "Compliance Verification Checklist"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 text-xs space-y-4">
        {hasSilos ? (
          <div className="space-y-3">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {t("projects:silos.title") || "Silo Execution Status"}
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              {silos.map((silo: any) => {
                const name = t(`projects:silos.${silo.id}.name`) || silo.id.toUpperCase();
                return (
                  <div key={silo.id} className="p-3 bg-secondary/25 border border-border rounded-lg flex flex-col justify-between gap-2">
                    <span className="font-bold text-foreground">{name}</span>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground">{t("projects:silos.labor") || "Techs"}: {silo.laborCount}</span>
                      <StatusBadge status={silo.status} type="project" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* compliance followup template checklist */}
            <div className="space-y-2.5 divide-y divide-border/60">
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="font-bold block text-foreground">1. Exit Route Signage Visibilities</span>
                  <span className="text-[10px] text-muted-foreground">Standard checklist guideline audit</span>
                </div>
                <Badge variant="success">Pass</Badge>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <div>
                  <span className="font-bold block text-foreground">2. Portable Extinguishers Charge Pressure Check</span>
                  <span className="text-[10px] text-muted-foreground">Site safety inspection report reference</span>
                </div>
                <Badge variant="warning">Awaiting Inspection</Badge>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <div>
                  <span className="font-bold block text-foreground">3. Emergency Lighting Power Battery Reserves</span>
                  <span className="text-[10px] text-muted-foreground">Electrical redundancy inspections</span>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
