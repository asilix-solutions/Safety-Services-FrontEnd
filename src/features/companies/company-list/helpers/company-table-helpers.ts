import { CompanyStatus, SubscriptionTier, Company, TIER_LIMITS } from "@/domains/organization/types";

export function getStatusBadgeVariant(status: CompanyStatus): "success" | "destructive" | "warning" {
  switch (status) {
    case "active":
      return "success";
    case "suspended":
      return "destructive";
    case "pending_verification":
      return "warning";
  }
}

export function getStatusLabelKey(status: CompanyStatus): string {
  return `companies:status.${status}`;
}

export function getTierLabelKey(tier: SubscriptionTier): string {
  return `companies:tier.${tier}`;
}

export function formatLimitLabel(
  count: number,
  limit: number,
  unlimitedText: string
): string {
  return Number.isFinite(limit) ? `${count} / ${limit}` : `${count} / ${unlimitedText}`;
}
