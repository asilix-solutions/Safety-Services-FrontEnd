import { http } from "@/services/http";

export enum WorkerType {
  Internal = 1,
  External = 2,
}

export enum RateUnit {
  Hourly = 1,
  Daily = 2,
  Monthly = 3,
  PerJob = 4,
}

export enum ResourceStatus {
  Active = 1,
  PendingApproval = 2,
  Inactive = 3,
}

export enum EquipmentOwnershipType {
  CompanyOwned = 1,
  Rented = 2,
  NewlyPurchased = 3,
}

export enum TaskStatus {
  Planned = 1,
  InProgress = 2,
  Submitted = 3,
  Approved = 4,
  Rejected = 5,
  Blocked = 6,
}

export interface FieldWorkerDto {
  id: string;
  fullName: string;
  phoneNumber?: string | null;
  specialty: string;
  type: WorkerType;
  baseCost: number;
  costUnit: RateUnit;
  status: ResourceStatus;
  createdAt: string;
}

export interface EquipmentDto {
  id: string;
  name: string;
  serialNumber?: string | null;
  category: string;
  ownershipType: EquipmentOwnershipType;
  costRate: number;
  costUnit: RateUnit;
  status: ResourceStatus;
  createdAt: string;
}

export interface PendingResourceDto {
  id: string;
  resourceType: "Worker" | "Equipment";
  name: string;
  categoryOrSpecialty: string;
  details: string;
  costRate: number;
  costUnit: RateUnit;
  status: ResourceStatus;
  createdAt: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetFieldWorkersQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  type?: WorkerType;
  status?: ResourceStatus;
  specialty?: string;
}

export interface GetEquipmentQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  category?: string;
  ownershipType?: EquipmentOwnershipType;
  status?: ResourceStatus;
}

export interface CreateFieldWorkerPayload {
  fullName: string;
  phoneNumber?: string;
  specialty: string;
  type: WorkerType;
  baseCost: number;
  costUnit: RateUnit;
}

export interface UpdateFieldWorkerPayload {
  fullName: string;
  phoneNumber?: string;
  specialty: string;
  type: WorkerType;
  baseCost: number;
  costUnit: RateUnit;
  status?: ResourceStatus;
}

export interface CreateEquipmentPayload {
  name: string;
  serialNumber?: string;
  category: string;
  ownershipType: EquipmentOwnershipType;
  costRate: number;
  costUnit: RateUnit;
}

export interface UpdateEquipmentPayload {
  name: string;
  serialNumber?: string;
  category: string;
  ownershipType: EquipmentOwnershipType;
  costRate: number;
  costUnit: RateUnit;
  status?: ResourceStatus;
}

export interface WorkerCostCalculationDto {
  directCost: number;
  explanation: string;
}

export interface ExecutionPlanSectionDto {
  id: string;
  name: string;
  order: number;
}

export interface ExecutionPlanSprintDto {
  id: string;
  sectionId: string;
  name: string;
  startDateUtc: string;
  endDateUtc: string;
  order: number;
}

export interface FieldTaskDto {
  id: string;
  instanceId: string;
  sectionId: string;
  sprintId?: string | null;
  assignedWorkerId?: string | null;
  workerName?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  plannedDateUtc: string;
  startedAtUtc?: string | null;
  completedAtUtc?: string | null;
}

export interface FieldPhotoDto {
  id: string;
  taskId: string;
  photoUrl: string;
  isVerified: boolean;
  isFlagged: boolean;
  flagReason?: string | null;
  justificationNotes?: string | null;
  uploadedAtUtc: string;
}

export interface ExecutionPlanDto {
  instanceId: string;
  jobNumber?: string;
  isExecutionComplete: boolean;
  sections: ExecutionPlanSectionDto[];
  sprints: ExecutionPlanSprintDto[];
  tasks: FieldTaskDto[];
  progressPercent: number;
}

