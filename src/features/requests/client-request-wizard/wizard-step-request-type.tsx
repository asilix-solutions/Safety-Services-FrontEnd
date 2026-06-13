"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FileSignature, Wrench, FileCheck, FileText } from "lucide-react";
import { RequestType } from "@/domains/requests/types";
import { useTranslation } from "@/providers/i18n-provider";

interface RequestTypeStepProps {
  value: RequestType;
  onChange: (value: RequestType) => void;
  onNext: () => void;
}

export function RequestTypeStep({ value, onChange, onNext }: RequestTypeStepProps) {
  const { t } = useTranslation();

  const options = [
    {
      id: "new_license" as RequestType,
      title: t("requests:wizard.requestTypes.newLicense.title"),
      description: t("requests:wizard.requestTypes.newLicense.description"),
      icon: <FileSignature className="h-6 w-6 text-emerald-500" />,
      docs: [
        t("requests:wizard.documents.commercialRegistration"),
        t("requests:wizard.documents.buildingPermit"),
        t("requests:wizard.documents.sitePhotos")
      ],
    },
    {
      id: "maintenance_contract" as RequestType,
      title: t("requests:wizard.requestTypes.maintenanceContract.title"),
      description: t("requests:wizard.requestTypes.maintenanceContract.description"),
      icon: <Wrench className="h-6 w-6 text-amber-500" />,
      docs: [
        t("requests:wizard.documents.existingAgreements"),
        t("requests:wizard.documents.alarmExtinguisherPhotos")
      ],
    },
    {
      id: "engineering_blueprint" as RequestType,
      title: t("requests:wizard.requestTypes.engineeringBlueprint.title"),
      description: t("requests:wizard.requestTypes.engineeringBlueprint.description"),
      icon: <FileCheck className="h-6 w-6 text-blue-500" />,
      docs: [
        t("requests:wizard.documents.architecturalBlueprintPdf"),
        t("requests:wizard.documents.buildingPermit")
      ],
    },
    {
      id: "technical_report" as RequestType,
      title: t("requests:wizard.requestTypes.technicalReport.title"),
      description: t("requests:wizard.requestTypes.technicalReport.description"),
      icon: <FileText className="h-6 w-6 text-indigo-500" />,
      docs: [
        t("requests:wizard.documents.leaseAgreement"),
        t("requests:wizard.documents.facilityLayoutPhotos")
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">{t("requests:wizard.requestType.title")}</h2>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.requestType.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <Card
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                onNext();
              }}
              className={`border cursor-pointer transition-all duration-300 hover:shadow-md ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-accent-foreground/30"
              }`}
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="p-2.5 rounded-xl bg-muted border border-border shrink-0">
                  {opt.icon}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-foreground">{opt.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{opt.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-1 text-xs">
                <p className="font-semibold text-[10px] text-muted-foreground tracking-wide uppercase mb-1.5">
                  {t("requests:wizard.requiredDocumentsChecklist")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {opt.docs.map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-secondary/40 text-muted-foreground font-medium text-[10px]"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
export default RequestTypeStep;
