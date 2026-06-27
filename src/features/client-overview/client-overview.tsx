import React from "react";
import { ClientOverviewViewModel } from "./view-model";
import {
  OverviewShell,
  OverviewWelcomeCard,
  OverviewActionList,
  OverviewEntityList,
  OverviewRecentActivity,
  OverviewQuickAccess,
} from "../dashboard-overview";
import { FileQuestion, FolderOpen } from "lucide-react";

interface ClientOverviewProps {
  viewModel: ClientOverviewViewModel;
}

export function ClientOverview({ viewModel }: ClientOverviewProps) {
  return (
    <OverviewShell>
      {/* 1. Welcome Card */}
      <OverviewWelcomeCard
        name={viewModel.welcomeCardProps.name}
        subtitle={viewModel.welcomeCardProps.subtitle}
        stats={viewModel.welcomeCardProps.stats}
        actions={viewModel.welcomeCardProps.actions}
      />

      {/* 2. Quick Access Shortcut Cards */}
      <OverviewQuickAccess
        titleKey="overview_quick_access"
        titleFallback="Quick Access"
        links={viewModel.quickAccessLinks}
      />

      {/* 3. Primary Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Actions Required column */}
        <div className="md:col-span-1">
          <OverviewActionList
            titleKey="overview_actions_required"
            titleFallback="Actions Required"
            items={viewModel.actionItems}
          />
        </div>

        {/* Requests & Projects column */}
        <div className="md:col-span-1 space-y-6">
          <OverviewEntityList
            titleKey="overview_recent_requests"
            titleFallback="My Recent Requests"
            viewAllKey="overview_view_all"
            viewAllHref="/requests"
            items={viewModel.recentRequests}
            icon={<FileQuestion className="h-4.5 w-4.5 text-primary" />}
          />
          <OverviewEntityList
            titleKey="overview_active_projects_section"
            titleFallback="Active Projects"
            viewAllKey="overview_view_all"
            viewAllHref="/projects"
            items={viewModel.activeProjects}
            icon={<FolderOpen className="h-4.5 w-4.5 text-sky-500" />}
          />
        </div>

        {/* Recent Activity Timeline column */}
        <div className="md:col-span-1">
          <OverviewRecentActivity
            titleKey="overview_recent_updates"
            titleFallback="Recent Updates"
            events={viewModel.recentActivity}
          />
        </div>
      </div>
    </OverviewShell>
  );
}

