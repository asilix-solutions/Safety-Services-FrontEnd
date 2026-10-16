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
    { label: "Dashboard", path: "/dashboard", iconName: "LayoutDashboard" },
    { label: "Companies", path: "/companies", iconName: "Building2" },
    { label: "Subscriptions", path: "/subscriptions", iconName: "CreditCard" },
    { label: "Users", path: "/users", iconName: "Users" },
    ...(canAccessProjectWorkspace("Super Admin") ? [projectsNavItem("FolderKanban")] : []),
    { label: "Activities", path: "/activities", iconName: "History" },
    { label: "Certificates", path: "/certificates", iconName: "Award" },
    { label: "Settings", path: "/settings", iconName: "Settings" },
  ],
  "Company Admin": [
    { label: "Dashboard", path: "/dashboard", iconName: "LayoutDashboard" },
    { label: "Analytics", path: "/analytics", iconName: "BarChart3" },
    { label: "Requests", path: "/requests", iconName: "FileSignature" },
    { label: "Calendar", path: "/calendar", iconName: "Calendar" },
    { label: "Quotation Approvals", path: "/quotations/approvals", iconName: "ClipboardCheck" },
    ...(canAccessProjectWorkspace("Company Admin") ? [projectsNavItem("FolderKanban")] : []),
    { label: "Pipeline", path: "/pipeline", iconName: "TrendingUp" },
    { label: "Customers", path: "/customers", iconName: "Briefcase" },
    { label: "Employees", path: "/employees", iconName: "Users2" },
    { label: "Equipment", path: "/tracking", iconName: "Wrench" },
    { label: "Reports", path: "/reports", iconName: "FileSpreadsheet" },
    { label: "Contracts", path: "/contracts", iconName: "FileCheck2" },
    { label: "Commissions", path: "/commissions", iconName: "DollarSign" },
    { label: "Maintenance", path: "/maintenance", iconName: "Wrench" },
    { label: "Certificates", path: "/certificates", iconName: "Award" },
    { label: "Invoices", path: "/invoices", iconName: "Receipt" },
    { label: "Activities", path: "/activities", iconName: "History" },
    { label: "Messages", path: "/messages", iconName: "Bell" },
    { label: "Settings", path: "/settings", iconName: "Settings2" },
  ],
  "Consulting Engineer": [
    { label: "Dashboard", path: "/dashboard", iconName: "LayoutDashboard" },
    { label: "Analytics", path: "/analytics", iconName: "BarChart3" },
    { label: "Requests", path: "/requests", iconName: "Inbox" },
    { label: "Blueprint Review", path: "/blueprint-review", iconName: "FileCheck" },
    { label: "Calendar", path: "/calendar", iconName: "Calendar" },
    ...(canAccessProjectWorkspace("Consulting Engineer") ? [projectsNavItem("FolderKanban")] : []),
    { label: "Reports", path: "/reports", iconName: "FileText" },
    { label: "Quotations", path: "/quotations", iconName: "DollarSign" },
    { label: "Employees", path: "/employees", iconName: "Users2" },
    { label: "Customers", path: "/customers", iconName: "Briefcase" },
    { label: "Site Visits", path: "/site-visits", iconName: "MapPin" },
    { label: "Messages", path: "/messages", iconName: "Bell" },
  ],
  "Operations Officer": [
    { label: "Dashboard", path: "/dashboard", iconName: "LayoutDashboard" },
    { label: "Requests", path: "/requests", iconName: "Inbox" },
    { label: "Calendar", path: "/calendar", iconName: "Calendar" },
    ...(canAccessProjectWorkspace("Operations Officer") ? [projectsNavItem("Kanban")] : []),
    { label: "Employees", path: "/employees", iconName: "Users2" },
    { label: "Equipment", path: "/tracking", iconName: "Wrench" },
    { label: "Customers", path: "/customers", iconName: "Briefcase" },
    { label: "Site Visits", path: "/site-visits", iconName: "MapPin" },
    { label: "Maintenance", path: "/maintenance", iconName: "Wrench" },
    { label: "Messages", path: "/messages", iconName: "Bell" },
  ],
  "Sales Agent": [
    { label: "Dashboard", path: "/dashboard", iconName: "LayoutDashboard" },
    { label: "Pipeline", path: "/pipeline", iconName: "TrendingUp" },
    { label: "Customers", path: "/customers", iconName: "Contact" },
    { label: "Requests", path: "/requests", iconName: "FileQuestion" },
    { label: "Quotations", path: "/quotations", iconName: "DollarSign" },
    { label: "Commissions", path: "/commissions", iconName: "DollarSign" },
    ...(canAccessProjectWorkspace("Sales Agent") ? [projectsNavItem("FolderKanban")] : []),
    { label: "Messages", path: "/messages", iconName: "Bell" },
  ],
  Client: [
    { label: "Home", path: "/dashboard", iconName: "Home" },
    { label: "My Requests", path: "/requests", iconName: "FileQuestion" },
    ...(canAccessProjectWorkspace("Client") ? [projectsNavItem("Layers")] : []),
    { label: "Contracts", path: "/contracts", iconName: "FileCheck2" },
    { label: "Certificates", path: "/certificates", iconName: "Award" },
    { label: "Invoices", path: "/invoices", iconName: "Receipt" },
    { label: "Messages", path: "/messages", iconName: "Bell" },
  ],
};
