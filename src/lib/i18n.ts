import { Locale, Namespace } from "@/types/i18n";

export const getDirection = (locale: Locale): "rtl" | "ltr" => {
  return locale === "ar" ? "rtl" : "ltr";
};

// Static import definitions for SSR and client access
import arCommon from "@/locales/ar/common.json";
import enCommon from "@/locales/en/common.json";
import arAuth from "@/locales/ar/auth.json";
import enAuth from "@/locales/en/auth.json";
import arDashboard from "@/locales/ar/dashboard.json";
import enDashboard from "@/locales/en/dashboard.json";
import arProjects from "@/locales/ar/projects.json";
import enProjects from "@/locales/en/projects.json";
import arCustomers from "@/locales/ar/customers.json";
import enCustomers from "@/locales/en/customers.json";
import arReports from "@/locales/ar/reports.json";
import enReports from "@/locales/en/reports.json";
import arMaintenance from "@/locales/ar/maintenance.json";
import enMaintenance from "@/locales/en/maintenance.json";
import arSettings from "@/locales/ar/settings.json";
import enSettings from "@/locales/en/settings.json";
import arValidation from "@/locales/ar/validation.json";
import enValidation from "@/locales/en/validation.json";
import arRequests from "@/locales/ar/requests.json";
import enRequests from "@/locales/en/requests.json";

// Mapping dictionary registry
export const DICTIONARIES: Record<Locale, Record<Namespace, Record<string, string>>> = {
  ar: {
    common: arCommon,
    auth: arAuth,
    dashboard: arDashboard,
    projects: arProjects,
    customers: arCustomers,
    reports: arReports,
    maintenance: arMaintenance,
    settings: arSettings,
    validation: arValidation,
    requests: arRequests,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    projects: enProjects,
    customers: enCustomers,
    reports: enReports,
    maintenance: enMaintenance,
    settings: enSettings,
    validation: enValidation,
    requests: enRequests,
  },
};

// Retrieve loaded dictionaries for selected namespaces only (implements namespace loading strategy)
export function getNamespaceDictionaries(locale: Locale, namespaces: Namespace[]) {
  const dictionaryMap: Record<string, Record<string, string>> = {};
  namespaces.forEach((ns) => {
    dictionaryMap[ns] = DICTIONARIES[locale][ns] || {};
  });
  return dictionaryMap;
}
