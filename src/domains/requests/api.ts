import { http } from "@/services/http";

/**
 * Service Category matches backend Amanix.Domain.Enums.ServiceCategory:
 * 1 = Licensing (عقود التراخيص وشهادات السلامة)
 * 2 = Maintenance (عقود الصيانة الدورية)
 * 3 = Contracting (مشاريع التوريد والتركيب)
 */
export enum BackendServiceCategory {
  Licensing = 1,
  Maintenance = 2,
  Contracting = 3,
}

/**
 * WorkflowInstanceStatus matches backend Amanix.Domain.Enums.WorkflowInstanceStatus
 */
export enum BackendWorkflowStatus {
  Draft = 1,
  Submitted = 2,
  UnderReview = 3,
  IntakeRevision = 4,
  QuotePending = 5,
  QuoteApproved = 6,
  QuoteRejected = 7,
  InExecution = 8,
  PreClosure = 9,
  Completed = 10,
  SlaBreached = 11,
  Cancelled = 12,
  AwaitingPayment = 13,
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateIntakeDraftPayload {
  serviceCategory: BackendServiceCategory;
  templateId?: string;
  clientUserId?: string;
  facilityLatitude?: number;
  facilityLongitude?: number;
  capturedFormDataJson?: string;
}

export interface UpdateIntakeDraftPayload {
  facilityLatitude?: number;
  facilityLongitude?: number;
  capturedFormDataJson?: string;
}

export interface SubmitIntakeResponseData {
  id: string;
  jobNumber: string;
  submittedAtUtc: string;
}

export interface ResubmitIntakeResponseData {
  id: string;
  jobNumber: string;
  status: BackendWorkflowStatus;
  revisionCount: number;
}

export interface TriageDecisionResponseData {
  id: string;
  jobNumber?: string;
  status: BackendWorkflowStatus;
  currentStepCode: string;
}

export interface UploadIntakeDocumentResponseData {
  fileId: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  url: string;
}

export interface StaffStepProgressDto {
  stepOrder: number;
  stepCode: string;
  displayTitleAr: string;
  displayTitleEn?: string;
  targetRole: number;
  defaultSlaHours: number;
  state: number; // 1: Completed, 2: Active, 3: Upcoming
}

export interface ClientStepProgressDto {
  stepOrder: number;
  displayTitleAr: string;
  displayTitleEn?: string;
  state: number;
}

export interface WorkflowInstanceSummaryDto {
  id: string;
  jobNumber?: string;
  status: BackendWorkflowStatus;
  templateId: string;
  templateNameAr: string;
  serviceCategory: BackendServiceCategory;
  clientUserId?: string;
  clientName?: string;
  currentStepCode: string;
  currentStepTitleAr: string;
  currentStepTargetRole: number;
  slaTargetAtUtc?: string;
  isSlaBreached: boolean;
  isAwaitingTriage: boolean;
  submittedAtUtc?: string;
  createdAt: string;
}

export interface WorkflowInstanceDetailDto {
  id: string;
  jobNumber?: string;
  status: BackendWorkflowStatus;
  templateId: string;
  templateNameAr: string;
  templateNameEn?: string;
  serviceCategory: BackendServiceCategory;
  clientUserId?: string;
  clientName?: string;
  facilityLatitude: number;
  facilityLongitude: number;
  currentStepCode: string;
  currentStepTitleAr: string;
  currentStepTitleEn?: string;
  currentStepTargetRole: number;
  currentStepEnteredAtUtc: string;
  slaTargetAtUtc?: string;
  isSlaBreached: boolean;
  isAwaitingTriage: boolean;
  revisionCount: number;
  rejectionReason?: string;
  submittedAtUtc?: string;
  triagedAtUtc?: string;
  isVaultedReadOnly: boolean;
  viewerAccess: number; // 1: OmniMonitor, 2: ActiveWorkspace, 3: CompletedSummary, 4: AwaitingTurn
  canAct: boolean;
  capturedFormData?: Record<string, unknown> | null;
  steps: StaffStepProgressDto[];
  createdAt: string;
}

export interface ClientRequestSummaryDto {
  id: string;
  jobNumber?: string;
  status: BackendWorkflowStatus;
  serviceNameAr: string;
  serviceNameEn?: string;
  currentStepTitleAr: string;
  currentStepTitleEn?: string;
  completionPercentage: number;
  submittedAtUtc?: string;
  createdAt: string;
}

export interface ClientRequestDetailDto {
  id: string;
  jobNumber?: string;
  status: BackendWorkflowStatus;
  serviceNameAr: string;
  serviceNameEn?: string;
  facilityLatitude: number;
  facilityLongitude: number;
  currentStepTitleAr: string;
  currentStepTitleEn?: string;
  isEditable: boolean;
  rejectionReason?: string;
  capturedFormData?: Record<string, unknown> | null;
  steps: ClientStepProgressDto[];
  completionPercentage: number;
  submittedAtUtc?: string;
  createdAt: string;
}

export interface QuotationLineDto {
  itemDescriptionAr: string;
  itemDescriptionEn?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  totalPrice: number;
}

export interface ClientQuotationDto {
  quotationNumber: string;
  status: number;
  issueDateUtc: string;
  validUntilUtc: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  termsAndConditionsAr?: string;
  termsAndConditionsEn?: string;
  lines: QuotationLineDto[];
}

export interface QuotationDecisionDto {
  quotationNumber: string;
  quotationStatus: number;
  instanceStatus: BackendWorkflowStatus;
  currentStepCode: string;
}

export interface ProjectPaymentStatementDto {
  projectId: string;
  contractTotal: number;
  paidTotal: number;
  pendingTotal: number;
  outstandingAmount: number;
  isFullyPaid: boolean;
}

export interface WorkflowInstancesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: BackendWorkflowStatus;
  serviceCategory?: BackendServiceCategory;
  awaitingTriage?: boolean;
  overdue?: boolean;
  assignedToMyRole?: boolean;
}

