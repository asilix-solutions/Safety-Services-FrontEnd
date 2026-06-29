export type TabId = "overview" | "execution" | "documents" | "obstacles";

export interface TabItem {
  id: TabId;
  labelKey: string;
}

export const PROJECT_TABS: TabItem[] = [
  { id: "overview", labelKey: "projects:tabs.overview" },
  { id: "execution", labelKey: "projects:tabs.execution" },
  { id: "documents", labelKey: "projects:tabs.documents" },
  { id: "obstacles", labelKey: "projects:tabs.obstacles" }
];
