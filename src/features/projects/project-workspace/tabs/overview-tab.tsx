import React from "react";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { OverviewViewModel } from "../view-models/project-workspace.viewmodel";
import { ResolvedDocuments } from "../helpers/documents";
import { KpiRow } from "../components/overview/kpi-row";
import { WidgetGrid } from "../components/overview/widget-grid";
import { ActionPanel } from "../components/overview/action-panel";
import { TFunction } from "../components/overview/types";

interface OverviewTabProps {
  project: Project;
  request: LicensingRequest | null;
  documents: ResolvedDocuments;
  viewModel: OverviewViewModel;
  isProcessing: boolean;
  handleStartExecution: () => void;
  t: TFunction;
}

export function OverviewTab({
  project,
  request,
  documents,
  viewModel,
  isProcessing,
  handleStartExecution,
  t
}: OverviewTabProps) {
  const { widgets, kpis, actions } = viewModel.roleConfig;

  return (
    <div className="space-y-6">
      <KpiRow kpis={kpis} viewModel={viewModel} t={t} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <WidgetGrid widgets={widgets} project={project} request={request} documents={documents} viewModel={viewModel} t={t} />
        </div>

        <div className="space-y-6">
          <ActionPanel
            actions={actions}
            project={project}
            isProcessing={isProcessing}
            handleStartExecution={handleStartExecution}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
