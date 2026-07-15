import { UserRole, RolePermissionKey } from "@/types/role";

/**
 * Mapping of Roles to System Modules they can access.
 */
export type ProjectWorkspaceTab =
  | "overview"
  | "timeline"
  | "systems"
  | "procurement"
  | "labor"
  | "siteVisits"
  | "obstacles"
  | "attachments"
  | "photos"
  | "inspection"
  | "completion";

const ALL_PROJECT_WORKSPACE_TABS: ProjectWorkspaceTab[] = [
  "overview",
  "timeline",
  "systems",
  "procurement",
  "labor",
  "siteVisits",
  "obstacles",
  "attachments",
  "photos",
  "inspection",
  "completion",
];

interface ProjectWorkspaceAccess {
  tabs: ProjectWorkspaceTab[];
  canEdit: boolean;
  /** Whether this role should ever navigate into the workspace (nav link + route guard). */
  enterable: boolean;
}

/**
 * Per-role tab visibility + edit rights for the Project Workspace (SRS §4.5,
 * UC-03: Operations & Projects Officer is the field execution owner; other
 * roles view/review only). Super Admin does not enter the workspace per the
 * platform's role scope (SRS §1.4) — `enterable: false` keeps it out of both
 * the nav and the route guard; its `tabs` entry is a defensive fallback only,
 * used solely if that guard is ever bypassed.
 */
export const PROJECT_WORKSPACE_TAB_ACCESS: Record<UserRole, ProjectWorkspaceAccess> = {
  "Operations Officer": {
    tabs: ALL_PROJECT_WORKSPACE_TABS,
    canEdit: true,
    enterable: true,
  },
  "Consulting Engineer": {
    tabs: ["overview", "timeline", "systems", "siteVisits", "inspection", "attachments"],
    canEdit: false,
    enterable: true,
  },
  Client: {
    tabs: ["overview", "timeline", "photos", "siteVisits", "completion"],
    canEdit: false,
    enterable: true,
  },
  "Sales Agent": {
    tabs: ["overview"],
    canEdit: false,
    enterable: true,
  },
  "Company Admin": {
    tabs: ALL_PROJECT_WORKSPACE_TABS,
    canEdit: false,
    enterable: true,
  },
  "Super Admin": {
    tabs: ["overview"],
    canEdit: false,
    enterable: false,
  },
};

export function getVisibleProjectWorkspaceTabs(role: UserRole | undefined): ProjectWorkspaceTab[] {
  if (!role) return [];
  return PROJECT_WORKSPACE_TAB_ACCESS[role]?.tabs ?? [];
}

export function canEditProjectWorkspace(role: UserRole | undefined): boolean {
  if (!role) return false;
  return PROJECT_WORKSPACE_TAB_ACCESS[role]?.canEdit ?? false;
}

/** Whether this role should see/reach the Project Workspace at all (nav link, route guard). */
export function canAccessProjectWorkspace(role: UserRole | undefined): boolean {
  if (!role) return false;
  return PROJECT_WORKSPACE_TAB_ACCESS[role]?.enterable ?? false;
}
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionKey[]> = {
  "Super Admin": [
    "users.manage",
    "projects.view",
    "reports.view",
    "licenses.view",
    "customers.view",
    "certificates.view",
    "certificates.manage",
    "invoices.view",
  ],
  "Company Admin": [
    "projects.view",
    "projects.create",
    "projects.edit",
    "projects.delete",
    "reports.view",
    "reports.create",
    "customers.view",
    "customers.manage",
    "contracts.view",
    "contracts.create",
    "contracts.approve",
    "contracts.manage",
    "invoices.view",
    "invoices.create",
    "invoices.approve",
    "invoices.manage",
    "requests.view",
    "certificates.view",
    "certificates.create",
    "certificates.manage",
  ],
  "Consulting Engineer": [
    "projects.view",
    "reports.view",
    "reports.create",
    "licenses.view",
    "licenses.approve",
    "requests.view",
    "customers.view",
  ],
  "Operations Officer": [
    "projects.view",
    "projects.create",
    "projects.edit",
    "reports.view",
    "customers.view",
  ],
  "Sales Agent": [
    "customers.view",
    "customers.manage",
    "requests.view",
  ],
  Client: [
    "projects.view",
    "reports.view",
    "licenses.view",
    "licenses.create",
    "contracts.view",
    "contracts.download",
    "invoices.view",
    "invoices.download",
    "requests.view",
    "certificates.view",
  ],
};

