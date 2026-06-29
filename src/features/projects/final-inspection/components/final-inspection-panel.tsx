"use client";

import React from "react";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { useTranslation } from "@/providers/i18n-provider";
import { useFinalInspection } from "../hooks/use-final-inspection";
import { InspectionSummary } from "./inspection-summary";
import { InspectionChecklist } from "./inspection-checklist";
import { InspectionDecision } from "./inspection-decision";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { ShieldAlert } from "lucide-react";

import { USER_ROLES } from "@/constants/roles";

interface FinalInspectionPanelProps {
  project: Project;
  request: LicensingRequest | null;
  userRole: string;
  userName: string;
  onSuccess?: (updatedProject: Project, updatedRequest: LicensingRequest | null) => void;
}

export function FinalInspectionPanel({
  project,
  request,
  userRole,
  userName,
  onSuccess,
}: FinalInspectionPanelProps) {
  const { t } = useTranslation();

  // Call the UI orchestration hook (strictly no business rules inside feature components)
  const hookApi = useFinalInspection({
    project,
    request,
    engineerName: userName,
    onSuccess,
  });

  const isConsultingEngineer = userRole === USER_ROLES.CONSULTING_ENGINEER || userRole === USER_ROLES.SUPER_ADMIN || userRole === "ConsultingEngineer";

  // Check if project is in ready_for_final_inspection phase
  if (project.executionPhase !== "ready_for_final_inspection") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.03] dark:bg-indigo-950/[0.08] text-xs flex gap-3 items-start">
        <ShieldAlert className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-left rtl:text-right">
          <h4 className="font-bold text-foreground">
            {t("projects:inspection.title") || "Final Compliance Inspection & Decision"}
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            {t("projects:inspection.desc") || "This project has completed active field installation and is awaiting official compliance inspection checks and final sign-off."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <InspectionSummary project={project} request={request} t={t} />
          <InspectionChecklist project={project} t={t} />
        </div>
        <div>
          <InspectionDecision
            {...hookApi}
            isConsultingEngineer={isConsultingEngineer}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
