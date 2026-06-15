import { RequestStatus } from "@/types/request-status";

export type RequestType = "new_license" | "maintenance_contract" | "engineering_blueprint" | "technical_report";

export type RequestClassification = "fast_track" | "maintenance_strategy" | "engineering_project" | "high_hazard_review";

export type RequestQueue =
  | "FAST_TRACK"
  | "MAINTENANCE"
  | "ENGINEERING"
  | "HIGH_HAZARD";

export type WorkflowStage =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "QUOTATION"
  | "QUOTATION_APPROVAL"
  | "PAYMENT_CONFIRMED"
  | "PROJECT_CREATED"
  | "FIELD_EXECUTION"
  | "FINAL_INSPECTION"
  | "COMPLETED";

export interface RequiredDocument {
  name: string;
  type: string;
  uploaded: boolean;
  fileName?: string;
}

export interface LicensingRequest {
  id: string;
  jobNumber: string;
  tenantId: string;
  requestType: RequestType;
  status: RequestStatus;
  clientId: string;
  clientName: string;
  
  // Facility details
  facilityName: string;
  crNumber: string;
  activityName: string;
  isicCode: string;
  area: number;
  city: string;
  district: string;
  addressDescription: string;
  contactName: string;
  contactPhone: string;
  
  // Safety risk fields
  safetyEquipment: boolean;
  fireAlarm: boolean;
  fireExtinguishers: boolean;
  emergencyExits: boolean;
  gasExtensions: boolean;
  hazardousMaterials: boolean;
  riskCategory: "low" | "medium" | "high";
  notes?: string;

  // Classification results
  classification: RequestClassification;
  siteVisitRequired: boolean;
  engineeringReviewRequired: boolean;
  instantReportAllowed: boolean;
  
  // Refinements
  currentStage: WorkflowStage;
  assignedQueue: RequestQueue | null;
  
  // Documents
  documents: RequiredDocument[];
  
  createdAt: string;
  updatedAt: string;
  timeline: { status: RequestStatus; comment: string; date: string }[];
}

