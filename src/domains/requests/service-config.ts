import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { RequestType, RequiredDocument } from "./types";

/**
 * `geo` is a paired latitude/longitude control that writes a single
 * `"lat, lng"` string into the field. Kept as one stored value so the existing
 * external-maps link keeps working without a type or storage migration.
 */
export type FieldType = "text" | "number" | "select" | "textarea" | "checkbox" | "date" | "geo";

/**
 * A rule gate an option depends on. The gate's value is produced by
 * `workflow.ts#classifyRequest` — never re-derived by the renderer. Declaring it
 * here keeps the governance rule out of the UI: the form only asks "is this gate
 * open?", it never decides what opens it.
 */
export type FieldOptionGate = "instantReportAllowed";

export interface FieldOption {
  value: string;
  labelKey: string;
  /** When set, the option is only selectable while this gate is open. */
  gate?: FieldOptionGate;
  /** Shown as the reason when `gate` is closed. Required whenever `gate` is set. */
  gateBlockedReasonKey?: string;
}

export interface FieldConfig {
  key: keyof ClientRequestFormValues;
  type: FieldType;
  labelKey: string;
  placeholderKey?: string;
  required: boolean;
  options?: FieldOption[];
}

export interface ServiceConfig {
  requestType: RequestType;
  fields: FieldConfig[];
  documents: Omit<RequiredDocument, "uploaded">[];
}

