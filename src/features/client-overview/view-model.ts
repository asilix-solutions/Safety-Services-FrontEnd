import { LicensingRequest } from "@/domains/requests/types";
import { RequestStatus } from "@/types/request-status";
import { Project } from "@/types/project";
import { ClientInvoice } from "@/domains/invoices/types";
import { ClientContract } from "@/domains/contracts/types";
import { ClientCertificate } from "@/domains/certificates/types";
import {
  OverviewActionItem,
  OverviewEntityItem,
  OverviewActivityItem,
  OverviewQuickAccessItem,
  OverviewStatCard,
} from "@/features/dashboard-overview";

export interface ClientOverviewViewModel {
  welcomeCardProps: {
    name: string;
    roleLabel?: string;
    subtitle: string;
  };
  summaryCards: OverviewStatCard[];
  recentRequests: OverviewEntityItem[];
  activeProjects: OverviewEntityItem[];
  actionItems: OverviewActionItem[];
  recentActivity: OverviewActivityItem[];
  quickAccessLinks: OverviewQuickAccessItem[];
}

export function prepareClientOverviewViewModel(
  user: { id: string; name: string; companyId: string; companyName?: string },
  data: {
    requests: LicensingRequest[];
    projects: Project[];
    invoices: ClientInvoice[];
    contracts: ClientContract[];
    certificates: ClientCertificate[];
  }
): ClientOverviewViewModel {
  const companyId = user.companyId;

  // Filter client-scoped data
  const clientRequests = data.requests.filter((r) => r.clientId === user.id || r.clientId === user.companyId);
  const clientProjects = data.projects.filter((p) => p.clientId === user.id || p.clientName === user.name);
  const clientInvoices = data.invoices.filter((i) => i.tenantId === user.id || i.tenantId === user.companyId);
  const clientContracts = data.contracts.filter((c) => c.clientId === user.id || c.clientId === user.companyId);
  const clientCertificates = data.certificates.filter((c) => c.clientId === user.id || c.clientId === user.companyId);

  // Welcome Stats
  const inactiveRequestStatuses: RequestStatus[] = ["completed", "closed"];
  const activeRequests = clientRequests.filter(
    (r) => !inactiveRequestStatuses.includes(r.status)
  );
  const activeProjects = clientProjects.filter((p) => p.status === "active");

  const unpaidInvoicesCount = clientInvoices.filter((inv) => inv.status === "unpaid").length;

  const summaryCards: OverviewStatCard[] = [
    {
      id: "client-active-requests",
      labelKey: "overview_active_requests",
      labelFallback: "Active Requests",
      value: activeRequests.length,
      iconName: "request",
      href: "/requests",
      variant: "success",
    },
    {
      id: "client-active-projects",
      labelKey: "overview_active_projects",
      labelFallback: "Active Projects",
      value: activeProjects.length,
      iconName: "project",
      href: "/projects",
      variant: "info",
    },
    {
      id: "client-pending-invoices",
      labelKey: "pay_invoice",
      labelFallback: "Pending Invoices",
      value: unpaidInvoicesCount,
      iconName: "invoice",
      href: "/invoices",
      variant: "warning",
    },
    {
      id: "client-certificates",
      labelKey: "overview_type_certificate",
      labelFallback: "Certificates",
      value: clientCertificates.length,
      iconName: "certificate",
      href: "/certificates",
      variant: "default",
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
        actionLabelKey: "pay_invoice",
        actionLabelFallback: "Pay Now",
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
        actionLabelKey: "overview_action_sign",
        actionLabelFallback: "Sign Contract",
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
      subtitle: req.facilityName || req.activityName || req.requestType || "—",
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

  clientProjects.forEach((proj) => {
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
    .slice(0, 5);

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
      id: "qa-contracts",
      labelKey: "overview_type_contract",
      labelFallback: "Contract",
      count: clientContracts.length,
      href: "/contracts",
      iconName: "contract",
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
      roleLabel: "Client",
      subtitle: user.companyName || "SSLM Client Group",
    },
    summaryCards,
    recentRequests,
    activeProjects: recentProjects,
    actionItems,
    recentActivity: sortedActivities,
    quickAccessLinks,
  };
}
