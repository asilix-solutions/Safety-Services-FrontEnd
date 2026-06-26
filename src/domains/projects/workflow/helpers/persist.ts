import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { createOrUpdateProject } from "@/domains/projects/storage";
import { upsertRequest } from "@/domains/requests/storage";

export function persistProject(project: Project): void {
  createOrUpdateProject(project);
}

export function persistRequest(request: LicensingRequest): void {
  upsertRequest(request);
}
