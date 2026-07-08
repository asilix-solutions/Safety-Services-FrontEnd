"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { usePhotos } from "./hooks/use-photos";
import { PhotoCaptureForm } from "./components/photo-capture-form";
import { PhotoGrid } from "./components/photo-grid";

interface PhotosPanelProps {
  projectId: string;
}

export function PhotosPanel({ projectId }: PhotosPanelProps) {
  const { canEdit, viewModel, isLoading, savePhoto, isSaving, saveError, t } = usePhotos(projectId);

  return (
    <div className="space-y-6">
      {canEdit && <PhotoCaptureForm onSubmit={savePhoto} isSaving={isSaving} />}

      {saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {t("photos:form.saveFailed")}
        </div>
      )}

      <PhotoGrid viewModel={viewModel} isLoading={isLoading} />
    </div>
  );
}

export default PhotosPanel;
