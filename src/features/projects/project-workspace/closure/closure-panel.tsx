"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";
import { useClosure } from "./hooks/use-closure";
import { ClosureForm } from "./components/closure-form";
import { ClosureSummary } from "./components/closure-summary";
import { LegalClosureHub } from "./components/legal-closure-hub";

interface ClosurePanelProps {
  projectId: string;
  /** Reloads the workspace once the close has advanced the project's execution phase. */
  onClosed?: () => void;
}

export function ClosurePanel({ projectId, onClosed }: ClosurePanelProps) {
  const [useLiveHub, setUseLiveHub] = useState(true);
  const { canEdit, viewModel, isLoading, hasPhotos, closeProject, isClosing, closeError, t } =
    useClosure(projectId, onClosed);

  // If live backend hub is enabled, try live hub first
  if (useLiveHub) {
    return (
      <LegalClosureHub
        projectId={projectId}
        onClosed={onClosed}
        onFallbackToLocal={() => setUseLiveHub(false)}
      />
    );
  }

  // Fallback to local mock closure for offline/demo projects
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

  return (
    <ClosureForm
      onSubmit={closeProject}
      isSaving={isClosing}
      saveError={closeError}
      hasPhotos={hasPhotos}
    />
  );
}

export default ClosurePanel;
