import { LicensingRequest, RequestType, WorkflowStage } from "./types";
import { RequestStatus } from "@/types/request-status";
import {
  WorkflowInstanceSummaryDto,
  ClientRequestSummaryDto,
  BackendWorkflowStatus,
  BackendServiceCategory,
} from "./api";

export function mapRequestToSummary(req: LicensingRequest) {
  return {
    reference: req.id,
    tenant: req.tenantId,
    client: req.clientName,
    state: req.status,
  };
}

export function mapBackendStatusToRequestStatus(status: BackendWorkflowStatus): RequestStatus {
  switch (status) {
    case BackendWorkflowStatus.Draft:
      return "draft";
    case BackendWorkflowStatus.Submitted:
      return "submitted";
    case BackendWorkflowStatus.UnderReview:
    case BackendWorkflowStatus.IntakeRevision:
      return "under_review";
    case BackendWorkflowStatus.QuotePending:
      return "quotation_created";
    case BackendWorkflowStatus.QuoteApproved:
      return "awaiting_approval";
    case BackendWorkflowStatus.InExecution:
      return "in_execution";
    case BackendWorkflowStatus.PreClosure:
    case BackendWorkflowStatus.Completed:
      return "completed";
    case BackendWorkflowStatus.Cancelled:
    case BackendWorkflowStatus.QuoteRejected:
      return "closed";
    case BackendWorkflowStatus.AwaitingPayment:
      return "awaiting_payment";
    default:
      return "under_review";
  }
}

export function mapBackendStatusToWorkflowStage(status: BackendWorkflowStatus): WorkflowStage {
  switch (status) {
    case BackendWorkflowStatus.Draft:
      return "DRAFT";
    case BackendWorkflowStatus.Submitted:
      return "SUBMITTED";
    case BackendWorkflowStatus.UnderReview:
    case BackendWorkflowStatus.IntakeRevision:
      return "UNDER_REVIEW";
    case BackendWorkflowStatus.QuotePending:
      return "QUOTATION";
    case BackendWorkflowStatus.QuoteApproved:
      return "QUOTATION_APPROVAL";
    case BackendWorkflowStatus.AwaitingPayment:
      return "READY_FOR_PAYMENT";
    case BackendWorkflowStatus.InExecution:
      return "FIELD_EXECUTION";
    case BackendWorkflowStatus.PreClosure:
      return "FINAL_INSPECTION";
    case BackendWorkflowStatus.Completed:
      return "COMPLETED";
    default:
      return "UNDER_REVIEW";
  }
}

export function mapBackendCategoryToRequestType(category: BackendServiceCategory): RequestType {
  switch (category) {
    case BackendServiceCategory.Licensing:
      return "new_license";
    case BackendServiceCategory.Maintenance:
      return "maintenance_contract";
    case BackendServiceCategory.Contracting:
      return "engineering_blueprint";
    default:
      return "new_license";
  }
}

export function mapWorkflowSummaryToLicensingRequest(
  dto: WorkflowInstanceSummaryDto,
  tenantId: string
): LicensingRequest {
  const status = mapBackendStatusToRequestStatus(dto.status);
  const currentStage = mapBackendStatusToWorkflowStage(dto.status);
  const requestType = mapBackendCategoryToRequestType(dto.serviceCategory);
  const dateStr = dto.createdAt || new Date().toISOString();

  return {
    id: dto.id,
    jobNumber: dto.jobNumber || `AMX-${dto.id.substring(0, 8)}`,
    tenantId: tenantId,
    requestType,
    status,
    clientId: dto.clientUserId || "client-user",
    clientName: dto.clientName || "عميل النظام",
    facilityName: dto.templateNameAr || "منشأة تجارية",
    crNumber: "1010000000",
    activityName: dto.currentStepTitleAr || "نشاط تجاري",
    isicCode: "1000",
    area: 500,
    city: "الرياض",
    district: "حي الملز",
    addressDescription: "المملكة العربية السعودية",
    contactName: dto.clientName || "المسؤول",
    contactPhone: "+966500000000",
    safetyEquipment: true,
    fireAlarm: true,
    fireExtinguishers: true,
    emergencyExits: true,
    gasExtensions: false,
    hazardousMaterials: false,
    riskCategory: "low",
    currentStage,
    classification: "fast_track",
    siteVisitRequired: false,
    engineeringReviewRequired: false,
    instantReportAllowed: true,
    assignedQueue: "FAST_TRACK",
    documents: [],
    timeline: [
      { status: "submitted", comment: "تم استلام الطلب وبدء المعالجة", date: dateStr }
    ],
    createdAt: dateStr,
    updatedAt: dateStr,
  };
}

export function mapClientRequestSummaryToLicensingRequest(
  dto: ClientRequestSummaryDto,
  tenantId: string,
  clientName: string,
  clientId: string
): LicensingRequest {
  const status = mapBackendStatusToRequestStatus(dto.status);
  const currentStage = mapBackendStatusToWorkflowStage(dto.status);
  const dateStr = dto.createdAt || new Date().toISOString();

  return {
    id: dto.id,
    jobNumber: dto.jobNumber || `AMX-${dto.id.substring(0, 8)}`,
    tenantId: tenantId,
    requestType: "new_license",
    status,
    clientId: clientId,
    clientName: clientName,
    facilityName: dto.serviceNameAr || "منشأة العميل",
    crNumber: "1010000000",
    activityName: dto.currentStepTitleAr || "طلب ترخيص سلامة",
    isicCode: "1000",
    area: 350,
    city: "الرياض",
    district: "حي العليا",
    addressDescription: "المملكة العربية السعودية",
    contactName: clientName,
    contactPhone: "+966500000000",
    safetyEquipment: true,
    fireAlarm: true,
    fireExtinguishers: true,
    emergencyExits: true,
    gasExtensions: false,
    hazardousMaterials: false,
    riskCategory: "low",
    currentStage,
    classification: "fast_track",
    siteVisitRequired: false,
    engineeringReviewRequired: false,
    instantReportAllowed: true,
    assignedQueue: "FAST_TRACK",
    documents: [],
    timeline: [
      { status: "submitted", comment: "تم تقديم الطلب بنجاح", date: dateStr }
    ],
    createdAt: dateStr,
    updatedAt: dateStr,
  };
}
