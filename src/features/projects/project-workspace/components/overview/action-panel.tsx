import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Send, FileText, Receipt, BarChart3, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { ProjectOverviewActionId } from "@/constants/permissions";
import { Project } from "@/types/project";
import { TFunction } from "./types";

interface ActionPanelProps {
  actions: ProjectOverviewActionId[];
  project: Project;
  isProcessing: boolean;
  handleStartExecution: () => void;
  canEdit?: boolean;
  onStartInspection?: () => void;
  t: TFunction;
}

export function ActionPanel({ actions, project, isProcessing, handleStartExecution, canEdit, onStartInspection, t }: ActionPanelProps) {
  if (actions.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
          {t("projects:overview.actionRequired") || "Action Required"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.executionPhase === "READY_FOR_FINAL_INSPECTION" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground block">
                {t("projects:overview.readyForInspectionTitle") || "Final Inspection Ready"}
              </span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t("projects:overview.readyForInspectionDesc") ||
                  "All silo milestones and field site works are complete. Consulting engineer final audit is required."}
              </p>
            </div>

            {canEdit ? (
              <Button
                onClick={onStartInspection}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 h-9"
              >
                <ClipboardCheck className="h-4 w-4" />
                {t("projects:overview.startInspection") || "Perform Final Inspection"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div
                  className="p-2 border border-success/20 bg-success/5 text-success rounded font-semibold text-center text-xs flex items-center justify-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  {t("projects:overview.awaitingConsultingInspection") || "Awaiting Consulting Engineer Audit"}
                </div>
              </div>
            )}
          </div>
        )}

        {actions.map((actionId) => {
          switch (actionId) {
            case "startExecution":
              if (project.executionPhase === "PROJECT_PROVISIONED") {
                return (
                  <div key={actionId} className="text-xs text-muted-foreground py-2 text-center font-semibold">
                    {t("projects:kickoff.awaitingApproval")}
                  </div>
                );
              }
              if (project.executionPhase === "KICKOFF_APPROVED") {
                return (
                  <Button
                    key={actionId}
                    onClick={handleStartExecution}
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 h-9"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isProcessing ? t("projects:actions.activating") : t("projects:kickoff.startExecution")}
                  </Button>
                );
              }
              if (project.executionPhase === "ACTIVE_EXECUTION") {
                return (
                  <div
                    key={actionId}
                    className="p-2 border border-success/20 bg-success/5 text-success rounded font-semibold text-center text-xs flex items-center justify-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    {t("projects:kickoff.executionStarted")}
                  </div>
                );
              }
              return null;

            case "logInspectionNotes":
              return (
                <Button
                  key={actionId}
                  disabled
                  title={t("projects:overview.actions.inspectionNotesTooltip")}
                  variant="outline"
                  className="w-full text-xs gap-1.5 h-9 font-bold"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t("projects:overview.actions.logInspectionNotes")}
                </Button>
              );

            case "viewContracts":
              return (
                <Button asChild key={actionId} variant="outline" size="sm" className="w-full h-9 text-xs font-bold gap-1.5">
                  <Link href="/contracts">
                    <FileText className="h-3.5 w-3.5" />
                    {t("projects:overview.actions.viewContracts")}
                  </Link>
                </Button>
              );

            case "viewInvoices":
              return (
                <Button asChild key={actionId} variant="outline" size="sm" className="w-full h-9 text-xs font-bold gap-1.5">
                  <Link href="/invoices">
                    <Receipt className="h-3.5 w-3.5" />
                    {t("projects:overview.actions.viewInvoices")}
                  </Link>
                </Button>
              );

            case "viewReports":
              return (
                <Button asChild key={actionId} variant="outline" size="sm" className="w-full h-9 text-xs font-bold gap-1.5">
                  <Link href="/reports">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {t("projects:overview.actions.viewReports")}
                  </Link>
                </Button>
              );

            default:
              return null;
          }
        })}
      </CardContent>
    </Card>
  );
}
