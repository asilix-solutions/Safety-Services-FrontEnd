import React from "react";
import { ConsultingEngineerOverviewViewModel } from "./view-model";
import {
  OverviewShell,
  OverviewWelcomeCard,
  OverviewSummaryCard,
  OverviewActionList,
  OverviewEntityList,
  OverviewRecentActivity,
  OverviewQuickAccess,
} from "../dashboard-overview";
import { Calendar, FileQuestion, FolderOpen } from "lucide-react";

interface ConsultingEngineerOverviewProps {
  viewModel: ConsultingEngineerOverviewViewModel;
}

export function ConsultingEngineerOverview({ viewModel }: ConsultingEngineerOverviewProps) {
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

      {/* 3. Primary Dashboard Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Actions Required column */}
        <div className="md:col-span-1">
          <OverviewActionList
            titleKey="consultingEngineer.overview.requiredActions"
            titleFallback="Actions Required"
            items={viewModel.actionItems}
          />
        </div>

        {/* Upcoming Site Visits column */}
        <div className="md:col-span-1">
          <OverviewEntityList
            titleKey="consultingEngineer.overview.upcomingSiteVisits"
            titleFallback="Upcoming Site Visits"
            viewAllKey="overview_view_all"
            viewAllHref="/site-visits"
            items={viewModel.upcomingSiteVisits}
            icon={<Calendar className="h-4.5 w-4.5 text-primary" />}
          />
        </div>

        {/* Recent Engineering Activity Feed column */}
        <div className="md:col-span-1">
          <OverviewRecentActivity
            titleKey="consultingEngineer.overview.recentActivity"
            titleFallback="Recent Activity"
            events={viewModel.recentActivity}
          />
        </div>
      </div>

      {/* 4. Secondary Dashboard Row (Engineering Review Queue & Pending Quotations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverviewEntityList
          titleKey="consultingEngineer.overview.reviewQueue"
          titleFallback="Engineering Review Queue"
          viewAllKey="overview_view_all"
          viewAllHref="/requests"
          items={viewModel.reviewQueue}
          icon={<FileQuestion className="h-4.5 w-4.5 text-sky-500" />}
        />

        <OverviewEntityList
          titleKey="consultingEngineer.overview.pendingQuotations"
          titleFallback="Pending Quotations"
          viewAllKey="overview_view_all"
          viewAllHref="/quotations"
          items={viewModel.pendingQuotationsQueue}
          icon={<FolderOpen className="h-4.5 w-4.5 text-amber-500" />}
        />
      </div>

      {/* 5. Quick Access Shortcut Cards */}
      <OverviewQuickAccess
        titleKey="consultingEngineer.overview.quickAccess"
        titleFallback="Quick Access"
        links={viewModel.quickAccessLinks}
      />
    </OverviewShell>
  );
}

export default ConsultingEngineerOverview;
