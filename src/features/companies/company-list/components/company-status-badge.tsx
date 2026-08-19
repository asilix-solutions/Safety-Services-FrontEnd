import React from "react";
import { Badge } from "@/shared/ui/badge";
import { CompanyStatus } from "@/domains/organization/types";
import { useTranslation } from "@/providers/i18n-provider";
import { getStatusBadgeVariant, getStatusLabelKey } from "../helpers/company-table-helpers";

interface CompanyStatusBadgeProps {
  status: CompanyStatus;
}

export function CompanyStatusBadge({ status }: CompanyStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {t(getStatusLabelKey(status))}
    </Badge>
  );
}
