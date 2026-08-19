import React from "react";
import { FileQuestion, FolderOpen, FileText, Receipt, Award, Plus, Search, Settings, HelpCircle } from "lucide-react";

export function formatOverviewDate(dateStr?: string | null, t?: (key: string) => string): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (t) {
      if (diffDays <= 0) return t("common:overview_today");
      if (diffDays === 1) return t("common:overview_yesterday");
      const text = t("common:overview_days_ago");
      return text.includes("{days}") ? text.replace("{days}", String(diffDays)) : `${diffDays} days ago`;
    }

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  } catch {
    return String(dateStr);
  }
}

export function getOverviewProgressColor(progress: number): string {
  if (progress >= 80) return "bg-success";
  if (progress >= 40) return "bg-primary";
  return "bg-warning";
}

export function getOverviewIcon(name?: string, className = "h-5 w-5") {
  switch (name) {
    case "request":
      return React.createElement(FileQuestion, { className });
    case "project":
      return React.createElement(FolderOpen, { className });
    case "contract":
      return React.createElement(FileText, { className });
    case "invoice":
      return React.createElement(Receipt, { className });
    case "certificate":
      return React.createElement(Award, { className });
    case "plus":
      return React.createElement(Plus, { className });
    case "search":
      return React.createElement(Search, { className });
    case "settings":
      return React.createElement(Settings, { className });
    default:
      return React.createElement(HelpCircle, { className });
  }
}

export function getOverviewBadgeClass(variant?: string): string {
  switch (variant) {
    case "success":
      return "bg-success/10 text-success border-success/20";
    case "warning":
      return "bg-warning/10 text-warning border-warning/20";
    case "destructive":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "info":
      return "bg-info/10 text-info border-info/20";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}
