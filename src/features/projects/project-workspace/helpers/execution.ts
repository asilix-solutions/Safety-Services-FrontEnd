import { SiloExecutionData, ProjectExecutionPhase } from "@/types/project";
import { WorkspaceTotals } from "../types/project-workspace";

export function calculateExecutionTotals(silos: SiloExecutionData[]): WorkspaceTotals {
  const totalLabor = silos.reduce((sum, s) => sum + s.laborCount, 0);
  const totalMaterialsCost = silos.reduce((sum, s) => sum + s.costSAR, 0);
  const totalMaterialsCount = silos.reduce((sum, s) => sum + s.materialsCount, 0);

  return {
    totalLabor,
    totalMaterialsCost,
    totalMaterialsCount
  };
}

export function getCurrentPhaseIndex(
  executionPhase: ProjectExecutionPhase | undefined,
  internalPhases: { id: ProjectExecutionPhase; labelKey: string }[]
): number {
  return internalPhases.findIndex((p) => p.id === (executionPhase || "created"));
}
