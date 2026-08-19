import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { CalendarCheck } from "lucide-react";
import { getSiteVisitsByProjectId } from "@/domains/site-visits/storage";
import { TFunction } from "./types";

interface SiteVisitsCardProps {
  projectId: string;
  t: TFunction;
}

export function SiteVisitsCard({ projectId, t }: SiteVisitsCardProps) {
  const visits = getSiteVisitsByProjectId(projectId);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CalendarCheck className="h-4 w-4 text-primary" />
          {t("projects:overview.siteVisits.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-2 text-xs">
        {visits.length === 0 ? (
          <p className="text-muted-foreground">{t("projects:overview.siteVisits.empty")}</p>
        ) : (
          visits.map((visit) => (
            <div key={visit.id} className="flex items-center justify-between p-2 border border-border rounded bg-secondary/15">
              <span className="font-semibold">{visit.type}</span>
              <Badge variant="outline">{t(`projects:overview.siteVisits.status.${visit.status}`)}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
