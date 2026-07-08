import React from "react";
import { ProcurementPanel } from "../procurement";

interface ProcurementTabProps {
  projectId: string;
}

export function ProcurementTab({ projectId }: ProcurementTabProps) {
  return <ProcurementPanel projectId={projectId} />;
}
