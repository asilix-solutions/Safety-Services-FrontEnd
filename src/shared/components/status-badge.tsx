import React from "react";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { PROJECT_STATUS_METADATA, LICENSE_STATUS_METADATA, MAINTENANCE_STATUS_METADATA, CUSTOMER_STATUS_METADATA } from "@/constants/statuses";
import { PROJECT_STATUS_TX, LICENSE_STATUS_TX, MAINTENANCE_STATUS_TX, CUSTOMER_STATUS_TX } from "@/constants/status-translations";
import { ProjectStatus } from "@/types/project";
import { LicenseStatus } from "@/types/license";
import { MaintenanceStatus } from "@/types/maintenance";
import { CustomerStatus } from "@/types/customer";

type StatusType = "project" | "license" | "maintenance" | "customer";

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  let metadata: { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" } = {
    label: status,
    badgeVariant: "secondary",
  };

  let translatedLabel = status;

  try {
    if (type === "project") {
      if (status === "ready_for_final_inspection") {
        metadata = { label: "Awaiting Final Inspection", badgeVariant: "warning" };
        translatedLabel = t("projects:phases.ready_for_final_inspection");
      } else {
        metadata = PROJECT_STATUS_METADATA[status as ProjectStatus] || metadata;
        const txKey = PROJECT_STATUS_TX[status as ProjectStatus];
        if (txKey) translatedLabel = t(txKey);
      }
    } else if (type === "license") {
      metadata = LICENSE_STATUS_METADATA[status as LicenseStatus] || metadata;
      const txKey = LICENSE_STATUS_TX[status as LicenseStatus];
      if (txKey) translatedLabel = t(txKey);
    } else if (type === "maintenance") {
      metadata = MAINTENANCE_STATUS_METADATA[status as MaintenanceStatus] || metadata;
      const txKey = MAINTENANCE_STATUS_TX[status as MaintenanceStatus];
      if (txKey) translatedLabel = t(txKey);
    } else if (type === "customer") {
      metadata = CUSTOMER_STATUS_METADATA[status as CustomerStatus] || metadata;
      const txKey = CUSTOMER_STATUS_TX[status as CustomerStatus];
      if (txKey) translatedLabel = t(txKey);
    }
  } catch {
    // Fallback to metadata label
    translatedLabel = metadata.label;
  }

  return (
    <Badge variant={metadata.badgeVariant} className={className}>
      {translatedLabel}
    </Badge>
  );
}

export default StatusBadge;
