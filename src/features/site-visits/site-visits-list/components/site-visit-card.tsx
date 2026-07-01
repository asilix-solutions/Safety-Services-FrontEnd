import React from "react";
import { SiteVisit } from "@/domains/site-visits/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { MapPin, Calendar as CalendarIcon } from "lucide-react";
import { getSiteVisitBadgeVariant, formatVisitDateTime } from "../helpers/helpers";

interface SiteVisitCardProps {
  visit: SiteVisit;
  assignedInspectorLabel: string;
  notesLabel: string;
}

export function SiteVisitCard({
  visit,
  assignedInspectorLabel,
  notesLabel,
}: SiteVisitCardProps) {
  return (
    <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1.5">
          <Badge variant={getSiteVisitBadgeVariant(visit.status)}>
            {visit.status.toUpperCase()}
          </Badge>
          <CardTitle className="text-base font-bold text-foreground">{visit.projectName}</CardTitle>
          <CardDescription className="text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {visit.location}
          </CardDescription>
        </div>
        <span className="text-xs font-mono font-semibold text-primary">{visit.id}</span>
      </CardHeader>
      <CardContent className="space-y-3 pt-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatVisitDateTime(visit.scheduledDate)}</span>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-muted-foreground">{assignedInspectorLabel}:</p>
          <p className="text-foreground">{visit.inspectorName}</p>
        </div>
        {visit.notes && (
          <div className="p-2.5 rounded-lg border border-border bg-secondary/10">
            <p className="font-semibold text-muted-foreground mb-1">{notesLabel}:</p>
            <p className="text-muted-foreground">{visit.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default SiteVisitCard;
