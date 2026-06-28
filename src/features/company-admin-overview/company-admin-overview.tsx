import React from "react";
import { CompanyAdminOverviewViewModel } from "./view-model";
import {
  OverviewShell,
  OverviewWelcomeCard,
  OverviewSummaryCard,
  OverviewActionList,
  OverviewEntityList,
  OverviewRecentActivity,
  OverviewQuickAccess,
} from "../dashboard-overview";
import { FileQuestion, FolderOpen } from "lucide-react";

interface CompanyAdminOverviewProps {
  viewModel: CompanyAdminOverviewViewModel;
}

export function CompanyAdminOverview({ viewModel }: CompanyAdminOverviewProps) {
  return (
    <OverviewShell>
      {/* 1. Welcome Card */}
      <OverviewWelcomeCard
        name={viewModel.welcomeCardProps.name}
        roleLabel={viewModel.welcomeCardProps.roleLabel}
        subtitle={viewModel.welcomeCardProps.subtitle}
      />

      {/* 2. Summary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {viewModel.summaryCards.map((card) => (
          <OverviewSummaryCard key={card.id} card={card} />
        ))}
      </div>

      {/* 3. Primary Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Actions Required column */}
        <div className="md:col-span-1">
          <OverviewActionList
            titleKey="companyAdmin.overview.requiredActions"
            titleFallback="Actions Required"
            items={viewModel.actionItems}
          />
        </div>

        {/* Requests & Projects column */}
        <div className="md:col-span-1 space-y-4">
          <OverviewEntityList
            titleKey="companyAdmin.overview.recentRequestsQueue"
            titleFallback="Recent Requests Queue"
            viewAllKey="overview_view_all"
            viewAllHref="/requests"
            items={viewModel.recentRequests}
            icon={<FileQuestion className="h-4.5 w-4.5 text-primary" />}
          />

          <OverviewEntityList
            titleKey="companyAdmin.overview.activeProjectsList"
            titleFallback="Active Projects"
            viewAllKey="overview_view_all"
            viewAllHref="/projects"
            items={viewModel.activeProjects}
            icon={<FolderOpen className="h-4.5 w-4.5 text-sky-500" />}
          />
        </div>

        {/* Recent Activity Feed column */}
        <div className="md:col-span-1">
          <OverviewRecentActivity
            titleKey="companyAdmin.overview.recentActivity"
            titleFallback="Recent Activity"
            events={viewModel.recentActivity}
          />
        </div>
      </div>

      {/* 4. Quick Access Shortcut Cards */}
      <OverviewQuickAccess
        titleKey="companyAdmin.overview.quickAccess"
        titleFallback="Quick Access"
        links={viewModel.quickAccessLinks}
      />
    </OverviewShell>
  );
}
export default CompanyAdminOverview;
