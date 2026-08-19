import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Textarea } from "@/shared/ui/textarea";
import { Select } from "@/shared/ui/select";
import { Briefcase, CheckCircle } from "lucide-react";
import { Project, SiloExecutionData } from "@/types/project";
import { ExecutionViewModel } from "../view-models/project-workspace.viewmodel";
import { Badge } from "@/shared/ui/badge";
import { USER_ROLES } from "@/constants/roles";
import { isRole } from "@/constants/permissions";
import type { UserRole } from "@/types/role";
import { ExecutionSummaryCard } from "../components/execution-summary-card";

const SILO_STATUS_KEY: Record<string, string> = {
  pending: "pending",
  ready: "ready",
  in_progress: "inProgress",
  completed: "completed",
  blocked: "blocked",
};

const SILO_STATUS_VARIANT: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  pending: "secondary",
  ready: "secondary",
  in_progress: "warning",
  completed: "success",
  blocked: "destructive",
};

interface SystemsTabProps {
  project: Project;
  viewModel: ExecutionViewModel;
  user: { role: string };
  isProcessing: boolean;
  editingSilo: string | null;
  setEditingSilo: (id: string | null) => void;
  siloStatus: any;
  setSiloStatus: (status: any) => void;
  siloLabor: number;
  setSiloLabor: (val: number) => void;
  siloMaterials: number;
  setSiloMaterials: (val: number) => void;
  siloCost: number;
  setSiloCost: (val: number) => void;
  completionNotes: string;
  setCompletionNotes: (val: string) => void;
  readyForFinalInspection: boolean;
  setReadyForFinalInspection: (val: boolean) => void;
  startEditingSilo: (silo: SiloExecutionData) => void;
  handleSaveSilo: (siloId: "alarm" | "suppression" | "ventilation") => void;
  handleStartSilo: (siloId: "alarm" | "suppression" | "ventilation") => void;
  handleCompleteSilo: (siloId: "alarm" | "suppression" | "ventilation", notes: string) => void;
  handleCompleteExecution: () => void;
  t: any;
}

