import { Project } from "@/types/project";
import { ClientInvoice } from "@/domains/invoices/types";
import { ClientContract } from "@/domains/contracts/types";
import { ClientCertificate } from "@/domains/certificates/types";
import { LicensingRequest } from "@/domains/requests/types";
import { Quotation } from "@/domains/quotations/types";
import { getActiveProjects } from "@/domains/projects/storage";
import { getPendingQuotationApprovals } from "@/domains/quotations/storage";
import { getPendingContracts } from "@/domains/contracts/storage";
import {
  OverviewStatCard,
  OverviewActionItem,
  OverviewEntityItem,
  OverviewActivityItem,
  OverviewQuickAccessItem,
} from "@/features/dashboard-overview";

export interface CompanyAdminOverviewViewModel {
  welcomeCardProps: {
    name: string;
    roleLabel: string;
    subtitle: string;
  };
  summaryCards: OverviewStatCard[];
  actionItems: OverviewActionItem[];
  recentRequests: OverviewEntityItem[];
  activeProjects: OverviewEntityItem[];
  recentActivity: OverviewActivityItem[];
  quickAccessLinks: OverviewQuickAccessItem[];
}

export function prepareCompanyAdminOverviewViewModel(
  user: { name: string; role: string },
  data: {
    projects: Project[];
    requests: LicensingRequest[];
    invoices: ClientInvoice[];
    contracts: ClientContract[];
    certificates: ClientCertificate[];
    quotations: Quotation[];
  }
): CompanyAdminOverviewViewModel {
  const activeProjectsList = getActiveProjects();
  const pendingApprovalsCount = getPendingQuotationApprovals().length;
  const pendingContractsCount = getPendingContracts().length;


  const summaryCards: OverviewStatCard[] = [
    {
      id: "company-admin-total-requests",
      labelKey: "companyAdmin.overview.totalRequests",
      labelFallback: "Total Requests",
      value: data.requests.length,
      iconName: "request",
      href: "/requests",
      variant: "default",
    },
    {
      id: "company-admin-active-projects",
      labelKey: "companyAdmin.overview.activeProjects",
      labelFallback: "Active Projects",
      value: activeProjectsList.length,
      iconName: "project",
      href: "/projects",
      variant: "info",
    },
    {
      id: "company-admin-pending-approvals",
      labelKey: "companyAdmin.overview.pendingQuotationApprovals",
      labelFallback: "Pending Approvals",
      value: pendingApprovalsCount,
      iconName: "contract",
      href: "/quotations/approvals",
      variant: "warning",
    },
    {
      id: "company-admin-contracts-pending",
      labelKey: "companyAdmin.overview.contractsAwaitingSignature",
      labelFallback: "Contracts Pending",
      value: pendingContractsCount,
      iconName: "certificate",
      href: "/contracts",
      variant: "success",
    },
  ];

  // Action Items
  const actionItems: OverviewActionItem[] = [];

  // Quotations awaiting approval
  data.quotations
    .filter((q) => q.quotationStatus === "SUBMITTED_FOR_APPROVAL")
    .forEach((q) => {
      actionItems.push({
        id: `action-quotation-${q.jobNumber}`,
        titleKey: "companyAdmin.overview.pendingQuotationApprovals",
        titleFallback: "Quotation Awaiting Approval",
        descriptionFallback: `Quotation for request ${q.jobNumber} requires review.`,
        href: "/quotations/approvals",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: q.jobNumber,
      });
    });

  // Contracts awaiting signature
  data.contracts
    .filter((c) => c.status === "generated")
    .forEach((c) => {
      actionItems.push({
        id: `action-contract-${c.id}`,
        titleKey: "companyAdmin.overview.contractsAwaitingSignature",
        titleFallback: "Client Signature Missing",
        descriptionFallback: `Contract for ${c.title || c.id} is generated.`,
        href: "/contracts",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: c.id,
      });
    });

  // Unpaid/Unreleased invoices (Admin action: Review/Release Invoice)
  data.invoices
    .filter((inv) => inv.status === "unpaid")
    .forEach((inv) => {
      actionItems.push({
        id: `action-invoice-${inv.id}`,
        titleKey: "companyAdmin.overview.reviewInvoice",
        titleFallback: "Review Invoice",
        descriptionFallback: `Invoice ${inv.id} is pending client payment.`,
        href: "/invoices",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: inv.id,
      });
    });

  // Recent Requests (max 5)
  const recentRequests = [...data.requests]
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
  const recentProjects = [...activeProjectsList]
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

  // Recent Activity Feed
  const activities: OverviewActivityItem[] = [];

  data.requests.forEach((req) => {
    activities.push({
      id: `act-req-${req.id}`,
      type: "request",
      titleKey: `request_status_${(req.status || "").toLowerCase()}`,
      titleFallback: `Request ${req.jobNumber} updated to ${req.status}`,
      timestamp: req.updatedAt || req.createdAt,
      referenceId: req.jobNumber,
      href: `/requests/${req.jobNumber}`,
    });
  });

  data.projects.forEach((proj) => {
    activities.push({
      id: `act-proj-${proj.id}`,
      type: "project",
      titleKey: `project_stage_${(proj.executionPhase || "").toLowerCase()}`,
      titleFallback: `Project ${proj.name} moved to ${proj.executionPhase}`,
      timestamp: proj.updatedAt || proj.createdAt || new Date().toISOString(),
      referenceId: proj.jobNumber || proj.id,
      href: `/projects`,
    });
  });

  data.invoices.forEach((inv) => {
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

  const recentActivity = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const quickAccessLinks: OverviewQuickAccessItem[] = [
    {
      id: "qa-requests",
      labelKey: "companyAdmin.overview.totalRequests",
      labelFallback: "Requests",
      count: data.requests.length,
      href: "/requests",
      iconName: "request",
    },
    {
      id: "qa-quotations",
      labelKey: "companyAdmin.overview.pendingQuotationApprovals",
      labelFallback: "Approvals",
      count: pendingApprovalsCount,
      href: "/quotations/approvals",
      iconName: "contract",
    },
    {
      id: "qa-projects",
      labelKey: "companyAdmin.overview.activeProjects",
      labelFallback: "Projects",
      count: data.projects.length,
      href: "/projects",
      iconName: "project",
    },
    {
      id: "qa-contracts",
      labelKey: "companyAdmin.overview.contractsAwaitingSignature",
      labelFallback: "Contracts",
      count: data.contracts.length,
      href: "/contracts",
      iconName: "contract",
    },
    {
      id: "qa-certificates",
      labelKey: "companyAdmin.overview.certificatesIssued",
      labelFallback: "Certificates",
      count: data.certificates.length,
      href: "/certificates",
      iconName: "certificate",
    },
    {
      id: "qa-invoices",
      labelKey: "companyAdmin.overview.reviewInvoice",
      labelFallback: "Invoices",
      count: data.invoices.length,
      href: "/invoices",
      iconName: "invoice",
    },
  ];

  return {
    welcomeCardProps: {
      name: user.name,
      roleLabel: user.role,
      subtitle: "2026-06-28",
    },
    summaryCards,
    actionItems,
    recentRequests,
    activeProjects: recentProjects,
    recentActivity,
    quickAccessLinks,
  };
}
