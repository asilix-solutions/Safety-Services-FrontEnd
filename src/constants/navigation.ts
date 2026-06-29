import { UserRole } from "@/types/role";

export interface NavigationItem {
  label: string;
  path: string;
  iconName: string;
}

/**
 * Sidebar Navigation definitions per Role, referencing flat, explicit paths.
 */
export const ROLE_NAVIGATION: Record<UserRole, NavigationItem[]> = {
  "Super Admin": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Companies", path: "/companies", iconName: "Building2" },
    { label: "Subscriptions", path: "/subscriptions", iconName: "CreditCard" },
    { label: "Users", path: "/users", iconName: "Users" },
    { label: "Certificates", path: "/certificates", iconName: "Award" },
    { label: "Settings", path: "/settings", iconName: "Settings" },
  ],
  "Company Admin": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Requests", path: "/requests", iconName: "FileSignature" },
    { label: "Quotation Approvals", path: "/quotations/approvals", iconName: "ClipboardCheck" },
    { label: "Projects", path: "/projects", iconName: "FolderKanban" },
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
    { label: "Reports", path: "/reports", iconName: "FileText" },
    { label: "Quotations", path: "/quotations", iconName: "DollarSign" },
    { label: "Site Visits", path: "/site-visits", iconName: "MapPin" },
  ],
  "Operations Officer": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Requests", path: "/requests", iconName: "Inbox" },
    { label: "Projects", path: "/projects", iconName: "Kanban" },
    { label: "Site Visits", path: "/site-visits", iconName: "MapPin" },
  ],
  "Sales Agent": [
    { label: "Dashboard", path: "/", iconName: "LayoutDashboard" },
    { label: "Customers", path: "/customers", iconName: "Contact" },
    { label: "Requests", path: "/requests", iconName: "FileQuestion" },
  ],
  Client: [
    { label: "Home", path: "/", iconName: "Home" },
    { label: "My Requests", path: "/requests", iconName: "FileQuestion" },
    { label: "Projects", path: "/projects", iconName: "Layers" },
    { label: "Contracts", path: "/contracts", iconName: "FileCheck2" },
    { label: "Certificates", path: "/certificates", iconName: "Award" },
    { label: "Invoices", path: "/invoices", iconName: "Receipt" },
  ],
};