/**
 * Helper to check if a user is permitted to perform a specific action key
 */
export function hasPermission(role: UserRole, permission: RolePermissionKey): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Project Workspace — Overview tab role-awareness (P2, HIGH priority scope only).
 * Widgets/KPIs/actions rendered by `OverviewTab` must be read from
 * `PROJECT_WORKSPACE_ROLE_CONFIG` — never gated by a hardcoded role check
 * inside a component.
 */
export type ProjectOverviewWidgetId =
  | "phaseStepper"
  | "projectHealth"
  | "nextAction"
  | "linkedRequest"
  | "documents"
  | "inspectionStatus"
  | "siteVisits"
  | "quotationSummary"
  | "invoiceSummary"
  | "customerInfo"
  | "assignedEngineer"
  | "assignedResources"
  | "procurementStatus"
  | "team";

export type ProjectOverviewKpiId =
  | "progressPercent"
  | "currentStage"
  | "openObstaclesCount"
  | "invoiceStatus";

export type ProjectOverviewActionId =
  | "startExecution"
  | "logInspectionNotes"
  | "viewContracts"
  | "viewInvoices"
  | "viewReports";

export interface ProjectOverviewRoleConfig {
  widgets: ProjectOverviewWidgetId[];
  kpis: ProjectOverviewKpiId[];
  actions: ProjectOverviewActionId[];
}

const EMPTY_OVERVIEW_CONFIG: ProjectOverviewRoleConfig = { widgets: [], kpis: [], actions: [] };

export const PROJECT_WORKSPACE_ROLE_CONFIG: Record<UserRole, ProjectOverviewRoleConfig> = {
  "Operations Officer": {
    kpis: ["progressPercent", "currentStage", "openObstaclesCount"],
    widgets: ["phaseStepper", "projectHealth", "nextAction", "assignedResources", "procurementStatus"],
    actions: ["startExecution"],
  },
  "Consulting Engineer": {
    kpis: ["currentStage"],
    widgets: ["inspectionStatus", "documents", "siteVisits"],
    actions: ["logInspectionNotes"],
  },
  "Company Admin": {
    kpis: ["progressPercent", "invoiceStatus"],
    widgets: ["quotationSummary", "invoiceSummary", "projectHealth", "team"],
    actions: ["viewContracts", "viewInvoices", "viewReports"],
  },
  Client: {
    kpis: ["progressPercent"],
    widgets: ["linkedRequest", "documents", "assignedEngineer", "invoiceSummary"],
    actions: [],
  },
  "Sales Agent": {
    kpis: ["progressPercent", "invoiceStatus"],
    widgets: ["customerInfo", "quotationSummary", "invoiceSummary"],
    actions: [],
  },
  "Super Admin": EMPTY_OVERVIEW_CONFIG,
};

export function getProjectOverviewRoleConfig(role: UserRole | undefined): ProjectOverviewRoleConfig {
  if (!role) return EMPTY_OVERVIEW_CONFIG;
  return PROJECT_WORKSPACE_ROLE_CONFIG[role] ?? EMPTY_OVERVIEW_CONFIG;
}

/**
 * Super Admin Companies (tenant management, SRS FR-TEN-06) — per-role view/manage
 * access. Components must read the resolved booleans from
 * `canViewCompanies`/`canManageCompanies`, never compare `role === "Super Admin"`
 * directly, matching the `PROJECT_WORKSPACE_TAB_ACCESS` pattern above.
 */
interface CompaniesAccess {
  canView: boolean;
  canManage: boolean;
}

const NO_COMPANIES_ACCESS: CompaniesAccess = { canView: false, canManage: false };

export const COMPANIES_ACCESS: Record<UserRole, CompaniesAccess> = {
  "Super Admin": { canView: true, canManage: true },
  "Company Admin": NO_COMPANIES_ACCESS,
  "Consulting Engineer": NO_COMPANIES_ACCESS,
  "Operations Officer": NO_COMPANIES_ACCESS,
  "Sales Agent": NO_COMPANIES_ACCESS,
  Client: NO_COMPANIES_ACCESS,
};

export function canViewCompanies(role: UserRole | undefined): boolean {
  if (!role) return false;
  return COMPANIES_ACCESS[role]?.canView ?? false;
}

export function canManageCompanies(role: UserRole | undefined): boolean {
  if (!role) return false;
  return COMPANIES_ACCESS[role]?.canManage ?? false;
}
