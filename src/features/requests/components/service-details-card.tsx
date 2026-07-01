import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { SERVICE_REGISTRY } from "@/domains/requests/service-config";
import { RequestType } from "@/domains/requests/types";

interface ServiceDetailsCardProps {
  values: {
    requestType: string;
    [key: string]: any;
  };
  titleClassName?: string;
}

export function ServiceDetailsCard({ values, titleClassName = "text-base font-bold text-foreground" }: ServiceDetailsCardProps) {
  const { t } = useTranslation();
  const requestType = values.requestType as RequestType;
  const config = SERVICE_REGISTRY[requestType];

  if (!config) return null;

  // Filter out fields that do not have a value populated
  const visibleFields = config.fields.filter((field) => {
    const val = values[field.key];
    if (val === undefined || val === null || val === "") return false;
    return true;
  });

  if (visibleFields.length === 0) return null;

  const renderValue = (field: any) => {
    const val = values[field.key];

    // Boolean formatting
    if (typeof val === "boolean") {
      return val 
        ? t("requests:wizard.serviceDetails.yes") || "Yes" 
        : t("requests:wizard.serviceDetails.no") || "No";
    }

    // Select options display formatting
    if (field.options && field.type === "select") {
      const option = field.options.find((opt: any) => opt.value === val);
      if (option) {
        return t(option.labelKey) || val;
      }
    }

    return String(val);
  };

  return (
    <Card className="border-border bg-card shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className={titleClassName}>
          {t("requests:wizard.serviceDetails.title") || "Service Details"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs divide-y divide-border">
        {/* Dynamic fields mapped from Registry */}
        {visibleFields.map((field) => (
          <div key={field.key} className="py-2.5 grid grid-cols-3 gap-2">
            <span className="text-muted-foreground">{t(field.labelKey)}:</span>
            <span className="col-span-2 font-semibold text-foreground leading-relaxed">
              {renderValue(field)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ServiceDetailsCard;
