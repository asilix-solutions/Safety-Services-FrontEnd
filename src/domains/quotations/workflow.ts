export interface SuggestionContext {
  requestType?: string;
  classification?: string;
  assignedQueue?: string;
  projectType?: string;
  workspaceTemplate?: string;
}

export interface SuggestedQuotationItem {
  id: string;
  label: string;
  description: string;
  defaultUnitPrice?: number;
  taxable?: boolean;
}

export function getQuotationSuggestedItems(
  ctx: SuggestionContext,
  t: (key: string) => string
): SuggestedQuotationItem[] {
  const rType = (ctx.requestType || "").toLowerCase();
  const classif = (ctx.classification || "").toLowerCase();
  const queue = (ctx.assignedQueue || "").toLowerCase();
  const pType = (ctx.projectType || "").toLowerCase();
  const tpl = (ctx.workspaceTemplate || "").toLowerCase();

  const isMaintenance = 
    classif.includes("maintenance") || 
    queue.includes("maintenance") || 
    rType.includes("maintenance") || 
    pType === "maintenance" ||
    tpl === "maintenance";

  const isInstallation = 
    classif.includes("engineering") || 
    queue.includes("engineering") || 
    classif.includes("high_hazard") || 
    queue.includes("high_hazard") ||
    rType.includes("new_license") || 
    rType.includes("license") || 
    tpl === "installation_full";

  if (isMaintenance) {
    return [
      { id: "sug_m1", label: t("requests:quotations.presets.initial_audit"), description: "Initial Maintenance Audit", defaultUnitPrice: 1500, taxable: true },
      { id: "sug_m2", label: t("requests:quotations.presets.preventive_visit"), description: "Preventive Maintenance Visit", defaultUnitPrice: 800, taxable: true },
      { id: "sug_m3", label: t("requests:quotations.presets.device_testing"), description: "Fire Alarm Device Testing", defaultUnitPrice: 1200, taxable: true },
      { id: "sug_m4", label: t("requests:quotations.presets.valve_inspection"), description: "Pump / Valve Inspection", defaultUnitPrice: 950, taxable: true },
      { id: "sug_m5", label: t("requests:quotations.presets.lighting_check"), description: "Emergency Lighting Check", defaultUnitPrice: 600, taxable: true },
      { id: "sug_m6", label: t("requests:quotations.presets.annual_contract"), description: "Annual Maintenance Contract", defaultUnitPrice: 8500, taxable: true },
      { id: "sug_m7", label: t("requests:quotations.presets.repair_visit"), description: "Corrective Repair Visit", defaultUnitPrice: 1100, taxable: true }
    ];
  }

  if (isInstallation) {
    return [
      { id: "sug_i1", label: t("requests:quotations.presets.eng_review"), description: "Engineering Review", defaultUnitPrice: 2000, taxable: true },
      { id: "sug_i2", label: t("requests:quotations.presets.drawing_review"), description: "Shop Drawing Review", defaultUnitPrice: 1500, taxable: true },
      { id: "sug_i3", label: t("requests:quotations.presets.site_visit"), description: "Site Inspection Visit", defaultUnitPrice: 1000, taxable: true },
      { id: "sug_i4", label: t("requests:quotations.presets.alarm_install"), description: "Alarm System Installation", defaultUnitPrice: 12000, taxable: true },
      { id: "sug_i5", label: t("requests:quotations.presets.suppression_install"), description: "Fire Suppression System", defaultUnitPrice: 18000, taxable: true },
      { id: "sug_i6", label: t("requests:quotations.presets.ventilation_control"), description: "Ventilation / Smoke Control", defaultUnitPrice: 14000, taxable: true }
    ];
  }

  return [
    { id: "sug_c1", label: t("requests:quotations.presets.tech_report"), description: "Technical Report", defaultUnitPrice: 2500, taxable: true },
    { id: "sug_c2", label: t("requests:quotations.presets.compliance_report"), description: "Compliance Report", defaultUnitPrice: 3000, taxable: true },
    { id: "sug_c3", label: t("requests:quotations.presets.fitout_review"), description: "Fit-out Review", defaultUnitPrice: 1800, taxable: true },
    { id: "sug_c4", label: t("requests:quotations.presets.document_audit"), description: "Document Audit", defaultUnitPrice: 900, taxable: true }
  ];
}

export * from "./workflow/index";
