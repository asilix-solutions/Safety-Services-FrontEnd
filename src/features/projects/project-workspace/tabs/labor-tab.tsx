import React from "react";
import { LaborPanel } from "../labor";

interface LaborTabProps {
  projectId: string;
}

export function LaborTab({ projectId }: LaborTabProps) {
  return <LaborPanel projectId={projectId} />;
}
