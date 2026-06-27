import { ClientRequest } from "@/domains/requests/types";
import { Project } from "@/types/project";
import { ClientInvoice } from "@/domains/invoices/types";
import { ClientContract } from "@/domains/contracts/types";
import { ComplianceCertificate } from "@/domains/certificates/types";

export interface ActivityEvent {
  id: string;
  type: "request" | "project" | "contract" | "invoice" | "certificate";
  titleKey: string;
  titleFallback: string;
  date: string;
  referenceId: string;
}

export interface ActionItem {
  id: string;
  type: "pay_invoice" | "sign_contract" | "fix_request_action";
  titleKey: string;
  titleFallback: string;
  referenceId: string;
  route: string;
}

export interface ClientOverviewProject {
  id: string;
  name: string;
  executionPhase: string;
  displayProgress: number;
  updatedAt: string;
}

export interface ClientOverviewViewModel {
  welcomeStats: {
    clientName: string;
    companyName: string;
    activeRequestsCount: number;
    activeProjectsCount: number;
  };
  recentRequests: ClientRequest[];
  activeProjects: ClientOverviewProject[];
  actionItems: ActionItem[];
  recentActivity: ActivityEvent[];
  quickAccessCounts: {
    requests: number;
    projects: number;
    invoices: number;
    contracts: number;
    certificates: number;
  };
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 40) return "bg-sky-500";
  return "bg-amber-500";
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

  // Action Items
  const actionItems: ActionItem[] = [];

  // 1. Unpaid Invoices
  clientInvoices
    .filter((inv) => inv.status === "unpaid")
    .forEach((inv) => {
      actionItems.push({
        id: `invoice-action-${inv.id}`,
        type: "pay_invoice",
        titleKey: "overview_action_pay",
        titleFallback: "Pay Invoice",
        referenceId: inv.id,
        route: "/invoices",
      });
    });

  // 2. Unsigned/Generated Contracts
  clientContracts
    .filter((c) => c.status === "generated")
    .forEach((c) => {
      actionItems.push({
        id: `contract-action-${c.id}`,
        type: "sign_contract",
        titleKey: "overview_action_sign",
        titleFallback: "Sign Contract",
        referenceId: c.id,
        route: "/contracts",
      });
    });

  // Recent Requests (max 5)
  const sortedRequests = [...clientRequests]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  // Active Projects (max 5) - shaped to ClientOverviewProject safely
  const sortedProjects = [...activeProjects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5)
    .map((p): ClientOverviewProject => {
      let displayProgress = 30; // Default kickoff
      if (p.executionPhase === "completed") {
        displayProgress = 100;
      } else if (p.executionPhase === "ready_for_final_inspection") {
        displayProgress = 85;
      } else if (p.executionPhase === "active_execution") {
        displayProgress = 60;
      } else if (p.executionPhase === "kickoff_ready") {
        displayProgress = 20;
      }
      return {
        id: p.id,
        name: p.name,
        executionPhase: p.executionPhase || "created",
        displayProgress,
        updatedAt: p.updatedAt || p.createdAt || new Date().toISOString(),
      };
    });

  // Recent Activity Feed (max 10)
  const activities: ActivityEvent[] = [];

  clientRequests.forEach((req) => {
    activities.push({
      id: `act-req-${req.id}`,
      type: "request",
      titleKey: `request_status_${req.status}`,
      titleFallback: `Request ${req.jobNumber} status: ${req.status}`,
      date: req.updatedAt || req.createdAt,
      referenceId: req.jobNumber,
    });
  });

  clientProjects.forEach((proj) => {
    activities.push({
      id: `act-proj-${proj.id}`,
      type: "project",
      titleKey: `project_stage_${proj.executionPhase}`,
      titleFallback: `Project ${proj.name} reached phase ${proj.executionPhase}`,
      date: proj.updatedAt || proj.createdAt || new Date().toISOString(),
      referenceId: proj.id,
    });
  });

  clientInvoices.forEach((inv) => {
    activities.push({
      id: `act-inv-${inv.id}`,
      type: "invoice",
      titleKey: `invoice_status_${inv.status}`,
      titleFallback: `Invoice ${inv.id} is ${inv.status}`,
      date: inv.paidAt || inv.issuedAt,
      referenceId: inv.id,
    });
  });

  clientCertificates.forEach((cert) => {
    activities.push({
      id: `act-cert-${cert.id}`,
      type: "certificate",
      titleKey: "certificates_milestone_issued",
      titleFallback: `Compliance Certificate issued for ${cert.id}`,
      date: cert.issuedAt,
      referenceId: cert.id,
    });
  });

  const sortedActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    welcomeStats: {
      clientName: user.name,
      companyName: user.companyName || "SSLM Client Group",
      activeRequestsCount: activeRequests.length,
      activeProjectsCount: activeProjects.length,
    },
    recentRequests: sortedRequests,
    activeProjects: sortedProjects,
    actionItems,
    recentActivity: sortedActivities,
    quickAccessCounts: {
      requests: clientRequests.length,
      projects: clientProjects.length,
      invoices: clientInvoices.length,
      contracts: clientContracts.length,
      certificates: clientCertificates.length,
    },
  };
}
