import { http } from "@/services/http";
import { BackendServiceCategory, PaginatedList } from "@/domains/requests/api";

export interface WorkflowStepDto {
  id: string;
  stepOrder: number;
  stepCode: string;
  displayTitleAr: string;
  displayTitleEn?: string | null;
  targetRole: number;
  defaultSlaHours: number;
  requiresManagerialSignOff: boolean;
  isVisibleToClient: boolean;
  formSchemaJson?: string | null;
}

export interface WorkflowTemplateDto {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  serviceCategory: BackendServiceCategory;
  templateCode?: number | null;
  isDefault: boolean;
  isActive: boolean;
  stepCount: number;
  createdAt: string;
}

export interface WorkflowTemplateDetailDto {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  serviceCategory: BackendServiceCategory;
  templateCode?: number | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  steps: WorkflowStepDto[];
}

export interface WorkflowTemplatesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  serviceCategory?: BackendServiceCategory;
  isActive?: boolean;
}

export const workflowsApi = {
  /**
   * Retrieves a paginated list of workflow templates.
   * GET /api/v1/workflow-templates
   */
  async getWorkflowTemplates(params?: WorkflowTemplatesQueryParams) {
    return http.get<PaginatedList<WorkflowTemplateDto>>("/workflow-templates", { params });
  },

  /**
   * Retrieves a single workflow template with full step definitions.
   * GET /api/v1/workflow-templates/{id}
   */
  async getWorkflowTemplateById(id: string) {
    return http.get<WorkflowTemplateDetailDto>(`/workflow-templates/${id}`);
  },

  /**
   * Finds the default workflow template for a given service category.
   */
  async getDefaultTemplateForCategory(category: BackendServiceCategory): Promise<WorkflowTemplateDetailDto | null> {
    try {
      const listRes = await this.getWorkflowTemplates({ serviceCategory: category, pageSize: 20 });
      if (!listRes.isSuccess || !listRes.data?.items?.length) {
        return null;
      }
      const defaultItem = listRes.data.items.find((item) => item.isDefault) || listRes.data.items[0];
      const detailRes = await this.getWorkflowTemplateById(defaultItem.id);
      return detailRes.isSuccess && detailRes.data ? detailRes.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Clones an existing workflow template into a new draft.
   * POST /api/v1/workflow-templates/{id}/clone
   */
  async cloneTemplate(id: string) {
    return http.post<string>(`/workflow-templates/${id}/clone`);
  },

  /**
   * Designates a template as the default for its service category.
   * POST /api/v1/workflow-templates/{id}/set-default
   */
  async setDefaultTemplate(id: string) {
    return http.post<boolean>(`/workflow-templates/${id}/set-default`);
  },

  /**
   * Creates a new custom workflow template.
   * POST /api/v1/workflow-templates
   */
  async createTemplate(payload: Partial<WorkflowTemplateDetailDto>) {
    return http.post<string>("/workflow-templates", payload);
  },

  /**
   * Updates an existing workflow template.
   * PUT /api/v1/workflow-templates/{id}
   */
  async updateTemplate(id: string, payload: Partial<WorkflowTemplateDetailDto>) {
    return http.put<boolean>(`/workflow-templates/${id}`, payload);
  },

  /**
   * Archives a workflow template.
   * DELETE /api/v1/workflow-templates/{id}
   */
  async deleteTemplate(id: string) {
    return http.delete<boolean>(`/workflow-templates/${id}`);
  },
};
