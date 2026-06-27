import React from "react";
import { ClientOverviewViewModel } from "./view-model";
import { WelcomeCard } from "./components/welcome-card";
import { ActionRequired } from "./components/action-required";
import { RecentRequests } from "./components/recent-requests";
import { ActiveProjects } from "./components/active-projects";
import { RecentActivity } from "./components/recent-activity";
import { QuickAccess } from "./components/quick-access";

interface ClientOverviewProps {
  viewModel: ClientOverviewViewModel;
}

export function ClientOverview({ viewModel }: ClientOverviewProps) {
  return (
    <div className="space-y-6">
      {/* 1. Welcome Card */}
      <WelcomeCard
        clientName={viewModel.welcomeStats.clientName}
        companyName={viewModel.welcomeStats.companyName}
        activeRequestsCount={viewModel.welcomeStats.activeRequestsCount}
        activeProjectsCount={viewModel.welcomeStats.activeProjectsCount}
      />

      {/* 2. Quick Access Shortcut Cards */}
      <QuickAccess counts={viewModel.quickAccessCounts} />

      {/* 3. Primary Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Actions Required column */}
        <div className="md:col-span-1">
          <ActionRequired items={viewModel.actionItems} />
        </div>

        {/* Requests & Projects column */}
        <div className="md:col-span-1 space-y-6">
          <RecentRequests requests={viewModel.recentRequests} />
          <ActiveProjects projects={viewModel.activeProjects} />
        </div>

        {/* Recent Activity Timeline column */}
        <div className="md:col-span-1">
          <RecentActivity events={viewModel.recentActivity} />
        </div>
      </div>
    </div>
  );
}