export const fieldOpsApi = {
  // Workers Pool
  async getWorkers(params?: GetFieldWorkersQueryParams) {
    return http.get<PaginatedList<FieldWorkerDto>>("/field-workers", { params });
  },

  async getWorkerById(id: string) {
    return http.get<FieldWorkerDto>(`/field-workers/${id}`);
  },

  async createWorker(payload: CreateFieldWorkerPayload) {
    return http.post<string>("/field-workers", payload);
  },

  async updateWorker(id: string, payload: UpdateFieldWorkerPayload) {
    return http.put<boolean>(`/field-workers/${id}`, payload);
  },

  async retireWorker(id: string) {
    return http.delete<boolean>(`/field-workers/${id}`);
  },

  async linkWorkerAccount(id: string, userId: string | null) {
    return http.put<string>(`/field-workers/${id}/account`, { userId });
  },

  async calculateWorkerCost(workerId: string, durationUnits: number) {
    return http.post<WorkerCostCalculationDto>("/field-workers/calculate-cost", {
      fieldWorkerId: workerId,
      units: durationUnits,
    });
  },

  // Equipment Pool
  async getEquipment(params?: GetEquipmentQueryParams) {
    return http.get<PaginatedList<EquipmentDto>>("/equipment", { params });
  },

  async getEquipmentById(id: string) {
    return http.get<EquipmentDto>(`/equipment/${id}`);
  },

  async createEquipment(payload: CreateEquipmentPayload) {
    return http.post<string>("/equipment", payload);
  },

  async updateEquipment(id: string, payload: UpdateEquipmentPayload) {
    return http.put<boolean>(`/equipment/${id}`, payload);
  },

  async retireEquipment(id: string) {
    return http.delete<boolean>(`/equipment/${id}`);
  },

  async transitionEquipmentToCompanyOwned(id: string) {
    return http.post<boolean>(`/equipment/${id}/transition-to-company-owned`, {});
  },

  // Resource Approvals
  async getPendingApprovals() {
    return http.get<PendingResourceDto[]>("/resource-approvals");
  },

  async approveResource(id: string, resourceType: "Worker" | "Equipment") {
    return http.post<boolean>(`/resource-approvals/${id}/approve?resourceType=${resourceType}`, {});
  },

  // Execution Plan & Tasks
  async getExecutionPlan(instanceId: string) {
    return http.get<ExecutionPlanDto>(`/workflow-instances/${instanceId}/execution-plan`);
  },

  async applyStandardSections(instanceId: string) {
    return http.post<boolean>(`/workflow-instances/${instanceId}/execution-plan/sections/apply-standard`, {});
  },

  async completeExecutionPlan(instanceId: string) {
    return http.post<boolean>(`/workflow-instances/${instanceId}/execution-plan/complete`, {});
  },

  async getMyTasks() {
    return http.get<FieldTaskDto[]>("/field-tasks/mine");
  },

  async startTask(taskId: string) {
    return http.post<FieldTaskDto>(`/field-tasks/${taskId}/start`, {});
  },

  async submitTask(taskId: string, notes?: string) {
    return http.post<FieldTaskDto>(`/field-tasks/${taskId}/submit`, { notes });
  },

  async reviewTask(taskId: string, approved: boolean, feedback?: string) {
    return http.post<FieldTaskDto>(`/field-tasks/${taskId}/review`, {
      approved,
      feedback,
    });
  },

  async getTaskPhotos(taskId: string) {
    return http.get<FieldPhotoDto[]>(`/field-tasks/${taskId}/photos`);
  },

  async uploadTaskPhoto(taskId: string, file: File, latitude?: number, longitude?: number) {
    const formData = new FormData();
    formData.append("file", file);
    if (latitude !== undefined) formData.append("latitude", latitude.toString());
    if (longitude !== undefined) formData.append("longitude", longitude.toString());

    return http.post<FieldPhotoDto>(`/field-tasks/${taskId}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async justifyPhoto(photoId: string, reason: string) {
    return http.post<boolean>(`/field-photos/${photoId}/justify`, { reason });
  },
};