export const SERVICE_REGISTRY: Record<RequestType, ServiceConfig> = {
  new_license: {
    requestType: "new_license",
    documents: [
      { name: "Commercial Registration / 700 Document", type: "pdf,image", required: true },
      { name: "Building Permit", type: "pdf", required: true },
      { name: "Deed of Ownership / Rental Contract", type: "pdf", required: true },
      { name: "Site Photos", type: "image,zip", required: true },
    ],
    fields: [
      {
        key: "landPlotNumber",
        type: "text",
        labelKey: "requests:wizard.serviceDetails.landPlotNumber",
        placeholderKey: "requests:wizard.serviceDetails.landPlotNumberPlaceholder",
        required: true,
      },
      {
        key: "gpsCoordinates",
        type: "geo",
        labelKey: "requests:wizard.serviceDetails.gpsCoordinates",
        placeholderKey: "requests:wizard.serviceDetails.gpsCoordinatesPlaceholder",
        required: false,
      },
      {
        key: "buildingStatus",
        type: "select",
        labelKey: "requests:wizard.serviceDetails.buildingStatus",
        placeholderKey: "requests:wizard.serviceDetails.placeholderSelectStatus",
        required: true,
        options: [
          { value: "ready", labelKey: "requests:wizard.serviceDetails.buildingStatusReady" },
          { value: "under_construction", labelKey: "requests:wizard.serviceDetails.buildingStatusUnderConstruction" },
          { value: "renovation", labelKey: "requests:wizard.serviceDetails.buildingStatusRenovation" },
        ],
      },
      {
        key: "licensePurpose",
        type: "text",
        labelKey: "requests:wizard.serviceDetails.licensePurpose",
        placeholderKey: "requests:wizard.serviceDetails.licensePurposePlaceholder",
        required: true,
      },
      {
        key: "currentSafetyEquipment",
        type: "textarea",
        labelKey: "requests:wizard.serviceDetails.currentSafetyEquipment",
        placeholderKey: "requests:wizard.serviceDetails.currentSafetyEquipmentPlaceholder",
        required: false,
      },
    ],
  },
  maintenance_contract: {
    requestType: "maintenance_contract",
    documents: [
      { name: "Old Maintenance Contract (Optional)", type: "pdf", required: false },
      { name: "Current Systems Photos", type: "image,zip", required: true },
      { name: "Site Access/Contact Document (Optional)", type: "pdf,text", required: false },
    ],
    fields: [
      {
        key: "existingSafetySystems",
        type: "textarea",
        labelKey: "requests:wizard.serviceDetails.existingSafetySystems",
        placeholderKey: "requests:wizard.serviceDetails.existingSafetySystemsPlaceholder",
        required: true,
      },
      {
        key: "lastMaintenanceDate",
        type: "date",
        labelKey: "requests:wizard.serviceDetails.lastMaintenanceDate",
        required: false,
      },
      {
        key: "preferredVisitDate",
        type: "date",
        labelKey: "requests:wizard.serviceDetails.preferredVisitDate",
        required: true,
      },
      {
        key: "onSiteCoordinatorName",
        type: "text",
        labelKey: "requests:wizard.serviceDetails.onSiteCoordinatorName",
        placeholderKey: "requests:wizard.serviceDetails.onSiteCoordinatorNamePlaceholder",
        required: true,
      },
      {
        key: "onSiteCoordinatorPhone",
        type: "text",
        labelKey: "requests:wizard.serviceDetails.onSiteCoordinatorPhone",
        placeholderKey: "requests:wizard.serviceDetails.onSiteCoordinatorPhonePlaceholder",
        required: true,
      },
      {
        key: "oldContractAvailable",
        type: "checkbox",
        labelKey: "requests:wizard.serviceDetails.oldContractAvailable",
        required: false,
      },
    ],
  },
  engineering_blueprint: {
    requestType: "engineering_blueprint",
    documents: [
      { name: "Blueprint File (PDF/DWG/DXF)", type: "pdf,dwg,zip", required: true },
      { name: "Building Permit", type: "pdf", required: true },
      { name: "Architectural Plan (Optional)", type: "pdf", required: false },
    ],
    fields: [
      {
        key: "blueprintScope",
        type: "textarea",
        labelKey: "requests:wizard.serviceDetails.blueprintScope",
        placeholderKey: "requests:wizard.serviceDetails.blueprintScopePlaceholder",
        required: true,
      },
      {
        key: "buildingFloors",
        type: "number",
        labelKey: "requests:wizard.serviceDetails.buildingFloors",
        placeholderKey: "requests:wizard.serviceDetails.buildingFloorsPlaceholder",
        required: true,
      },
      {
        key: "constructionStatus",
        type: "select",
        labelKey: "requests:wizard.serviceDetails.constructionStatus",
        placeholderKey: "requests:wizard.serviceDetails.placeholderSelectConstStatus",
        required: true,
        options: [
          { value: "not_started", labelKey: "requests:wizard.serviceDetails.constructionStatusNotStarted" },
          { value: "foundation", labelKey: "requests:wizard.serviceDetails.constructionStatusFoundation" },
          { value: "finishing", labelKey: "requests:wizard.serviceDetails.constructionStatusFinishing" },
        ],
      },
      {
        key: "requiredSystems",
        type: "textarea",
        labelKey: "requests:wizard.serviceDetails.requiredSystems",
        placeholderKey: "requests:wizard.serviceDetails.requiredSystemsPlaceholder",
        required: false,
      },
      {
        key: "engineeringNotes",
        type: "textarea",
        labelKey: "requests:wizard.serviceDetails.engineeringNotes",
        placeholderKey: "requests:wizard.serviceDetails.engineeringNotesPlaceholder",
        required: false,
      },
    ],
  },
  technical_report: {
    requestType: "technical_report",
    documents: [
      { name: "Rental Contract", type: "pdf", required: true },
      { name: "Building License", type: "pdf", required: true },
      { name: "Site Photos", type: "image,zip", required: true },
      { name: "Case Documents", type: "pdf,image", required: true },
    ],
    fields: [
      {
        key: "reportType",
        type: "select",
        labelKey: "requests:wizard.serviceDetails.reportType",
        placeholderKey: "requests:wizard.serviceDetails.placeholderSelectReportType",
        required: true,
        options: [
          {
            // FR-RUL-05 / FR-RUL-01: an instant report is a Fast-Track privilege.
            // High-hazard activities and anything outside the Fast-Track band lose it.
            value: "instant",
            labelKey: "requests:wizard.serviceDetails.reportTypeInstant",
            gate: "instantReportAllowed",
            gateBlockedReasonKey: "requests:wizard.serviceDetails.reportTypeInstantBlockedReason",
          },
          { value: "non_instant", labelKey: "requests:wizard.serviceDetails.reportTypeNonInstant" },
          { value: "compliance", labelKey: "requests:wizard.serviceDetails.reportTypeCompliance" },
        ],
      },
      {
        key: "caseDescription",
        type: "textarea",
        labelKey: "requests:wizard.serviceDetails.caseDescription",
        placeholderKey: "requests:wizard.serviceDetails.caseDescriptionPlaceholder",
        required: true,
      },
      {
        key: "buildingLicenseContext",
        type: "textarea",
        labelKey: "requests:wizard.serviceDetails.buildingLicenseContext",
        placeholderKey: "requests:wizard.serviceDetails.buildingLicenseContextPlaceholder",
        required: false,
      },
      {
        key: "inspectionNeeded",
        type: "checkbox",
        labelKey: "requests:wizard.serviceDetails.inspectionNeeded",
        required: false,
      },
    ],
  },
};
