import React from "react";
import { StatsCard } from "@/shared/components/stats-card";
import { ProjectOverviewKpiId } from "@/constants/permissions";
import { OverviewViewModel } from "../../view-models/project-workspace.viewmodel";
import { TFunction } from "./types";

interface KpiRowProps {
  kpis: ProjectOverviewKpiId[];
  viewModel: OverviewViewModel;
  t: TFunction;
}

export function KpiRow({ kpis, viewModel, t }: KpiRowProps) {
  if (kpis.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpiId) => {
        switch (kpiId) {
          case "progressPercent":
            return (
              <StatsCard
                key={kpiId}
                title={t("projects:overview.kpi.progress")}
                value={`${viewModel.progressPercent}%`}
              />
            );
          case "currentStage":
            return (
              <StatsCard
                key={kpiId}
                title={t("projects:overview.kpi.currentStage")}
                value={t(viewModel.internalPhases[viewModel.currentPhaseIndex]?.labelKey || "")}
              />
            );
          case "openObstaclesCount":
            return (
              <StatsCard
                key={kpiId}
                title={t("projects:overview.kpi.openObstacles")}
                value={viewModel.openObstaclesCount}
              />
            );
          case "invoiceStatus":
            return (
              <StatsCard
                key={kpiId}
                title={t("projects:overview.kpi.invoiceStatus")}
                value={
                  viewModel.invoice
                    ? t(`projects:overview.invoice.status.${viewModel.invoice.status}`)
                    : t("projects:overview.invoice.none")
                }
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
