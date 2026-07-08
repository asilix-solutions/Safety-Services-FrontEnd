import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { User } from "lucide-react";
import { Project } from "@/types/project";
import { TFunction } from "./types";

interface CustomerInfoCardProps {
  project: Project;
  t: TFunction;
}

export function CustomerInfoCard({ project, t }: CustomerInfoCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <User className="h-4 w-4 text-indigo-500" />
          {t("projects:overview.customer.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-1 text-xs">
        <span className="font-semibold text-foreground block">{project.clientName}</span>
        <span className="text-muted-foreground font-mono">{project.clientId}</span>
      </CardContent>
    </Card>
  );
}
