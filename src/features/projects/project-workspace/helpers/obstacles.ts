import { ProjectTask } from "@/types/project";

export interface GroupedObstacles {
  critical: ProjectTask[];
  standard: ProjectTask[];
}

export function groupProjectObstacles(tasks: ProjectTask[]): GroupedObstacles {
  const list = tasks || [];
  const critical = list.filter((t) => t.priority === "Critical" || t.priority === "High");
  const standard = list.filter((t) => t.priority !== "Critical" && t.priority !== "High");
  return {
    critical,
    standard
  };
}
