import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowRight } from "lucide-react";
import { TFunction } from "./types";

interface NextActionCardProps {
  nextActionLabelKey: string;
  t: TFunction;
}

export function NextActionCard({ nextActionLabelKey, t }: NextActionCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("projects:overview.nextAction.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ArrowRight className="h-4 w-4 text-indigo-500 shrink-0" />
        {t(nextActionLabelKey)}
      </CardContent>
    </Card>
  );
}
