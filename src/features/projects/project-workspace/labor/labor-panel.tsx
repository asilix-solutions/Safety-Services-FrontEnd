"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { useLabor } from "./hooks/use-labor";
import { LaborForm } from "./components/labor-form";
import { LaborList } from "./components/labor-list";

interface LaborPanelProps {
  projectId: string;
}

export function LaborPanel({ projectId }: LaborPanelProps) {
  const {
    canEdit,
    viewModel,
    isLoading,
    saveLabor,
    isSaving,
    saveError,
    confirmSettlement,
    isSettling,
    settleError,
    t,
  } = useLabor(projectId);

  return (
    <div className="space-y-6">
      {canEdit && <LaborForm onSubmit={saveLabor} isSaving={isSaving} />}

      {saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {t("labor:form.saveFailed")}
        </div>
      )}

      {settleError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {t("labor:settlement.settleFailed")}
        </div>
      )}

      <LaborList
        viewModel={viewModel}
        isLoading={isLoading}
        canEdit={canEdit}
        onConfirmSettlement={confirmSettlement}
        isSettling={isSettling}
      />
    </div>
  );
}

export default LaborPanel;
