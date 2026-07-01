import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Settings, Send } from "lucide-react";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { OverviewViewModel } from "../view-models/project-workspace.viewmodel";
import { USER_ROLES } from "@/constants/roles";
import { FinalInspectionPanel } from "@/features/projects/final-inspection";

// Extracted Component Imports
import { LinkedRequestCard } from "../components/linked-request-card";
import { ProjectHealthCard } from "../components/project-health-card";
import { ProjectCompletedCard } from "../components/project-completed-card";
import { ProjectTimelineCard } from "../components/project-timeline-card";

interface OverviewTabProps {
  project: Project;
  setProject: (p: Project | null) => void;
  request: LicensingRequest | null;
  setRequest: (r: LicensingRequest | null) => void;
  viewModel: OverviewViewModel;
  user: { role: string; name: string };
  isProcessing: boolean;
  notes: string;
  setNotes: (val: string) => void;
  handleApproveKickoff: (e: React.FormEvent) => void;
  handleStartExecution: () => void;
  handlePhaseTransition: (phase: any) => void;
  loadData: () => void;
  t: any;
}

export function OverviewTab({
  project,
  setProject,
  request,
  setRequest,
  viewModel,
  user,
  isProcessing,
  notes,
  setNotes,
  handleApproveKickoff,
  handleStartExecution,
  handlePhaseTransition,
  loadData,
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
                    <button
                      type="button"
                      onClick={() => handlePhaseTransition(phase.id)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                        isPassed 
                          ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                          : isCurrent 
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20" 
                          : "bg-secondary border border-border text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </button>
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

        {/* Activity & Workflow Timeline */}
        <ProjectTimelineCard 
          timeline={viewModel.timeline} 
          t={t} 
        />

        {/* Final Inspection/Completion views if applicable */}
        {project.executionPhase === "completed" ? (
          <ProjectCompletedCard project={project} t={t} />
        ) : project.executionPhase === "ready_for_final_inspection" ? (
          <FinalInspectionPanel
            project={project}
            request={request}
            userRole={user.role}
            userName={user.name}
            onSuccess={(updatedProject, updatedRequest) => {
              setProject(updatedProject);
              if (updatedRequest) {
                setRequest(updatedRequest);
              }
              loadData();
            }}
          />
        ) : (
          <>
            {/* Kickoff Section */}
            {user.role === USER_ROLES.OPERATIONS_OFFICER && project.executionPhase === "created" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-indigo-500" />
                    {t("projects:kickoff.title") || "Project Setup & Kickoff"}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {t("projects:kickoff.desc") || "Operational setup before active execution."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleApproveKickoff} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">{t("projects:kickoff.kickoffNotes") || "Kickoff Directions & Notes"}</label>
                      <Textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t("projects:kickoff.notesPlaceholder") || "Enter kickoff instructions..."}
                        className="bg-secondary/50 min-h-[80px]"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button 
                        type="submit" 
                        size="sm" 
                        disabled={isProcessing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      >
                        {t("projects:kickoff.approveKickoff") || "Approve Kickoff"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            {/* If Kickoff is approved, but execution hasn't started yet, display general details */}
            {project.executionPhase === "kickoff_ready" && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">{t("projects:kickoff.approved")}</CardTitle>
                  <CardDescription className="text-xs">{t("projects:details.opsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>{t("projects:kickoff.notes")}: <span className="font-semibold">{project.workspace?.kickoff?.notes || "No notes"}</span></p>
                </CardContent>
              </Card>
            )}
          </>
        )}
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
              {project.executionPhase === "created" && (
                <div className="text-xs text-muted-foreground py-2 text-center font-semibold">
                  {t("projects:kickoff.awaitingApproval") || "Awaiting Kickoff Approval"}
                </div>
              )}
              {project.executionPhase === "kickoff_ready" && (
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
              {project.executionPhase === "active_execution" && (
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
