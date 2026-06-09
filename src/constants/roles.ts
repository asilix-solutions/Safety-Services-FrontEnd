import { UserRole } from "@/types/role";

export const USER_ROLES = {
  SUPER_ADMIN: "Super Admin",
  COMPANY_ADMIN: "Company Admin",
  CONSULTING_ENGINEER: "Consulting Engineer",
  OPERATIONS_OFFICER: "Operations Officer",
  SALES_AGENT: "Sales Agent",
  CLIENT: "Client",
} as const;

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [USER_ROLES.SUPER_ADMIN]: "Global system administrator managing platform-wide tenants, settings, and audits.",
  [USER_ROLES.COMPANY_ADMIN]: "Enterprise portal manager overseeing company audits, engineers, and billing.",
  [USER_ROLES.CONSULTING_ENGINEER]: "Technical inspector executing blueprint evaluations and site visits.",
  [USER_ROLES.OPERATIONS_OFFICER]: "Project executor managing schedules, compliance checks, and maintenance issues.",
  [USER_ROLES.SALES_AGENT]: "Accounts manager tracking leads pipelines, commissions, and customer onboarding.",
  [USER_ROLES.CLIENT]: "Permit requester reviewing compliance records, reports, and invoices.",
};
