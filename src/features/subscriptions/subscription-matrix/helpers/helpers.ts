import { CompanyStatus, SubscriptionTier } from "@/domains/organization/types";

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
  return `subscriptions:status.${status}`;
}

export function getTierLabelKey(tier: SubscriptionTier): string {
  return `subscriptions:distribution.tier.${tier}`;
}
