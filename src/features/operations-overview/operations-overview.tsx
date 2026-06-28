import React from "react";
import { OperationsOverviewViewModel } from "./view-model";
import {
  OverviewShell,
  OverviewWelcomeCard,
  OverviewSummaryCard,
  OverviewActionList,
  OverviewEntityList,
  OverviewRecentActivity,
  OverviewQuickAccess,
  OverviewEmptyState,
} from "../dashboard-overview";
import { Calendar, FolderOpen, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

interface OperationsOverviewProps {
  viewModel: OperationsOverviewViewModel;
}

export function OperationsOverview({ viewModel }: OperationsOverviewProps) {
  const { t } = useTranslation();

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
            titleKey="operations_action_required"
            titleFallback="Actions Required"
            items={viewModel.actionItems}
          />
        </div>

        {/* Schedule & Active Projects column */}
        <div className="md:col-span-1 space-y-4">
          <OverviewEntityList
            titleKey="operations_today_schedule"
            titleFallback="Today's Schedule"
            viewAllKey="overview_view_all"
            viewAllHref="/site-visits"
            items={viewModel.todaySchedule}
            icon={<Calendar className="h-4.5 w-4.5 text-primary" />}
          />

          <OverviewEntityList
            titleKey="operations_active_projects"
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
            titleKey="operations_recent_activity"
            titleFallback="Recent Activity"
            events={viewModel.recentActivity}
          />
        </div>
      </div>

      {/* 4. Quick Access Shortcut Cards */}
      <OverviewQuickAccess
        titleKey="operations_quick_access"
        titleFallback="Quick Access"
        links={viewModel.quickAccessLinks}
      />
    </OverviewShell>
  );
}
