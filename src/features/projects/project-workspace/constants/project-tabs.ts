import { ProjectWorkspaceTab } from "@/constants/permissions";

export type TabId = ProjectWorkspaceTab;

export interface TabItem {
  id: TabId;
  labelKey: string;
}

export const PROJECT_TABS: TabItem[] = [
  { id: "overview", labelKey: "projects:tabs.overview" },
  { id: "timeline", labelKey: "projects:tabs.timeline" },
  { id: "systems", labelKey: "projects:tabs.systems" },
  { id: "procurement", labelKey: "projects:tabs.procurement" },
  { id: "labor", labelKey: "projects:tabs.labor" },
  { id: "siteVisits", labelKey: "projects:tabs.siteVisits" },
  { id: "obstacles", labelKey: "projects:tabs.obstacles" },
  { id: "attachments", labelKey: "projects:tabs.attachments" },
  { id: "photos", labelKey: "projects:tabs.photos" },
  { id: "inspection", labelKey: "projects:tabs.inspection" },
  { id: "completion", labelKey: "projects:tabs.completion" },
];
