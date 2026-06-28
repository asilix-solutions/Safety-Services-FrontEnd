import React from "react";
import { SuperAdminOverviewViewModel } from "./view-model";
import {
  OverviewShell,
  OverviewWelcomeCard,
  OverviewSummaryCard,
  OverviewActionList,
  OverviewEntityList,
  OverviewRecentActivity,
  OverviewQuickAccess,
} from "../dashboard-overview";
import { Building2, AlertTriangle, Clock } from "lucide-react";

interface SuperAdminOverviewProps {
  viewModel: SuperAdminOverviewViewModel;
}

export function SuperAdminOverview({ viewModel }: SuperAdminOverviewProps) {
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

      {/* 3. Primary Dashboard Grid (3 Columns) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Actions Required column */}
        <div className="md:col-span-1">
          <OverviewActionList
            titleKey="superAdmin.overview.requiredActions"
            titleFallback="Actions Required"
            items={viewModel.actionItems}
          />
        </div>

        {/* Recent Companies column */}
        <div className="md:col-span-1">
          <OverviewEntityList
            titleKey="superAdmin.overview.recentCompanies"
            titleFallback="Recent Company Registrations"
            viewAllKey="overview_view_all"
            viewAllHref="/companies"
            items={viewModel.recentCompanies}
            icon={<Building2 className="h-4.5 w-4.5 text-primary" />}
          />
        </div>

        {/* Platform Activity Feed column */}
        <div className="md:col-span-1">
          <OverviewRecentActivity
            titleKey="superAdmin.overview.recentActivity"
            titleFallback="Recent Platform Activity"
            events={viewModel.recentActivity}
          />
        </div>
      </div>

      {/* 4. Secondary Dashboard Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverviewEntityList
          titleKey="superAdmin.overview.companiesRequiringAttention"
          titleFallback="Companies Requiring Attention"
          viewAllKey="overview_view_all"
          viewAllHref="/companies"
          items={viewModel.companiesRequiringAttention}
          icon={<AlertTriangle className="h-4.5 w-4.5 text-destructive" />}
        />

        <OverviewEntityList
          titleKey="superAdmin.overview.expiringSubscriptions"
          titleFallback="Expiring Subscriptions"
          viewAllKey="overview_view_all"
          viewAllHref="/subscriptions"
          items={viewModel.expiringSubscriptionsQueue}
          icon={<Clock className="h-4.5 w-4.5 text-amber-500" />}
        />
      </div>

      {/* 5. Quick Access Shortcut Cards */}
      <OverviewQuickAccess
        titleKey="superAdmin.overview.quickAccess"
        titleFallback="Quick Access"
        links={viewModel.quickAccessLinks}
      />
    </OverviewShell>
  );
}

export default SuperAdminOverview;
