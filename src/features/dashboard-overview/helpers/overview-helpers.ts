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
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 40) return "bg-sky-500";
  return "bg-amber-500";
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
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "destructive":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "info":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}
