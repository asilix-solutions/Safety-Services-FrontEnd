import React from "react";
import { PhotosPanel } from "../photos";

interface PhotosTabProps {
  projectId: string;
}

export function PhotosTab({ projectId }: PhotosTabProps) {
  return <PhotosPanel projectId={projectId} />;
}
