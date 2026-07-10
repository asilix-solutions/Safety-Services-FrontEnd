"use client";

import React from "react";
import { Lock } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";
import { useClosure } from "./hooks/use-closure";
import { ClosureForm } from "./components/closure-form";
import { ClosureSummary } from "./components/closure-summary";

interface ClosurePanelProps {
  projectId: string;
}

export function ClosurePanel({ projectId }: ClosurePanelProps) {
  const { canEdit, viewModel, isLoading, closeProject, isClosing, closeError, t } = useClosure(projectId);

  if (isLoading) return null;

  if (viewModel.isClosed) {
    return <ClosureSummary viewModel={viewModel} />;
  }

  if (!canEdit) {
    return (
      <EmptyState
        icon={<Lock className="h-8 w-8 text-muted-foreground" />}
        title={t("closure:title")}
        description={t("closure:empty")}
      />
    );
  }

  return <ClosureForm onSubmit={closeProject} isSaving={isClosing} saveError={closeError} />;
}

export default ClosurePanel;