export function SystemsTab({
  project,
  viewModel,
  user,
  isProcessing,
  editingSilo,
  setEditingSilo,
  siloStatus,
  setSiloStatus,
  siloLabor,
  setSiloLabor,
  siloMaterials,
  setSiloMaterials,
  siloCost,
  setSiloCost,
  completionNotes,
  setCompletionNotes,
  readyForFinalInspection,
  setReadyForFinalInspection,
  startEditingSilo,
  handleSaveSilo,
  handleStartSilo,
  handleCompleteSilo,
  handleCompleteExecution,
  t
}: SystemsTabProps) {
  return (
    <div className="space-y-6">
      {/* Template Render Logic for Silos/Maintenance/Checklist */}
      {/* Template: installation_full / installation_fast */}
      {(project.workspaceTemplate === "installation_full" || project.workspaceTemplate === "installation_fast") && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              {t("projects:silos.title") || "Project Operational Silos"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t("projects:silos.desc") || "Manage systems, installation scopes, and resources."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {viewModel.silos.map((silo) => {
                const isEditing = editingSilo === silo.id;
                const name = t(`projects:silos.${silo.id}.name`) || silo.id.toUpperCase();
                const desc = t(`projects:silos.${silo.id}.desc`) || "";

                return (
                  <Card key={silo.id} className="border-border bg-secondary/10 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
                    <div className="p-3.5 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-foreground block">{name}</span>
                        <span className="shrink-0">
                          {(() => {
                            const displayStatus = isEditing ? siloStatus : silo.status;
                            return (
                              <Badge variant={SILO_STATUS_VARIANT[displayStatus] ?? "secondary"}>
                                {t(`projects:silos.statusOptions.${SILO_STATUS_KEY[displayStatus] ?? displayStatus}`)}
                              </Badge>
                            );
                          })()}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed min-h-[40px]">{desc}</p>
                      
                      {isEditing ? (
                        <div className="space-y-2 pt-2 border-t border-border text-[10px]">
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="block text-[9px] text-muted-foreground font-semibold">{t("projects:silos.formStatusLabel")}</label>
                              <Select
                                value={siloStatus}
                                onChange={(e) => setSiloStatus(e.target.value)}
                                className="h-8 bg-background font-bold text-xs"
                              >
                                <option value="pending">{t("projects:silos.statusOptions.pending")}</option>
                                <option value="ready">{t("projects:silos.statusOptions.ready")}</option>
                                <option value="in_progress">{t("projects:silos.statusOptions.inProgress")}</option>
                                <option value="completed">{t("projects:silos.statusOptions.completed")}</option>
                                <option value="blocked">{t("projects:silos.statusOptions.blocked")}</option>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-[9px] text-muted-foreground font-semibold">{t("projects:silos.laborCountLabel")}</label>
                              <Input 
                                type="number" 
                                value={siloLabor} 
                                onChange={(e) => setSiloLabor(Number(e.target.value))}
                                className="h-8 bg-background"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="block text-[9px] text-muted-foreground font-semibold">{t("projects:silos.materialsFieldLabel")}</label>
                              <Input 
                                type="number" 
                                value={siloMaterials} 
                                onChange={(e) => setSiloMaterials(Number(e.target.value))}
                                className="h-8 bg-background"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-muted-foreground font-semibold">{t("projects:silos.costFieldLabel")}</label>
                              <Input 
                                type="number" 
                                value={siloCost} 
                                onChange={(e) => setSiloCost(Number(e.target.value))}
                                className="h-8 bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-[9px] text-muted-foreground">
                          <div className="flex flex-col bg-secondary/15 p-1.5 rounded border border-border/40 text-center">
                            <span className="text-[8px] uppercase tracking-wide font-semibold">{t("projects:silos.labor") || "Labor"}</span>
                            <span className="font-bold text-foreground mt-0.5">{silo.laborCount} {t("projects:silos.crewSuffix")}</span>
                          </div>
                          <div className="flex flex-col bg-secondary/15 p-1.5 rounded border border-border/40 text-center">
                            <span className="text-[8px] uppercase tracking-wide font-semibold">{t("projects:silos.materials") || "Materials"}</span>
                            <span className="font-bold text-foreground mt-0.5">{silo.materialsCount} {t("projects:silos.itemsSuffix")}</span>
                          </div>
                          <div className="flex flex-col bg-secondary/15 p-1.5 rounded border border-border/40 text-center">
                            <span className="text-[8px] uppercase tracking-wide font-semibold">{t("projects:silos.cost") || "Cost"}</span>
                            <span className="font-bold text-foreground mt-0.5 truncate">{silo.costSAR.toLocaleString()} SAR</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-secondary/35 border-t border-border flex justify-between items-center text-[10px]">
                      {isRole(user.role as UserRole, [USER_ROLES.OPERATIONS_OFFICER]) && project.executionPhase === "ACTIVE_EXECUTION" ? (
                        <div className="w-full flex gap-2 justify-end">
                          {!isEditing && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] px-2 font-bold"
                              onClick={() => startEditingSilo(silo)}
                            >
                              {t("projects:silos.editBtn")}
                            </Button>
                          )}
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[10px] px-2 font-bold"
                                onClick={() => setEditingSilo(null)}
                              >
                                {t("projects:silos.cancelBtn")}
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-[10px] px-2 bg-primary text-primary-foreground font-bold"
                                onClick={() => handleSaveSilo(silo.id)}
                              >
                                {t("projects:silos.saveBtn")}
                              </Button>
                            </div>
                          ) : (
                            <>
                              {(silo.status === "pending" || silo.status === "ready") && (
                                <Button
                                  size="sm"
                                  className="h-7 text-[10px] px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                                  onClick={() => handleStartSilo(silo.id)}
                                  disabled={isProcessing}
                                >
                                  {t("projects:execution.startModule") || "Start"}
                                </Button>
                              )}
                              {silo.status === "in_progress" && (
                                <div className="flex gap-1.5 items-center w-full">
                                  <Input
                                    type="text"
                                    placeholder={t("projects:execution.completionNotes") || "Completion notes..."}
                                    id={`notes-${silo.id}`}
                                    className="h-7 text-[10px] bg-background flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    className="h-7 text-[10px] px-3 bg-success hover:bg-success/90 text-success-foreground font-bold"
                                    onClick={() => {
                                      const inputEl = document.getElementById(`notes-${silo.id}`) as HTMLInputElement;
                                      handleCompleteSilo(silo.id, inputEl?.value || "");
                                    }}
                                    disabled={isProcessing}
                                  >
                                    {t("projects:execution.completeModule") || "Complete"}
                                  </Button>
                                </div>
                              )}
                              {silo.status === "completed" && (
                                <span className="text-[10px] font-bold text-success">
                                  {t("projects:execution.completed") || "Completed"}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="w-full flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground">
                            {t("projects:silos.status") || "Status"}:
                          </span>
                          <span className="font-semibold text-foreground uppercase">
                            {t(`projects:silos.statusOptions.${SILO_STATUS_KEY[silo.status] ?? silo.status}`)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Completion / Readiness - Operations Only */}
      {project.executionPhase === "ACTIVE_EXECUTION" && (
        <Card className="border-primary/35 bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              {t("projects:completion.title")}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t("projects:completion.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">
                {t("projects:completion.notesLabel")}
              </label>
              <Textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder={t("projects:completion.notesPlaceholder")}
                className="bg-secondary/50 min-h-[80px] text-xs font-sans"
              />
            </div>
            
            <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={readyForFinalInspection}
                  onChange={(e) => setReadyForFinalInspection(e.target.checked)}
                  className="focus:ring-ring h-4 w-4"
                />
                <span className="font-semibold text-foreground">
                  {t("projects:completion.readyCheckbox")}
                </span>
              </label>
              <Button
                onClick={handleCompleteExecution}
                disabled={isProcessing || !completionNotes.trim() || !readyForFinalInspection}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {isProcessing ? t("projects:completion.submitting") : t("projects:completion.submitBtn")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ExecutionSummaryCard 
        totals={viewModel.totals} 
        projectStatus={project.status} 
        kickoffNotes={project.workspace?.kickoff?.notes} 
        t={t} 
      />
    </div>
  );
}
