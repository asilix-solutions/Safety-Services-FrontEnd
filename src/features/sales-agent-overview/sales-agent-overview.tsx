import React from "react";
import { SalesAgentOverviewViewModel } from "./view-model";
import {
  OverviewShell,
  OverviewWelcomeCard,
  OverviewSummaryCard,
  OverviewActionList,
  OverviewEntityList,
  OverviewRecentActivity,
  OverviewQuickAccess,
} from "../dashboard-overview";
import { User, FileText } from "lucide-react";

interface SalesAgentOverviewProps {
  viewModel: SalesAgentOverviewViewModel;
}

export function SalesAgentOverview({ viewModel }: SalesAgentOverviewProps) {
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
            titleKey="salesAgent.overview.requiredActions"
            titleFallback="Actions Required"
            items={viewModel.actionItems}
          />
        </div>

        {/* Queues (Customer Follow-up Queue & Recent Customer Requests Queue) */}
        <div className="md:col-span-1 space-y-4">
          <OverviewEntityList
            titleKey="salesAgent.overview.customerFollowUpQueue"
            titleFallback="Customer Follow-up Queue"
            viewAllKey="overview_view_all"
            viewAllHref="/requests"
            items={viewModel.customerFollowUpQueue}
            icon={<User className="h-4.5 w-4.5 text-primary" />}
          />

          <OverviewEntityList
            titleKey="salesAgent.overview.recentCustomerRequests"
            titleFallback="Recent Customer Requests"
            viewAllKey="overview_view_all"
            viewAllHref="/requests"
            items={viewModel.recentCustomerRequests}
            icon={<FileText className="h-4.5 w-4.5 text-sky-500" />}
          />
        </div>

        {/* Recent Activity Feed */}
        <div className="md:col-span-1">
          <OverviewRecentActivity
            titleKey="salesAgent.overview.recentActivity"
            titleFallback="Recent Activity"
            events={viewModel.recentActivity}
          />
        </div>
      </div>

      {/* 4. Quick Access Shortcut Cards */}
      <OverviewQuickAccess
        titleKey="salesAgent.overview.quickAccess"
        titleFallback="Quick Access"
        links={viewModel.quickAccessLinks}
      />
    </OverviewShell>
  );
}

export default SalesAgentOverview;
