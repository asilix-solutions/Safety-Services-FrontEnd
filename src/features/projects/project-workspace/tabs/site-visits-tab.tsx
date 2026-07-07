import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Settings } from "lucide-react";
import { Project } from "@/types/project";
import { USER_ROLES } from "@/constants/roles";
import { initiateKickoffVisit, handleKickoffDecision } from "@/domains/projects/workflow/kickoff";
import { getSiteVisitsByProjectId } from "@/domains/site-visits/storage";

interface SiteVisitsTabProps {
  project: Project;
  setProject: (p: Project | null) => void;
  user: { role: string; name: string };
  isProcessing: boolean;
  loadData: () => void;
  t: any;
}

export function SiteVisitsTab({ project, setProject, user, isProcessing, loadData, t }: SiteVisitsTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3 space-y-6">
        {/* Operations Officer Kickoff Visit Scheduling Form */}
        {user.role === USER_ROLES.OPERATIONS_OFFICER && project.executionPhase === "PROJECT_PROVISIONED" && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" />
                {t("projects:kickoff.title") || "Schedule Kickoff Site Visit"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Assign a consulting engineer inspector and schedule kickoff.
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
                    alert("Kickoff site visit scheduled successfully!");
                    loadData();
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Assigned Inspector</label>
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
                    Schedule Kickoff Visit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Consulting Engineer Inspector Kickoff Audit Sign-Off Form */}
        {user.role === USER_ROLES.CONSULTING_ENGINEER && project.executionPhase === "KICKOFF_PENDING" && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" />
                Perform Kickoff Site Visit Inspection
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Review kickoff directions and log inspection decision.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {(() => {
                const visits = getSiteVisitsByProjectId(project.id);
                const pendingVisit = visits.find((v: any) => v.type === "kickoff" && v.status === "scheduled");
                if (!pendingVisit) {
                  return <p className="text-xs text-muted-foreground">No scheduled kickoff visits found.</p>;
                }
                return (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-secondary/35 border border-border rounded space-y-1">
                      <span className="font-bold block">Operations Directions:</span>
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
                            alert("Kickoff approved successfully!");
                            loadData();
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }}
                      >
                        Approve Kickoff
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
                            alert("Kickoff inspection rejected. Returned to Operations.");
                            loadData();
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }}
                      >
                        Reject & Return
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Awaiting Kickoff State Info Panel */}
        {project.executionPhase === "KICKOFF_PENDING" && user.role !== USER_ROLES.CONSULTING_ENGINEER && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Kickoff Audit Scheduled</CardTitle>
              <CardDescription className="text-xs">Awaiting consulting engineer inspection audit.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p>Inspector Eng. Tariq Al-Mansoor has been dispatched to perform the kickoff site audit.</p>
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
              <p>Status: <span className="font-semibold text-emerald-600">Approved for site works</span></p>
            </CardContent>
          </Card>
        )}

        {!["PROJECT_PROVISIONED", "KICKOFF_PENDING", "KICKOFF_APPROVED"].includes(project.executionPhase || "") && (
          <Card className="border-border bg-card">
            <CardContent className="py-8 text-center text-muted-foreground text-xs">
              Kickoff site visit already resolved for this project phase.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
