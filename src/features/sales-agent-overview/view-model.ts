import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import {
  OverviewStatCard,
  OverviewActionItem,
  OverviewEntityItem,
  OverviewActivityItem,
  OverviewQuickAccessItem,
} from "@/features/dashboard-overview";

export interface SalesAgentOverviewViewModel {
  welcomeCardProps: {
    name: string;
    roleLabel: string;
    subtitle: string;
  };
  summaryCards: OverviewStatCard[];
  actionItems: OverviewActionItem[];
  customerFollowUpQueue: OverviewEntityItem[];
  recentCustomerRequests: OverviewEntityItem[];
  recentActivity: OverviewActivityItem[];
  quickAccessLinks: OverviewQuickAccessItem[];
}

export function prepareSalesAgentOverviewViewModel(
  user: { name: string; role: string },
  data: {
    requests: LicensingRequest[];
  }
): SalesAgentOverviewViewModel {
  const todayStr = "2026-06-28"; // System date for consistency

  // Calculations
  const uniqueClients = new Set(data.requests.filter(r => r.clientId).map(r => r.clientId));
  const assignedCustomersCount = uniqueClients.size;

  const newRequestsCount = data.requests.filter(
    (r) => r.currentStage === "DRAFT" || r.currentStage === "SUBMITTED"
  ).length;

  const awaitingFollowUpCount = data.requests.filter(
    (r) => r.status === "draft" || r.status === "awaiting_approval"
  ).length;

  const activePipelinesCount = data.requests.filter(
    (r) => r.currentStage !== "COMPLETED" && r.currentStage !== "DRAFT"
  ).length;

  // 1. Summary Cards
  const summaryCards: OverviewStatCard[] = [
    {
      id: "sales-assigned-customers",
      labelKey: "salesAgent.overview.assignedCustomers",
      labelFallback: "Assigned Customers",
      value: assignedCustomersCount,
      iconName: "project",
      href: "/customers",
      variant: "info",
    },
    {
      id: "sales-new-requests",
      labelKey: "salesAgent.overview.newRequests",
      labelFallback: "New Requests",
      value: newRequestsCount,
      iconName: "request",
      href: "/requests",
      variant: "success",
    },
    {
      id: "sales-awaiting-follow-up",
      labelKey: "salesAgent.overview.awaitingFollowUp",
      labelFallback: "Awaiting Follow-Up",
      value: awaitingFollowUpCount,
      iconName: "contract",
      href: "/requests",
      variant: "warning",
    },
    {
      id: "sales-active-pipelines",
      labelKey: "salesAgent.overview.activePipelines",
      labelFallback: "Active Sales Pipelines",
      value: activePipelinesCount,
      iconName: "certificate",
      href: "/requests",
      variant: "default",
    },
  ];

  // 2. Action Items
  const actionItems: OverviewActionItem[] = [];

  data.requests.forEach((r) => {
    if (r.status === "draft") {
      actionItems.push({
        id: `action-sales-contact-${r.jobNumber}`,
        titleKey: "salesAgent.overview.contactCustomer",
        titleFallback: "Contact Customer",
        descriptionFallback: `Follow up with client ${r.clientName} on draft request ${r.jobNumber}`,
        href: `/requests/${r.jobNumber}`,
        actionLabelKey: "open",
        actionLabelFallback: "Open",
        referenceId: r.jobNumber,
        priority: "high",
      });
    } else if (r.status === "awaiting_approval") {
      actionItems.push({
        id: `action-sales-review-${r.jobNumber}`,
        titleKey: "salesAgent.overview.reviewCustomerRequest",
        titleFallback: "Review Customer Request",
        descriptionFallback: `Client request ${r.jobNumber} for ${r.facilityName} is awaiting client/internal approval.`,
        href: `/requests/${r.jobNumber}`,
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: r.jobNumber,
        priority: "medium",
      });
    }
  });

  // 3. Customer Follow-up Queue (Queue 1)
  const customerFollowUpQueue = data.requests
    .filter((r) => r.status === "draft" || r.status === "awaiting_approval")
    .slice(0, 5)
    .map((r): OverviewEntityItem => {
      return {
        id: r.id,
        title: r.clientName,
        subtitle: r.facilityName,
        statusKey: `request_status_${r.status.toLowerCase()}`,
        statusFallback: r.status,
        metaText: r.jobNumber,
        href: `/requests/${r.jobNumber}`,
      };
    });

  // 4. Recent Customer Requests (Queue 2)
  const recentCustomerRequests = [...data.requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((r): OverviewEntityItem => {
      return {
        id: r.id,
        title: r.facilityName,
        subtitle: r.clientName,
        statusKey: `request_status_${r.status.toLowerCase()}`,
        statusFallback: r.status,
        metaText: r.jobNumber,
        href: `/requests/${r.jobNumber}`,
      };
    });

  // 5. Recent Activity Feed
  const activities: OverviewActivityItem[] = [];

  data.requests.forEach((req) => {
    let titleKey = "salesAgent.overview.activity.newCustomer";
    let titleFallback = "New Customer Assigned";

    if (req.status === "submitted") {
      titleKey = "salesAgent.overview.activity.submitted";
      titleFallback = "Customer Request Submitted";
    } else if (req.status === "under_review") {
      titleKey = "salesAgent.overview.activity.review";
      titleFallback = "Request Entered Review";
    } else if (req.status === "quotation_created") {
      titleKey = "salesAgent.overview.activity.quotationReady";
      titleFallback = "Quotation Ready";
    } else if (req.status === "awaiting_approval") {
      titleKey = "salesAgent.overview.activity.waiting";
      titleFallback = "Waiting For Customer";
    } else if (req.status === "in_execution" || req.status === "completed" || req.status === "closed") {
      titleKey = "salesAgent.overview.activity.followUp";
      titleFallback = "Customer Follow-up Updated";
    }

    activities.push({
      id: `act-sales-req-${req.id}-${req.status}`,
      type: "request",
      titleKey,
      titleFallback,
      timestamp: req.updatedAt || req.createdAt,
      referenceId: req.jobNumber,
      descriptionFallback: `${req.clientName} - ${req.facilityName}`,
      href: `/requests/${req.jobNumber}`,
    });
  });

  const recentActivity = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // 6. Quick Access (Customers -> /customers, Requests -> /requests)
  const quickAccessLinks: OverviewQuickAccessItem[] = [
    {
      id: "qa-sales-customers",
      labelKey: "salesAgent.overview.customers",
      labelFallback: "Customers",
      count: assignedCustomersCount,
      href: "/customers",
      iconName: "project",
    },
    {
      id: "qa-sales-requests",
      labelKey: "salesAgent.overview.requests",
      labelFallback: "Requests",
      count: data.requests.length,
      href: "/requests",
      iconName: "request",
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
    customerFollowUpQueue,
    recentCustomerRequests,
    recentActivity,
    quickAccessLinks,
  };
}
