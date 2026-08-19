import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Check } from "lucide-react";
import { ProjectOverviewWidgetId } from "@/constants/permissions";
import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { OverviewViewModel } from "../../view-models/project-workspace.viewmodel";
import { ResolvedDocuments } from "../../helpers/documents";
import { TFunction } from "./types";

import { LinkedRequestCard } from "../linked-request-card";
import { ProjectHealthCard } from "../project-health-card";
import { RequestDocumentsCard } from "../request-documents-card";
import { ContractsCard } from "../contracts-card";
import { CertificatesCard } from "../certificates-card";
import { NextActionCard } from "./next-action-card";
import { InspectionStatusCard } from "./inspection-status-card";
import { SiteVisitsCard } from "./site-visits-card";
import { QuotationSummaryCard } from "./quotation-summary-card";
import { InvoiceSummaryCard } from "./invoice-summary-card";
import { CustomerInfoCard } from "./customer-info-card";
import { PlaceholderWidgetCard } from "./placeholder-widget-card";

interface WidgetGridProps {
  widgets: ProjectOverviewWidgetId[];
  project: Project;
  request: LicensingRequest | null;
  documents: ResolvedDocuments;
  viewModel: OverviewViewModel;
  t: TFunction;
}

export function WidgetGrid({ widgets, project, request, documents, viewModel, t }: WidgetGridProps) {
  return (
    <>
      {widgets.map((widgetId) => {
        switch (widgetId) {
          case "phaseStepper":
            return (
              <Card key={widgetId} className="border-border bg-card">
                <CardContent className="p-5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    {t("projects:phases.title")}
                  </h3>
                  <div className="grid grid-cols-5 gap-2 relative">
                    {viewModel.internalPhases.map((phase, idx) => {
                      const isPast = idx < viewModel.currentPhaseIndex;
                      const isCurrent = idx === viewModel.currentPhaseIndex;
                      return (
                        <div key={phase.id} className="flex flex-col items-center text-center space-y-2 relative">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isPast
                                ? "bg-success text-success-foreground"
                                : isCurrent
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isPast ? <Check className="h-3 w-3" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] ${
                              isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                            }`}
                          >
                            {t(phase.labelKey)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );

          case "projectHealth":
            return <ProjectHealthCard key={widgetId} health={viewModel.health} projectStatus={project.status} t={t} />;

          case "nextAction":
            return <NextActionCard key={widgetId} nextActionLabelKey={viewModel.nextActionLabelKey} t={t} />;

          case "linkedRequest":
            return request ? <LinkedRequestCard key={widgetId} request={request} t={t} /> : null;

          case "documents":
            return (
              <Card key={widgetId} className="border-border bg-card">
                <CardContent className="pt-4 space-y-4 text-xs">
                  <RequestDocumentsCard documents={documents.requestDocuments} t={t} />
                  <ContractsCard contract={documents.contract} t={t} />
                  <CertificatesCard certificate={documents.certificate} t={t} />
                </CardContent>
              </Card>
            );

          case "inspectionStatus":
            return <InspectionStatusCard key={widgetId} project={project} t={t} />;

          case "siteVisits":
            return <SiteVisitsCard key={widgetId} projectId={project.id} t={t} />;

          case "quotationSummary":
            return <QuotationSummaryCard key={widgetId} quotation={viewModel.quotation} t={t} />;

          case "invoiceSummary":
            return <InvoiceSummaryCard key={widgetId} invoice={viewModel.invoice} t={t} />;

          case "customerInfo":
            return <CustomerInfoCard key={widgetId} project={project} t={t} />;

          case "assignedEngineer":
            return (
              <PlaceholderWidgetCard
                key={widgetId}
                titleKey="projects:overview.placeholder.assignedEngineer.title"
                descriptionKey="projects:overview.placeholder.assignedEngineer.desc"
                t={t}
              />
            );

          case "assignedResources":
            return (
              <PlaceholderWidgetCard
                key={widgetId}
                titleKey="projects:overview.placeholder.assignedResources.title"
                descriptionKey="projects:overview.placeholder.assignedResources.desc"
                t={t}
              />
            );

          case "procurementStatus":
            return (
              <PlaceholderWidgetCard
                key={widgetId}
                titleKey="projects:overview.placeholder.procurementStatus.title"
                descriptionKey="projects:overview.placeholder.procurementStatus.desc"
                t={t}
              />
            );

          case "team":
            return (
              <PlaceholderWidgetCard
                key={widgetId}
                titleKey="projects:overview.placeholder.team.title"
                descriptionKey="projects:overview.placeholder.team.desc"
                t={t}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
