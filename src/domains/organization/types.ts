export type SubscriptionTier = "Trial" | "Basic" | "Professional";

export type CompanyStatus = "active" | "suspended" | "pending_verification";

export interface TierLimits {
  maxProjects: number;
  maxPersonnel: number;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  Trial: { maxProjects: 3, maxPersonnel: 5 },
  Basic: { maxProjects: 15, maxPersonnel: 25 },
  Professional: { maxProjects: Infinity, maxPersonnel: Infinity },
};

export interface Company {
  id: string;
  name: string;
  owner: string;
  plan: string;
  tier: SubscriptionTier;
  status: CompanyStatus;
  projectCount: number;
  personnelCount: number;
  expiresAt: string;
  registeredAt: string;
}

export interface CompaniesSummary {
  total: number;
  active: number;
  suspended: number;
}

export interface TierLimitCheck {
  projectsAtLimit: boolean;
  personnelAtLimit: boolean;
}