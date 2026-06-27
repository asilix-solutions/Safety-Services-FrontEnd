import { ReactNode } from "react";

export interface OverviewWelcomeBtn {
  labelKey: string;
  labelFallback: string;
  href: string;
  iconName?: "plus" | "search" | "file" | "settings";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export interface OverviewStatItem {
  labelKey: string;
  labelFallback: string;
  count: number;
  badgeVariant?: "success" | "warning" | "destructive" | "info" | "default";
}

export interface OverviewStatCard {
  id: string;
  labelKey: string;
  labelFallback: string;
  value: string | number;
  descriptionKey?: string;
  descriptionFallback?: string;
  iconName?: "request" | "project" | "contract" | "invoice" | "certificate";
  href?: string;
  variant?: "success" | "warning" | "destructive" | "info" | "default";
}

export interface OverviewActionItem {
  id: string;
  titleKey: string;
  titleFallback: string;
  descriptionKey?: string;
  descriptionFallback?: string;
  statusKey?: string;
  statusFallback?: string;
  priority?: "low" | "medium" | "high" | "critical";
  href: string;
  actionLabelKey: string;
  actionLabelFallback: string;
  referenceId?: string;
  type?: "pay_invoice" | "sign_contract" | "fix_request_action" | "generic";
}

export interface OverviewEntityItem {
  id: string;
  title: string;
  subtitle?: string;
  statusKey?: string;
  statusFallback?: string;
  metaText?: string;
  progress?: number;
  href?: string;
}

export interface OverviewActivityItem {
  id: string;
  titleKey: string;
  titleFallback: string;
  descriptionKey?: string;
  descriptionFallback?: string;
  timestamp: string;
  type?: "request" | "project" | "contract" | "invoice" | "certificate" | "generic";
  referenceId?: string;
  href?: string;
}

export interface OverviewQuickAccessItem {
  id: string;
  labelKey: string;
  labelFallback: string;
  count?: number;
  href: string;
  iconName?: "request" | "project" | "contract" | "invoice" | "certificate";
}
