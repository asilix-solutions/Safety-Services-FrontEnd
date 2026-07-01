import { Project } from "@/types/project";
import { ClientInvoice } from "@/domains/invoices/types";
import { ClientContract } from "@/domains/contracts/types";
import { ClientCertificate } from "@/domains/certificates/types";
import { LicensingRequest } from "@/domains/requests/types";
import { SiteVisit } from "@/domains/site-visits/storage";
import { getActiveProjects, getPendingReports } from "@/domains/projects/storage";
import {
  OverviewStatCard,
  OverviewActionItem,
  OverviewEntityItem,
  OverviewActivityItem,
  OverviewQuickAccessItem,
  OverviewWelcomeBtn,
  OverviewStatItem,
} from "@/features/dashboard-overview";

export interface OperationsOverviewViewModel {
  welcomeCardProps: {
    name: string;
    roleLabel: string;
    subtitle: string;
    stats?: OverviewStatItem[];
    actions?: OverviewWelcomeBtn[];
  };
  summaryCards: OverviewStatCard[];
  actionItems: OverviewActionItem[];
  todaySchedule: OverviewEntityItem[];
  activeProjects: OverviewEntityItem[];
  recentActivity: OverviewActivityItem[];
  quickAccessLinks: OverviewQuickAccessItem[];
  hasObstacles: boolean;
}

