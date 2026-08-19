import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { AlertTriangle } from "lucide-react";
import { ObstaclesViewModel } from "../view-models/project-workspace.viewmodel";
import { ProjectTask } from "@/types/project";

type TranslateFn = (key: string, params?: Record<string, string>) => string;

interface ObstacleListProps {
  viewModel: ObstaclesViewModel;
  t: TranslateFn;
}

/** Prefers the translated key over the legacy free-text field; resolves the silo param to its localized name. */
function resolveText(t: TranslateFn, key: string | undefined, params: Record<string, string> | undefined, fallback: string): string {
  if (!key) return fallback;
  const resolvedParams = params?.silo ? { ...params, silo: t(`projects:silos.${params.silo}.name`) } : params;
  return t(key, resolvedParams);
}

function taskTitle(t: TranslateFn, task: ProjectTask): string {
  return resolveText(t, task.titleKey, task.titleParams, task.title);
}

function taskDescription(t: TranslateFn, task: ProjectTask): string {
  return resolveText(t, task.descriptionKey, task.descriptionParams, task.description);
}

export function ObstacleList({ viewModel, t }: ObstacleListProps) {
  const hasObstacles = viewModel.critical.length > 0 || viewModel.standard.length > 0 || viewModel.blockedSilos.length > 0;

  if (!hasObstacles) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center text-muted-foreground text-xs space-y-2">
          <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground/60" />
          <p>{t("projects:empty.noObstacles")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {viewModel.blockedSilos.map(silo => (
        <Card key={silo.id} className="border-destructive/30 bg-destructive/5 animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4 animate-bounce" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider">
                {t(`projects:silos.${silo.id}.name`)} - {t("projects:obstacles.blockedSuffix")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs">
            <p className="text-muted-foreground">
              {t("projects:obstacles.blockedDesc")}
            </p>
          </CardContent>
        </Card>
      ))}
      
      {(viewModel.critical.length > 0 || viewModel.standard.length > 0) && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">{t("projects:obstacles.log")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {viewModel.critical.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                  {t("projects:obstacles.openCritical") || "Open Critical Items"}
                </h4>
                <div className="space-y-1.5">
                  {viewModel.critical.map(task => (
                    <div key={task.id} className="p-3 border border-destructive/20 rounded-lg flex items-center justify-between gap-4 text-xs bg-destructive/[0.02]">
                      <div>
                        <span className="font-semibold text-foreground block">{taskTitle(t, task)}</span>
                        <span className="text-[10px] text-muted-foreground">{taskDescription(t, task)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-destructive/10 text-destructive">
                        {t(`projects:obstacles.priority.${task.priority.toLowerCase()}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewModel.standard.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-border/60">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  {t("projects:obstacles.standardHeading")}
                </h4>
                <div className="space-y-2">
                  {viewModel.standard.map(task => (
                    <div key={task.id} className="p-3 border border-border rounded-lg flex items-center justify-between gap-4 text-xs bg-secondary/10">
                      <div>
                        <span className="font-semibold text-foreground block">{taskTitle(t, task)}</span>
                        <span className="text-[10px] text-muted-foreground">{taskDescription(t, task)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-secondary text-muted-foreground">
                        {t(`projects:obstacles.priority.${task.priority.toLowerCase()}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
