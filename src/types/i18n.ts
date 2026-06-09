export type Locale = "ar" | "en";

export type Namespace =
  | "common"
  | "auth"
  | "dashboard"
  | "projects"
  | "customers"
  | "reports"
  | "maintenance"
  | "settings"
  | "validation";

export interface Translations {
  common: typeof import("@/locales/en/common.json");
  auth: typeof import("@/locales/en/auth.json");
  dashboard: typeof import("@/locales/en/dashboard.json");
  projects: typeof import("@/locales/en/projects.json");
  customers: typeof import("@/locales/en/customers.json");
  reports: typeof import("@/locales/en/reports.json");
  maintenance: typeof import("@/locales/en/maintenance.json");
  settings: typeof import("@/locales/en/settings.json");
  validation: typeof import("@/locales/en/validation.json");
}

export type TxKey =
  | `common:${keyof Translations["common"]}`
  | `auth:${keyof Translations["auth"]}`
  | `dashboard:${keyof Translations["dashboard"]}`
  | `projects:${keyof Translations["projects"]}`
  | `customers:${keyof Translations["customers"]}`
  | `reports:${keyof Translations["reports"]}`
  | `maintenance:${keyof Translations["maintenance"]}`
  | `settings:${keyof Translations["settings"]}`
  | `validation:${keyof Translations["validation"]}`;
