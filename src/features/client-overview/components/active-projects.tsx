import React from "react";
import { ClientOverviewProject } from "../view-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { getProgressColor } from "../view-model";
import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";

interface ActiveProjectsProps {
  projects: ClientOverviewProject[];
}

export function ActiveProjects({ projects }: ActiveProjectsProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card shadow-sm flex flex-col justify-between h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <FolderOpen className="h-4.5 w-4.5 text-sky-500" />
          {t("common:overview_active_projects_section")}
        </CardTitle>
        <Link href="/projects" passHref legacyBehavior>
          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold gap-1 text-sky-600 hover:text-sky-700 cursor-pointer">
            {t("common:overview_view_all")}
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">
            {t("common:noRecords")}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((proj) => {
              const progressVal = proj.displayProgress;
              return (
                <div key={proj.id} className="space-y-2">
                  <div className="flex justify-between items-start text-xs gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{proj.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase truncate">
                        {proj.executionPhase}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-foreground shrink-0">{progressVal}%</span>
                  </div>
                  
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progressVal)}`}
                      style={{ width: `${progressVal}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