export interface MyRequestsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: BackendWorkflowStatus;
}

export const requestsApi = {
  // ==========================================
  // Smart Intake Portal (Draft, Submit, Triage)
  // ==========================================

  /**
   * Opens a new service request as a draft.
   * POST /api/v1/intake
   */
  async createDraft(payload: CreateIntakeDraftPayload) {
    return http.post<string>("/intake", payload);
  },

  /**
   * Saves progress on a draft request.
   * PUT /api/v1/intake/{id}
   */
  async saveDraft(id: string, payload: UpdateIntakeDraftPayload) {
    return http.put<boolean>(`/intake/${id}`, payload);
  },

  /**
   * Uploads a supporting document to a draft request (PDF, DWG, JPG, PNG).
   * POST /api/v1/intake/{id}/documents
   */
  async uploadDocument(id: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<UploadIntakeDocumentResponseData>(`/intake/${id}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Submits a draft request and issues its authoritative AMX-{YYYY}-{00000} job number.
   * POST /api/v1/intake/{id}/submit
   */
  async submit(id: string) {
    return http.post<SubmitIntakeResponseData>(`/intake/${id}/submit`);
  },

  /**
   * Resubmits a corrected request after revision.
   * POST /api/v1/intake/{id}/resubmit
   */
  async resubmit(id: string) {
    return http.post<ResubmitIntakeResponseData>(`/intake/${id}/resubmit`);
  },

  /**
   * Management triage desk: Accepts request into active job.
   * POST /api/v1/intake/{id}/accept
   */
  async accept(id: string) {
    return http.post<TriageDecisionResponseData>(`/intake/${id}/accept`);
  },

  /**
   * Management triage desk: Rejects request with mandatory reason.
   * POST /api/v1/intake/{id}/reject
   */
  async reject(id: string, reason: string) {
    return http.post<TriageDecisionResponseData>(`/intake/${id}/reject`, { reason });
  },

  // ==========================================
  // Staff Workflow Instances (/workflow-instances)
  // ==========================================

  /**
   * Lists the tenant's service requests and jobs for staff.
   * GET /api/v1/workflow-instances
   */
  async getWorkflowInstances(params?: WorkflowInstancesQueryParams) {
    return http.get<PaginatedList<WorkflowInstanceSummaryDto>>("/workflow-instances", {
      params,
    });
  },

  /**
   * Retrieves single job details with turn-based role visibility.
   * GET /api/v1/workflow-instances/{id}
   */
  async getWorkflowInstanceById(id: string) {
    return http.get<WorkflowInstanceDetailDto>(`/workflow-instances/${id}`);
  },

  /**
   * Terminates a job that will not be completed with a recorded reason.
   * POST /api/v1/workflow-instances/{id}/cancel
   */
  async cancelWorkflowInstance(id: string, reason: string) {
    return http.post<boolean>(`/workflow-instances/${id}/cancel`, { reason });
  },

  // ==========================================
  // Client Portal View (/my-requests)
  // ==========================================

  /**
   * Lists the caller's own service requests (Client projection shield).
   * GET /api/v1/my-requests
   */
  async getMyRequests(params?: MyRequestsQueryParams) {
    return http.get<PaginatedList<ClientRequestSummaryDto>>("/my-requests", {
      params,
    });
  },

  /**
   * Retrieves client projection of a single request.
   * GET /api/v1/my-requests/{id}
   */
  async getMyRequestById(id: string) {
    return http.get<ClientRequestDetailDto>(`/my-requests/${id}`);
  },

  /**
   * Retrieves quotation issued for caller's request.
   * GET /api/v1/my-requests/{id}/quotation
   */
  async getMyQuotation(id: string) {
    return http.get<ClientQuotationDto>(`/my-requests/${id}/quotation`);
  },

  /**
   * Records client decision on quotation (accept or decline with feedback).
   * POST /api/v1/my-requests/{id}/quotation/respond
   */
  async respondToQuotation(id: string, accept: boolean, feedback?: string) {
    return http.post<QuotationDecisionDto>(`/my-requests/${id}/quotation/respond`, {
      accept,
      feedback,
    });
  },

  /**
   * Retrieves payment statement balance for the project.
   * GET /api/v1/my-requests/{id}/payments
   */
  async getPaymentStatement(id: string) {
    return http.get<ProjectPaymentStatementDto>(`/my-requests/${id}/payments`);
  },
};