export function prepareOperationsOverviewViewModel(
  user: { name: string; role: string },
  data: {
    projects: Project[];
    requests: LicensingRequest[];
    invoices: ClientInvoice[];
    contracts: ClientContract[];
    certificates: ClientCertificate[];
    siteVisits: SiteVisit[];
  }
): OperationsOverviewViewModel {
  const todayStr = "2026-06-28"; // Consistent with local system time in metadata

  // 1. Summary Counts using centralized selectors
  const activeProjectsList = getActiveProjects();
  const pendingReportsCount = getPendingReports().length;
  const todayVisits = data.siteVisits.filter((v) => v.scheduledDate.startsWith(todayStr));



  const openObstaclesCount = data.projects.reduce(
    (sum, p) =>
      sum +
      (p.workspace?.execution?.silos?.reduce((s, silo) => s + (silo.obstaclesCount || 0), 0) || 0),
    0
  );

  const activeProjectsCount = activeProjectsList.length;
  const todayVisitsCount = todayVisits.length;

  const welcomeStats: OverviewStatItem[] = [
    {
      labelKey: "operations_active_projects",
      labelFallback: "Active Projects",
      count: activeProjectsCount,
      badgeVariant: "info",
    },
    {
      labelKey: "operations_today_visits",
      labelFallback: "Today's Visits",
      count: todayVisitsCount,
      badgeVariant: "success",
    },
    {
      labelKey: "operations_pending_reports",
      labelFallback: "Pending Reports",
      count: pendingReportsCount,
      badgeVariant: "warning",
    },
    {
      labelKey: "operations_open_obstacles",
      labelFallback: "Open Obstacles",
      count: openObstaclesCount,
      badgeVariant: openObstaclesCount > 0 ? "destructive" : "default",
    },
  ];

  const welcomeActions: OverviewWelcomeBtn[] = [
    {
      labelKey: "overview_view_all",
      labelFallback: "View Projects",
      href: "/projects",
      iconName: "search",
      variant: "default",
    },
    {
      labelKey: "operations_today_visits",
      labelFallback: "Manage Visits",
      href: "/site-visits",
      iconName: "plus",
      variant: "outline",
    },
  ];

  const summaryCards: OverviewStatCard[] = [
    {
      id: "active-projects",
      labelKey: "operations_active_projects",
      labelFallback: "Active Projects",
      value: activeProjectsCount,
      iconName: "project",
      href: "/projects",
      variant: "info",
    },
    {
      id: "today-visits",
      labelKey: "operations_today_visits",
      labelFallback: "Today's Site Visits",
      value: todayVisitsCount,
      iconName: "request",
      href: "/site-visits",
      variant: "success",
    },
    {
      id: "pending-reports",
      labelKey: "operations_pending_reports",
      labelFallback: "Pending Reports",
      value: pendingReportsCount,
      iconName: "contract",
      href: "/projects",
      variant: "warning",
    },
    {
      id: "open-obstacles",
      labelKey: "operations_open_obstacles",
      labelFallback: "Open Obstacles",
      value: openObstaclesCount,
      iconName: "certificate",
      href: "/projects",
      variant: openObstaclesCount > 0 ? "destructive" : "default",
    },
  ];

  // 2. Action Items
  const actionItems: OverviewActionItem[] = [];

  // Contract awaiting client signature
  data.contracts
    .filter((c) => c.status === "generated")
    .forEach((c) => {
      actionItems.push({
        id: `action-contract-${c.id}`,
        titleKey: "operations_action_signature_pending",
        titleFallback: "Client Signature Missing",
        descriptionFallback: `Contract for ${c.title || c.id} is generated and awaiting signature.`,
        href: "/contracts",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: c.id,
      });
    });

  // Projects pending final inspection review
  data.projects
    .filter((p) => p.executionPhase === "ready_for_final_inspection" && !p.workspace?.inspection?.completedAt)
    .forEach((p) => {
      actionItems.push({
        id: `action-inspection-${p.id}`,
        titleKey: "operations_action_inspection_pending",
        titleFallback: "Inspection Report Pending",
        descriptionFallback: `Project ${p.name} is ready for final inspection.`,
        href: "/projects",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: p.id,
      });
    });

  // Projects with blocked silos (obstacles)
  data.projects.forEach((p) => {
    const blockedSilos = p.workspace?.execution?.silos?.filter((s) => s.status === "blocked") || [];
    blockedSilos.forEach((silo) => {
      actionItems.push({
        id: `action-obstacle-${p.id}-${silo.id}`,
        titleKey: "operations_action_obstacle_unresolved",
        titleFallback: "Obstacle Unresolved",
        descriptionFallback: `Blocked silo: ${silo.id} in project ${p.name}.`,
        href: "/projects",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: p.id,
      });
    });
  });

  // 3. Today's Schedule
  const todaySchedule = todayVisits.map((v): OverviewEntityItem => {
    let timeStr = "";
    try {
      timeStr = new Date(v.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      timeStr = v.scheduledDate;
    }
    return {
      id: v.id,
      title: v.projectName,
      subtitle: v.location,
      statusKey: `visit_status_${v.status}`,
      statusFallback: v.status,
      metaText: timeStr,
      href: "/site-visits",
    };
  });

  // 4. Active Projects
  const activeProjects = [...activeProjectsList]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5)
    .map((proj): OverviewEntityItem => {
      let progress = 30;
      if (proj.executionPhase === "completed") {
        progress = 100;
      } else if (proj.executionPhase === "ready_for_final_inspection") {
        progress = 85;
      } else if (proj.executionPhase === "active_execution") {
        progress = 60;
      } else if (proj.executionPhase === "kickoff_ready") {
        progress = 20;
      }
      return {
        id: proj.id,
        title: proj.name,
        subtitle: proj.jobNumber,
        statusKey: `project_stage_${(proj.executionPhase || "").toLowerCase()}`,
        statusFallback: proj.executionPhase,
        progress,
        href: `/projects`,
      };
    });

  // 5. Recent Activity
  const activities: OverviewActivityItem[] = [];

  data.requests.forEach((req) => {
    const statusMap: Record<string, string> = {
      draft: "request_status_draft",
      submitted: "request_status_pending_review",
      under_review: "request_status_in_review",
      assigned: "request_status_in_review",
      quotation_created: "request_status_in_review",
      awaiting_approval: "request_status_action_required",
      approved: "request_status_approved",
      rejected: "request_status_rejected",
      completed: "request_status_approved",
      closed: "request_status_rejected",
    };
    const mappedTitleKey = statusMap[(req.status || "").toLowerCase()] || `request_status_${(req.status || "").toLowerCase()}`;

    activities.push({
      id: `act-req-${req.id}`,
      type: "request",
      titleKey: mappedTitleKey,
      titleFallback: `Request ${req.jobNumber} status: ${req.status}`,
      timestamp: req.updatedAt || req.createdAt,
      referenceId: req.jobNumber,
      descriptionFallback: req.facilityName,
      href: `/requests/${req.jobNumber}`,
    });
  });

  data.projects.forEach((proj) => {
    activities.push({
      id: `act-proj-${proj.id}`,
      type: "project",
      titleKey: `project_stage_${(proj.executionPhase || "").toLowerCase()}`,
      titleFallback: `Project ${proj.name} reached phase ${proj.executionPhase}`,
      timestamp: proj.updatedAt || proj.createdAt || new Date().toISOString(),
      referenceId: proj.jobNumber || proj.id,
      descriptionFallback: proj.name,
      href: `/projects`,
    });
  });

  const recentActivity = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // 6. Quick Access
  const quickAccessLinks: OverviewQuickAccessItem[] = [
    {
      id: "qa-projects",
      labelKey: "overview_type_project",
      labelFallback: "Project",
      count: data.projects.length,
      href: "/projects",
      iconName: "project",
    },
    {
      id: "qa-visits",
      labelKey: "operations_today_visits",
      labelFallback: "Site Visits",
      count: data.siteVisits.length,
      href: "/site-visits",
      iconName: "project",
    },
    {
      id: "qa-requests",
      labelKey: "overview_type_request",
      labelFallback: "Request",
      count: data.requests.length,
      href: "/requests",
      iconName: "request",
    },
    {
      id: "qa-invoices",
      labelKey: "overview_type_invoice",
      labelFallback: "Invoice",
      count: data.invoices.length,
      href: "/invoices",
      iconName: "invoice",
    },
    {
      id: "qa-contracts",
      labelKey: "overview_type_contract",
      labelFallback: "Contract",
      count: data.contracts.length,
      href: "/contracts",
      iconName: "contract",
    },
    {
      id: "qa-certificates",
      labelKey: "overview_type_certificate",
      labelFallback: "Certificate",
      count: data.certificates.length,
      href: "/certificates",
      iconName: "certificate",
    },
  ];

  return {
    welcomeCardProps: {
      name: user.name,
      roleLabel: user.role,
      subtitle: todayStr,
    },
    summaryCards,
    actionItems,
    todaySchedule,
    activeProjects,
    recentActivity,
    quickAccessLinks,
    hasObstacles: openObstaclesCount > 0,
  };
}
