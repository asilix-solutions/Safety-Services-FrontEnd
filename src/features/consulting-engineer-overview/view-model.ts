import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { Quotation } from "@/domains/quotations/types";
import { SiteVisit } from "@/domains/site-visits/types";
import {
  OverviewStatCard,
  OverviewActionItem,
  OverviewEntityItem,
  OverviewActivityItem,
  OverviewQuickAccessItem,
} from "@/features/dashboard-overview";

export interface ConsultingEngineerOverviewViewModel {
  welcomeCardProps: {
    name: string;
    roleLabel: string;
    subtitle: string;
  };
  summaryCards: OverviewStatCard[];
  actionItems: OverviewActionItem[];
  upcomingSiteVisits: OverviewEntityItem[];
  reviewQueue: OverviewEntityItem[];
  pendingQuotationsQueue: OverviewEntityItem[];
  recentActivity: OverviewActivityItem[];
  quickAccessLinks: OverviewQuickAccessItem[];
}

export function prepareConsultingEngineerOverviewViewModel(
  user: { name: string; role: string },
  data: {
    projects: Project[];
    requests: LicensingRequest[];
    quotations: Quotation[];
    siteVisits: SiteVisit[];
  }
): ConsultingEngineerOverviewViewModel {
  const todayStr = "2026-06-28"; // System date for consistent display

  // Filter requests that require engineering/blueprint/high hazard review
  const engineeringRequests = data.requests.filter(
    (r) =>
      r.currentStage === "UNDER_REVIEW" &&
      (r.classification === "engineering_project" ||
        r.classification === "high_hazard_review" ||
        r.engineeringReviewRequired)
  );

  // Filter pending quotations
  const pendingQuotations = data.quotations.filter(
    (q) => q.quotationStatus === "DRAFT" || q.quotationStatus === "CHANGES_REQUESTED"
  );

  // Filter pending reports (Projects in final inspection phase needing approval/completedAt)
  const pendingReports = data.projects.filter(
    (p) =>
      p.executionPhase === "ready_for_final_inspection" &&
      (!p.workspace?.inspection?.completedAt || !p.workspace?.inspection?.approved)
  );

  // Filter upcoming site visits
  const upcomingVisitsList = data.siteVisits.filter((v) => v.status === "upcoming");

  // Summary Cards (Ordered by recommended engineering lifecycle lifecycle: Reviews -> Quotations -> Reports -> Site Visits)
  const summaryCards: OverviewStatCard[] = [
    {
      id: "eng-assigned-reviews",
      labelKey: "consultingEngineer.overview.assignedReviews",
      labelFallback: "Assigned Engineering Reviews",
      value: engineeringRequests.length,
      iconName: "request",
      href: "/requests",
      variant: "info",
    },
    {
      id: "eng-pending-quotations",
      labelKey: "consultingEngineer.overview.pendingQuotations",
      labelFallback: "Pending Quotations",
      value: pendingQuotations.length,
      iconName: "contract",
      href: "/quotations",
      variant: "warning",
    },
    {
      id: "eng-pending-reports",
      labelKey: "consultingEngineer.overview.pendingReports",
      labelFallback: "Pending Technical Reports",
      value: pendingReports.length,
      iconName: "certificate",
      href: "/projects",
      variant: "default",
    },
    {
      id: "eng-upcoming-visits",
      labelKey: "consultingEngineer.overview.upcomingSiteVisits",
      labelFallback: "Upcoming Site Visits",
      value: upcomingVisitsList.length,
      iconName: "project",
      href: "/site-visits",
      variant: "success",
    },
  ];

  // Action Items
  const actionItems: OverviewActionItem[] = [];

  // 1. Blueprint/Engineering Reviews
  engineeringRequests.forEach((r) => {
    actionItems.push({
      id: `action-eng-review-${r.jobNumber}`,
      titleKey: "consultingEngineer.overview.openBlueprintReview",
      titleFallback: "Open Blueprint Review",
      descriptionFallback: `Review blueprint and safety info for ${r.facilityName} (${r.jobNumber})`,
      href: `/blueprint-review/${r.jobNumber}`,
      actionLabelKey: "view",
      actionLabelFallback: "View",
      referenceId: r.jobNumber,
      priority: r.classification === "high_hazard_review" ? "critical" : "high",
    });
  });

  // 2. Draft/Revise Quotations
  pendingQuotations.forEach((q) => {
    const isRevision = q.quotationStatus === "CHANGES_REQUESTED";
    actionItems.push({
      id: `action-eng-quotation-${q.jobNumber}`,
      titleKey: isRevision
        ? "consultingEngineer.overview.reviseQuotation"
        : "consultingEngineer.overview.prepareQuotation",
      titleFallback: isRevision ? "Revise Quotation" : "Prepare Quotation",
      descriptionFallback: isRevision
        ? `Revise quotation for job ${q.jobNumber}. Feedback: ${q.rejectionReason || q.reviewComments || ""}`
        : `Draft quotation pricing details for job ${q.jobNumber}`,
      href: `/quotations/${q.jobNumber}`,
      actionLabelKey: "open",
      actionLabelFallback: "Open",
      referenceId: q.jobNumber,
      priority: isRevision ? "high" : "medium",
    });
  });

  // 3. Complete Site Visits
  upcomingVisitsList.forEach((v) => {
    actionItems.push({
      id: `action-eng-visit-${v.id}`,
      titleKey: "consultingEngineer.overview.completeSiteVisit",
      titleFallback: "Complete Site Visit",
      descriptionFallback: `Inspection at ${v.location} for ${v.projectName}`,
      href: `/site-visits`,
      actionLabelKey: "open",
      actionLabelFallback: "Open",
      referenceId: v.id,
      priority: "medium",
    });
  });

  // 4. Pending Final Inspection Reports
  pendingReports.forEach((p) => {
    actionItems.push({
      id: `action-eng-report-${p.id}`,
      titleKey: "consultingEngineer.overview.prepareTechnicalReport",
      titleFallback: "Prepare Technical Report",
      descriptionFallback: `Prepare & approve final technical report for ${p.name}`,
      href: `/projects/${p.id}`,
      actionLabelKey: "open",
      actionLabelFallback: "Open",
      referenceId: p.jobNumber || p.id,
      priority: "high",
    });
  });

  // Upcoming Site Visits List (Queue 1)
  const upcomingSiteVisits = upcomingVisitsList
    .slice(0, 5)
    .map((v): OverviewEntityItem => {
      let timeStr = "";
      try {
        timeStr = new Date(v.scheduledDate).toLocaleDateString([], { month: "short", day: "numeric" });
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

  // Engineering Review Queue (Queue 2)
  const reviewQueue = engineeringRequests
    .slice(0, 5)
    .map((r): OverviewEntityItem => {
      return {
        id: r.id,
        title: r.facilityName,
        subtitle: r.jobNumber,
        statusKey: `request_status_${r.status.toLowerCase()}`,
        statusFallback: r.status,
        metaText: r.classification === "high_hazard_review" ? "High Hazard" : "Engineering",
        href: `/requests/${r.jobNumber}`,
      };
    });

  // Pending Quotations Queue (Queue 3)
  const pendingQuotationsQueue = pendingQuotations
    .slice(0, 5)
    .map((q): OverviewEntityItem => {
      const associatedReq = data.requests.find((r) => r.jobNumber === q.jobNumber);
      const facilityName = associatedReq ? associatedReq.facilityName : `Job #${q.jobNumber}`;
      return {
        id: q.jobNumber,
        title: facilityName,
        subtitle: q.jobNumber,
        statusKey: `quotation_status_${q.quotationStatus.toLowerCase()}`,
        statusFallback: q.quotationStatus,
        href: `/quotations/${q.jobNumber}`,
      };
    });

  // Recent Engineering Activity
  const activities: OverviewActivityItem[] = [];

  // Map requests to engineering review / blueprint status changes
  data.requests.forEach((req) => {
    let titleKey = "consultingEngineer.overview.activity.blueprintReviewStarted";
    let titleFallback = "Blueprint Review Started";

    if (req.status === "under_review" || req.status === "submitted") {
      titleKey = "consultingEngineer.overview.activity.blueprintReviewStarted";
      titleFallback = "Blueprint Review Started";
    } else if (req.status === "approved" || req.status === "completed") {
      titleKey = "consultingEngineer.overview.activity.blueprintApproved";
      titleFallback = "Blueprint Approved";
    } else if (req.status === "closed") {
      titleKey = "consultingEngineer.overview.activity.blueprintReturned";
      titleFallback = "Blueprint Returned for Revision";
    }

    activities.push({
      id: `act-eng-req-${req.id}-${req.status}`,
      type: "request",
      titleKey,
      titleFallback,
      timestamp: req.updatedAt || req.createdAt,
      referenceId: req.jobNumber,
      descriptionFallback: req.facilityName,
      href: `/requests/${req.jobNumber}`,
    });
  });

  // Map projects to technical reports / inspections
  data.projects.forEach((proj) => {
    let titleKey = "consultingEngineer.overview.activity.finalInspectionReady";
    let titleFallback = "Final Inspection Ready";

    if (proj.executionPhase === "ready_for_final_inspection") {
      titleKey = "consultingEngineer.overview.activity.finalInspectionReady";
      titleFallback = "Final Inspection Ready";
    } else if (proj.workspace?.inspection?.completedAt) {
      if (proj.workspace?.inspection?.approved) {
        titleKey = "consultingEngineer.overview.activity.reportApproved";
        titleFallback = "Technical Report Approved";
      } else {
        titleKey = "consultingEngineer.overview.activity.blueprintReturned"; // Returned/Rejected report status
        titleFallback = "Blueprint Returned for Revision";
      }
    }

    activities.push({
      id: `act-eng-proj-${proj.id}-${proj.executionPhase}`,
      type: "project",
      titleKey,
      titleFallback,
      timestamp: proj.updatedAt || proj.createdAt || new Date().toISOString(),
      referenceId: proj.jobNumber || proj.id,
      descriptionFallback: proj.name,
      href: `/projects/${proj.id}`,
    });
  });

  // Map quotations status changes
  data.quotations.forEach((q) => {
    let titleKey = "consultingEngineer.overview.activity.quotationCreated";
    let titleFallback = "Quotation Draft Created";

    if (q.quotationStatus === "SUBMITTED_FOR_APPROVAL") {
      titleKey = "consultingEngineer.overview.activity.quotationSubmitted";
      titleFallback = "Quotation Submitted";
    } else if (q.quotationStatus === "CHANGES_REQUESTED") {
      titleKey = "consultingEngineer.overview.activity.quotationRevised";
      titleFallback = "Quotation Revised";
    }

    activities.push({
      id: `act-eng-quotation-${q.jobNumber}-${q.quotationStatus}`,
      type: "contract",
      titleKey,
      titleFallback,
      timestamp: q.updatedAt || q.createdAt,
      referenceId: q.jobNumber,
      descriptionFallback: `Quotation details for Job #${q.jobNumber}`,
      href: `/quotations/${q.jobNumber}`,
    });
  });

  // Map site visits
  data.siteVisits.forEach((v) => {
    let titleKey = "consultingEngineer.overview.activity.visitScheduled";
    let titleFallback = "Site Visit Scheduled";

    if (v.status === "upcoming") {
      titleKey = "consultingEngineer.overview.activity.visitScheduled";
      titleFallback = "Site Visit Scheduled";
    } else if (v.status === "completed") {
      titleKey = "consultingEngineer.overview.activity.visitCompleted";
      titleFallback = "Site Visit Completed";
    }

    activities.push({
      id: `act-eng-visit-${v.id}-${v.status}`,
      type: "project",
      titleKey,
      titleFallback,
      timestamp: v.scheduledDate,
      referenceId: v.id,
      descriptionFallback: `${v.projectName} - ${v.location}`,
      href: `/site-visits`,
    });
  });

  const recentActivity = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Quick Access (Preferred Order: Engineering Reviews -> Blueprint Review -> Quotations -> Site Visits -> Projects)
  const quickAccessLinks: OverviewQuickAccessItem[] = [
    {
      id: "qa-eng-requests",
      labelKey: "consultingEngineer.overview.module.engineeringReviews",
      labelFallback: "Engineering Reviews",
      count: engineeringRequests.length,
      href: "/requests",
      iconName: "request",
    },
    {
      id: "qa-eng-blueprints",
      labelKey: "consultingEngineer.overview.module.blueprintReview",
      labelFallback: "Blueprint Review",
      href: "/blueprint-review",
      iconName: "request",
    },
    {
      id: "qa-eng-quotations",
      labelKey: "consultingEngineer.overview.module.quotations",
      labelFallback: "Quotations",
      count: data.quotations.length,
      href: "/quotations",
      iconName: "contract",
    },
    {
      id: "qa-eng-visits",
      labelKey: "consultingEngineer.overview.module.siteVisits",
      labelFallback: "Site Visits",
      count: data.siteVisits.length,
      href: "/site-visits",
      iconName: "project",
    },
    {
      id: "qa-eng-projects",
      labelKey: "consultingEngineer.overview.module.projects",
      labelFallback: "Projects",
      count: data.projects.length,
      href: "/projects",
      iconName: "project",
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
    upcomingSiteVisits,
    reviewQueue,
    pendingQuotationsQueue,
    recentActivity,
    quickAccessLinks,
  };
}
