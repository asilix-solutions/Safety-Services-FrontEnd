import React from "react";
import { Camera } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";

interface PhotosTabProps {
  t: (key: string) => string;
}

export function PhotosTab({ t }: PhotosTabProps) {
  return (
    <EmptyState
      icon={<Camera />}
      title={t("projects:photos.title")}
      description={t("projects:photos.empty")}
    />
  );
}
