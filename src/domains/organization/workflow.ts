import { Company, CompaniesSummary, TierLimitCheck, SubscriptionTier, TIER_LIMITS } from "./types";
import { getCompanies, saveCompanies } from "./storage";

function findCompanyOrThrow(companies: Company[], id: string): Company {
  const company = companies.find((c) => c.id === id);
  if (!company) throw new Error(`Company not found: ${id}`);
  return company;
}

export function suspendCompany(id: string): Company {
  const companies = getCompanies();
  const company = findCompanyOrThrow(companies, id);
  if (company.status === "suspended") {
    throw new Error("Company is already suspended");
  }
  company.status = "suspended";
  saveCompanies(companies);
  return company;
}

export function activateCompany(id: string): Company {
  const companies = getCompanies();
  const company = findCompanyOrThrow(companies, id);
  if (company.status === "active") {
    throw new Error("Company is already active");
  }
  company.status = "active";
  saveCompanies(companies);
  return company;
}

export function changeTier(id: string, newTier: SubscriptionTier): Company {
  const companies = getCompanies();
  const company = findCompanyOrThrow(companies, id);
  const limits = TIER_LIMITS[newTier];
  if (company.projectCount > limits.maxProjects) {
    throw new Error(`Cannot change to ${newTier}: current project count (${company.projectCount}) exceeds the tier limit (${limits.maxProjects})`);
  }
  if (company.personnelCount > limits.maxPersonnel) {
    throw new Error(`Cannot change to ${newTier}: current personnel count (${company.personnelCount}) exceeds the tier limit (${limits.maxPersonnel})`);
  }
  company.tier = newTier;
  saveCompanies(companies);
  return company;
}

export function checkTierLimit(company: Company): TierLimitCheck {
  const limits = TIER_LIMITS[company.tier];
  return {
    projectsAtLimit: company.projectCount >= limits.maxProjects,
    personnelAtLimit: company.personnelCount >= limits.maxPersonnel,
  };
}

export function getCompaniesSummary(): CompaniesSummary {
  const companies = getCompanies();
  return {
    total: companies.length,
    active: companies.filter((c) => c.status === "active").length,
    suspended: companies.filter((c) => c.status === "suspended").length,
  };
}
