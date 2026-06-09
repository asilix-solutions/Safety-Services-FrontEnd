import { TenantProject } from "./types";

export function mapProjectToCard(proj: TenantProject) {
  return {
    id: proj.id,
    tenant: proj.tenantId,
    title: proj.name,
    status: proj.status,
    category: proj.category,
    type: proj.projectType,
  };
}
