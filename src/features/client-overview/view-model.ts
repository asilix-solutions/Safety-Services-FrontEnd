import { ClientRequest } from "@/domains/requests/types";
import { Project } from "@/types/project";
import { ClientInvoice } from "@/domains/invoices/types";
import { ClientContract } from "@/domains/contracts/types";
import { ComplianceCertificate } from "@/domains/certificates/types";
import {
  OverviewWelcomeBtn,
  OverviewStatItem,
  OverviewActionItem,
  OverviewEntityItem,
  OverviewActivityItem,
  OverviewQuickAccessItem,
} from "../dashboard-overview";

export interface ClientOverviewViewModel {
  welcomeCardProps: {
    name: string;
    subtitle: string;
    stats: OverviewStatItem[];
    actions: OverviewWelcomeBtn[];
  };
  recentRequests: OverviewEntityItem[];
  activeProjects: OverviewEntityItem[];
  actionItems: OverviewActionItem[];
  recentActivity: OverviewActivityItem[];
  quickAccessLinks: OverviewQuickAccessItem[];
}

export function prepareClientOverviewViewModel(
  user: { name: string; companyId: string; companyName?: string },
  data: {
    requests: ClientRequest[];
    projects: Project[];
    invoices: ClientInvoice[];
    contracts: ClientContract[];
    certificates: ComplianceCertificate[];
  }
): ClientOverviewViewModel {
  const companyId = user.companyId;

  // Filter client-scoped data
  const clientRequests = data.requests.filter((r) => r.clientId === companyId);
  const clientProjects = data.projects.filter((p) => p.clientId === companyId);
  const clientInvoices = data.invoices.filter((i) => i.tenantId === companyId);
  const clientContracts = data.contracts.filter((c) => c.clientId === companyId);
  const clientCertificates = data.certificates.filter((c) => c.clientId === companyId);

  // Welcome Stats
  const activeRequests = clientRequests.filter((r) => r.status !== "Approved" && r.status !== "Rejected");
  const activeProjects = clientProjects.filter((p) => p.status === "in_progress" || p.status === "active");

  const welcomeStats: OverviewStatItem[] = [
    {
      labelKey: "overview_active_requests",
      labelFallback: "Active Requests",
      count: activeRequests.length,
      badgeVariant: "success",
    },
    {
      labelKey: "overview_active_projects",
      labelFallback: "Active Projects",
      count: activeProjects.length,
      badgeVariant: "info",
    },
  ];

  const welcomeActions: OverviewWelcomeBtn[] = [
    {
      labelKey: "overview_new_request",
      labelFallback: "New Request",
      href: "/requests/new",
      iconName: "plus",
      variant: "default",
    },
    {
      labelKey: "overview_track_requests",
      labelFallback: "Track Requests",
      href: "/requests",
      iconName: "search",
      variant: "outline",
    },
  ];

  // Action Items
  const actionItems: OverviewActionItem[] = [];

  // 1. Unpaid Invoices
  clientInvoices
    .filter((inv) => inv.status === "unpaid")
    .forEach((inv) => {
      actionItems.push({
        id: `invoice-action-${inv.id}`,
        titleKey: "overview_action_pay",
        titleFallback: "Pay Invoice",
        referenceId: inv.id,
        href: "/invoices",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        type: "pay_invoice",
      });
    });

  // 2. Unsigned/Generated Contracts
  clientContracts
    .filter((c) => c.status === "generated")
    .forEach((c) => {
      actionItems.push({
        id: `contract-action-${c.id}`,
        titleKey: "overview_action_sign",
        titleFallback: "Sign Contract",
        referenceId: c.id,
        href: "/contracts",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        type: "sign_contract",
      });
    });

  // Recent Requests (max 5)
  const recentRequests = [...clientRequests]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5)
    .map((req): OverviewEntityItem => ({
      id: req.id,
      title: req.jobNumber,
      subtitle: req.buildingType || req.inspectionType || "—",
      statusKey: `status_${(req.status || "").toLowerCase()}`,
      statusFallback: req.status,
      metaText: new Date(req.updatedAt || req.createdAt).toLocaleDateString(),
      href: `/requests/${req.jobNumber}`,
    }));

  // Active Projects (max 5)
  const recentProjects = [...activeProjects]
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
        statusKey: `project_stage_${(proj.executionPhase || "").toLowerCase()}`,
        statusFallback: proj.executionPhase,
        progress,
        href: `/projects`,
      };
    });

  // Recent Activity Feed (max 10)
  const activities: OverviewActivityItem[] = [];

  clientRequests.forEach((req) => {
    activities.push({
      id: `act-req-${req.id}`,
      type: "request",
      titleKey: `request_status_${(req.status || "").toLowerCase()}`,
      titleFallback: `Request ${req.jobNumber} status: ${req.status}`,
      timestamp: req.updatedAt || req.createdAt,
      referenceId: req.jobNumber,
      href: `/requests/${req.jobNumber}`,
    });
  });

  clientProjects.forEach((proj) => {
    activities.push({
      id: `act-proj-${proj.id}`,
      type: "project",
      titleKey: `project_stage_${(proj.executionPhase || "").toLowerCase()}`,
      titleFallback: `Project ${proj.name} reached phase ${proj.executionPhase}`,
      timestamp: proj.updatedAt || proj.createdAt || new Date().toISOString(),
      referenceId: proj.id,
      href: `/projects`,
    });
  });

  clientInvoices.forEach((inv) => {
    activities.push({
      id: `act-inv-${inv.id}`,
      type: "invoice",
      titleKey: `invoice_status_${inv.status}`,
      titleFallback: `Invoice ${inv.id} is ${inv.status}`,
      timestamp: inv.paidAt || inv.issuedAt,
      referenceId: inv.id,
      href: `/invoices`,
    });
  });

  clientCertificates.forEach((cert) => {
    activities.push({
      id: `act-cert-${cert.id}`,
      type: "certificate",
      titleKey: "certificates_milestone_issued",
      titleFallback: `Compliance Certificate issued for ${cert.id}`,
      timestamp: cert.issuedAt,
      referenceId: cert.id,
      href: `/certificates`,
    });
  });

  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Quick Access
  const quickAccessLinks: OverviewQuickAccessItem[] = [
    {
      id: "qa-requests",
      labelKey: "overview_type_request",
      labelFallback: "Request",
      count: clientRequests.length,
      href: "/requests",
      iconName: "request",
    },
    {
      id: "qa-projects",
      labelKey: "overview_type_project",
      labelFallback: "Project",
      count: clientProjects.length,
      href: "/projects",
      iconName: "project",
    },
    {
      id: "qa-invoices",
      labelKey: "overview_type_invoice",
      labelFallback: "Invoice",
      count: clientInvoices.length,
      href: "/invoices",
      iconName: "invoice",
    },
    {
      id: "qa-contracts",
      labelKey: "overview_type_contract",
      labelFallback: "Contract",
      count: clientContracts.length,
      href: "/contracts",
      iconName: "contract",
    },
    {
      id: "qa-certificates",
      labelKey: "overview_type_certificate",
      labelFallback: "Certificate",
      count: clientCertificates.length,
      href: "/certificates",
      iconName: "certificate",
    },
  ];

  return {
    welcomeCardProps: {
      name: user.name,
      subtitle: user.companyName || "SSLM Client Group",
      stats: welcomeStats,
      actions: welcomeActions,
    },
    recentRequests,
    activeProjects: recentProjects,
    actionItems,
    recentActivity: sortedActivities,
    quickAccessLinks,
  };
}
