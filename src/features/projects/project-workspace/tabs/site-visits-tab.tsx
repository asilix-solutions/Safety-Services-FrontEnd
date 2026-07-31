import React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Settings } from "lucide-react";
import { Project } from "@/types/project";
import { USER_ROLES } from "@/constants/roles";
import { isRole } from "@/constants/permissions";
import type { UserRole } from "@/types/role";
import { initiateKickoffVisit, handleKickoffDecision } from "@/domains/projects/workflow/kickoff";
import { getSiteVisitsByProjectId } from "@/domains/site-visits/storage";
import type { TFunction } from "../components/overview/types";

interface SiteVisitsTabProps {
  project: Project;
  setProject: (p: Project | null) => void;
  user: { role: string; name: string };
  isProcessing: boolean;
  loadData: () => void;
  t: TFunction;
}

export function SiteVisitsTab({ project, setProject, user, isProcessing, loadData, t }: SiteVisitsTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3 space-y-6">
        {/* Operations Officer Kickoff Visit Scheduling Form */}
        {isRole(user.role as UserRole, [USER_ROLES.OPERATIONS_OFFICER]) && project.executionPhase === "PROJECT_PROVISIONED" && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" />
                {t("projects:kickoff.title") || "Schedule Kickoff Site Visit"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t("projects:kickoff.assignDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const inspectorName = "Eng. Tariq Al-Mansoor"; // Default mock name
                  const inspectorId = "USR-006"; // Mock ID
                  const notesVal = (form.elements.namedItem("kickoffNotes") as HTMLTextAreaElement).value;

                  try {
                    const updated = initiateKickoffVisit({
                      project,
                      inspectorId,
                      inspectorName,
                      notes: notesVal,
                      scheduledDate: new Date().toISOString(),
                    });
                    setProject(updated);
                    toast.success(t("projects:kickoff.scheduledSuccessAlert"));
                    loadData();
                  } catch (err: unknown) {
                    console.error("initiateKickoffVisit failed:", err);
                    toast.error(t("common:error_generic_action_failed"));
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">{t("projects:kickoff.inspector")}</label>
                  <input
                    type="text"
                    readOnly
                    value="Eng. Tariq Al-Mansoor (Consulting Engineer)"
                    className="w-full bg-secondary/35 border border-border p-2 rounded"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">{t("projects:kickoff.kickoffNotes") || "Kickoff Directions & Notes"}</label>
                  <Textarea
                    rows={3}
                    name="kickoffNotes"
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
                    {t("projects:kickoff.scheduleBtn")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Consulting Engineer Inspector Kickoff Audit Sign-Off Form */}
        {isRole(user.role as UserRole, [USER_ROLES.CONSULTING_ENGINEER]) && project.executionPhase === "KICKOFF_PENDING" && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" />
                {t("projects:kickoff.performInspectionTitle")}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t("projects:kickoff.reviewInspectionDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {(() => {
                const visits = getSiteVisitsByProjectId(project.id);
                const pendingVisit = visits.find((v) => v.type === "kickoff" && v.status === "scheduled");
                if (!pendingVisit) {
                  return <p className="text-xs text-muted-foreground">{t("projects:kickoff.noScheduledVisits")}</p>;
                }
                return (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-secondary/35 border border-border rounded space-y-1">
                      <span className="font-bold block">{t("projects:kickoff.operationsDirectionsLabel")}</span>
                      <p className="text-muted-foreground">{pendingVisit.notes}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={() => {
                          try {
                            const updated = handleKickoffDecision({
                              project,
                              visitId: pendingVisit.id,
                              approved: true,
                              decisionNotes: "Kickoff inspected and approved.",
                              inspectorName: user.name || "Eng. Tariq Al-Mansoor",
                            });
                            setProject(updated);
                            toast.success(t("projects:kickoff.savedSuccess"));
                            loadData();
                          } catch (err: unknown) {
                            console.error("handleKickoffDecision (approve) failed:", err);
                            toast.error(t("common:error_generic_action_failed"));
                          }
                        }}
                      >
                        {t("projects:kickoff.approveAction")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="font-bold"
                        onClick={() => {
                          try {
                            const updated = handleKickoffDecision({
                              project,
                              visitId: pendingVisit.id,
                              approved: false,
                              decisionNotes: "Kickoff rejected due to checklist compliance gaps.",
                              inspectorName: user.name || "Eng. Tariq Al-Mansoor",
                            });
                            setProject(updated);
                            toast.success(t("projects:kickoff.rejectedAlert"));
                            loadData();
                          } catch (err: unknown) {
                            console.error("handleKickoffDecision (reject) failed:", err);
                            toast.error(t("common:error_generic_action_failed"));
                          }
                        }}
                      >
                        {t("projects:kickoff.rejectAction")}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Awaiting Kickoff State Info Panel */}
        {project.executionPhase === "KICKOFF_PENDING" && !isRole(user.role as UserRole, [USER_ROLES.CONSULTING_ENGINEER]) && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold">{t("projects:kickoff.auditScheduledTitle")}</CardTitle>
              <CardDescription className="text-xs">{t("projects:kickoff.awaitingAuditDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p>{t("projects:kickoff.dispatchedNotice")}</p>
            </CardContent>
          </Card>
        )}

        {/* If Kickoff is approved, but execution hasn't started yet, display general details */}
        {project.executionPhase === "KICKOFF_APPROVED" && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold">{t("projects:kickoff.approved")}</CardTitle>
              <CardDescription className="text-xs">{t("projects:details.opsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>{t("projects:kickoff.statusLabel")} <span className="font-semibold text-emerald-600">{t("projects:kickoff.approvedForSiteWorks")}</span></p>
            </CardContent>
          </Card>
        )}

        {!["PROJECT_PROVISIONED", "KICKOFF_PENDING", "KICKOFF_APPROVED"].includes(project.executionPhase || "") && (
          <Card className="border-border bg-card">
            <CardContent className="py-8 text-center text-muted-foreground text-xs">
              {t("projects:kickoff.alreadyResolved")}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
