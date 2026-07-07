import { UserRole } from "@/types/role";
import { canAccessProjectWorkspace } from "@/constants/permissions";

export interface NavigationItem {
  label: string;
  path: string;
  iconName: string;
}

function projectsNavItem(iconName: string): NavigationItem {
  return { label: "Projects", path: "/projects", iconName };
}

/**
 * Sidebar Navigation definitions per Role, referencing flat, explicit paths.
 * The "Projects" entry is included only for roles with Project Workspace
 * access (see PROJECT_WORKSPACE_TAB_ACCESS in constants/permissions.ts) so
 * the nav link can never drift out of sync with actual workspace access.
 */
export const ROLE_NAVIGATION: Record<UserRole, NavigationItem[]> = {
  "Super Admin": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Companies", path: "/companies", iconName: "Building2" },
    { label: "Subscriptions", path: "/subscriptions", iconName: "CreditCard" },
    { label: "Users", path: "/users", iconName: "Users" },
    ...(canAccessProjectWorkspace("Super Admin") ? [projectsNavItem("FolderKanban")] : []),
    { label: "Certificates", path: "/certificates", iconName: "Award" },
    { label: "Settings", path: "/settings", iconName: "Settings" },
  ],
  "Company Admin": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Requests", path: "/requests", iconName: "FileSignature" },
    { label: "Quotation Approvals", path: "/quotations/approvals", iconName: "ClipboardCheck" },
    ...(canAccessProjectWorkspace("Company Admin") ? [projectsNavItem("FolderKanban")] : []),
    { label: "Customers", path: "/customers", iconName: "Briefcase" },
    { label: "Employees", path: "/employees", iconName: "Users2" },
    { label: "Reports", path: "/reports", iconName: "FileSpreadsheet" },
    { label: "Contracts", path: "/contracts", iconName: "FileCheck2" },
    { label: "Certificates", path: "/certificates", iconName: "Award" },
    { label: "Invoices", path: "/invoices", iconName: "Receipt" },
    { label: "Settings", path: "/settings", iconName: "Settings2" },
  ],
  "Consulting Engineer": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Requests", path: "/requests", iconName: "Inbox" },
    { label: "Blueprint Review", path: "/blueprint-review", iconName: "FileCheck" },
    ...(canAccessProjectWorkspace("Consulting Engineer") ? [projectsNavItem("FolderKanban")] : []),
    { label: "Reports", path: "/reports", iconName: "FileText" },
    { label: "Quotations", path: "/quotations", iconName: "DollarSign" },
    { label: "Employees", path: "/employees", iconName: "Users2" },
    { label: "Customers", path: "/customers", iconName: "Briefcase" },
    { label: "Site Visits", path: "/site-visits", iconName: "MapPin" },
  ],
  "Operations Officer": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Requests", path: "/requests", iconName: "Inbox" },
    ...(canAccessProjectWorkspace("Operations Officer") ? [projectsNavItem("Kanban")] : []),
    { label: "Employees", path: "/employees", iconName: "Users2" },
    { label: "Customers", path: "/customers", iconName: "Briefcase" },
    { label: "Site Visits", path: "/site-visits", iconName: "MapPin" },
  ],
  "Sales Agent": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Customers", path: "/customers", iconName: "Contact" },
    { label: "Requests", path: "/requests", iconName: "FileQuestion" },
    ...(canAccessProjectWorkspace("Sales Agent") ? [projectsNavItem("FolderKanban")] : []),
  ],
  Client: [
    { label: "Home", path: "/", iconName: "Home" },
    { label: "My Requests", path: "/requests", iconName: "FileQuestion" },
    ...(canAccessProjectWorkspace("Client") ? [projectsNavItem("Layers")] : []),
    { label: "Contracts", path: "/contracts", iconName: "FileCheck2" },
    { label: "Certificates", path: "/certificates", iconName: "Award" },
    { label: "Invoices", path: "/invoices", iconName: "Receipt" },
  ],
};
