import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Send } from "lucide-react";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { OverviewViewModel } from "../view-models/project-workspace.viewmodel";
import { USER_ROLES } from "@/constants/roles";

// Extracted Component Imports
import { LinkedRequestCard } from "../components/linked-request-card";
import { ProjectHealthCard } from "../components/project-health-card";

interface OverviewTabProps {
  project: Project;
  request: LicensingRequest | null;
  viewModel: OverviewViewModel;
  user: { role: string; name: string };
  isProcessing: boolean;
  handleStartExecution: () => void;
  t: any;
}

export function OverviewTab({
  project,
  request,
  viewModel,
  user,
  isProcessing,
  handleStartExecution,
  t
}: OverviewTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Stepper Card */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              {t("projects:phases.title") || "Internal Execution Phase"}
            </h3>
            <div className="grid grid-cols-5 gap-2 relative">
              {viewModel.internalPhases.map((phase, idx) => {
                const isPassed = idx < viewModel.currentPhaseIndex;
                const isCurrent = idx === viewModel.currentPhaseIndex;
                return (
                  <div key={phase.id} className="flex flex-col items-center text-center space-y-2 relative">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                        isPassed
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20"
                          : "bg-secondary border border-border text-muted-foreground"
                      }`}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold ${isCurrent ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-muted-foreground"}`}>
                      {t(phase.labelKey) || phase.id.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Project Health Card */}
        <ProjectHealthCard
          health={viewModel.health}
          projectStatus={project.status}
          t={t}
        />
      </div>

      {/* Right/Sidebar Column */}
      <div className="space-y-6">
        {request && <LinkedRequestCard request={request} t={t} />}

        {/* Operational action card */}
        {user.role === USER_ROLES.OPERATIONS_OFFICER && (
          <Card className="border-indigo-500/20 bg-indigo-500/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {t("projects:actions.opsCard") || "Operations Actions"}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground leading-normal">
                {t("projects:actions.opsDesc") || "Transition this project to active field execution."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {project.executionPhase === "PROJECT_PROVISIONED" && (
                <div className="text-xs text-muted-foreground py-2 text-center font-semibold">
                  {t("projects:kickoff.awaitingApproval") || "Awaiting Kickoff Approval"}
                </div>
              )}
              {project.executionPhase === "KICKOFF_APPROVED" && (
                <Button
                  onClick={handleStartExecution}
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-9"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isProcessing
                    ? (t("projects:actions.activating") || "Activating...")
                    : (t("projects:kickoff.startExecution") || "Start Execution")
                  }
                </Button>
              )}
              {project.executionPhase === "ACTIVE_EXECUTION" && (
                <div className="p-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded font-semibold text-center text-xs flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t("projects:kickoff.executionStarted") || "Execution Started"}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
