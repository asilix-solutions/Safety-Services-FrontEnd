"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { useProcurement } from "./hooks/use-procurement";
import { ProcurementForm } from "./components/procurement-form";
import { ProcurementList } from "./components/procurement-list";

interface ProcurementPanelProps {
  projectId: string;
}

export function ProcurementPanel({ projectId }: ProcurementPanelProps) {
  const { canEdit, viewModel, isLoading, saveProcurement, isSaving, saveError, t } = useProcurement(projectId);

  return (
    <div className="space-y-6">
      {canEdit && <ProcurementForm onSubmit={saveProcurement} isSaving={isSaving} />}

      {saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {t("procurement:form.saveFailed")}
        </div>
      )}

      <ProcurementList viewModel={viewModel} isLoading={isLoading} />
    </div>
  );
}

export default ProcurementPanel;
