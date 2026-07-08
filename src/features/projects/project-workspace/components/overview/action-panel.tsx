import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Send, FileText, Receipt, BarChart3 } from "lucide-react";
import Link from "next/link";
import { ProjectOverviewActionId } from "@/constants/permissions";
import { Project } from "@/types/project";
import { TFunction } from "./types";

interface ActionPanelProps {
  actions: ProjectOverviewActionId[];
  project: Project;
  isProcessing: boolean;
  handleStartExecution: () => void;
  t: TFunction;
}

export function ActionPanel({ actions, project, isProcessing, handleStartExecution, t }: ActionPanelProps) {
  if (actions.length === 0) return null;

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {t("projects:overview.actions.title")}
        </CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground leading-normal">
          {t("projects:overview.actions.desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 space-y-2">
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
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-9"
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
                    className="p-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded font-semibold text-center text-xs flex items-center justify-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
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
