"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select } from "@/shared/ui/select";
import { SERVICE_REGISTRY } from "@/domains/requests/service-config";
import { RequestType } from "@/domains/requests/types";

interface SafetyRiskStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function SafetyRiskStep({ form, onNext, onPrev }: SafetyRiskStepProps) {
  const { t } = useTranslation();
  const { register, watch, trigger, formState: { errors } } = form;

  const requestType = watch("requestType") as RequestType;
  const config = SERVICE_REGISTRY[requestType];

  const handleNextStep = async () => {
    const fieldsToValidate = config ? config.fields.map((field) => field.key) : [];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">
          {t("requests:wizard.serviceDetails.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.safetyRisk.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {config?.fields.map((field) => {
          const isFullWidth = field.type === "textarea" || field.type === "checkbox";
          const colClass = isFullWidth ? "sm:col-span-2" : "";

          if (field.type === "checkbox") {
            return (
              <div key={field.key} className={colClass}>
                <label className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-secondary/10 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(field.key)}
                    className="h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    {t(field.labelKey)}
                  </span>
                </label>
              </div>
            );
          }

          const hasError = errors[field.key];

          return (
            <div key={field.key} className={`space-y-1.5 flex flex-col justify-end ${colClass}`}>
              <Label className="mb-1 text-xs font-semibold text-foreground/80">
                {t(field.labelKey)}
                {field.required && <span className="text-destructive ms-0.5">*</span>}
              </Label>

              {field.type === "select" && (
                <Select {...register(field.key)}>
                  <option value="">{field.placeholderKey ? t(field.placeholderKey) : ""}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </Select>
              )}

              {field.type === "textarea" && (
                <Textarea
                  rows={3}
                  placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
                  {...register(field.key)}
                />
              )}

              {field.type !== "select" && field.type !== "textarea" && (
                <Input
                  type={field.type}
                  placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
                  {...register(field.key)}
                />
              )}

              {hasError && (
                <p className="text-[10px] text-destructive mt-1">
                  {hasError.message as string}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          {t("requests:wizard.buttons.previous")}
        </Button>
        <Button type="button" size="sm" onClick={handleNextStep}>
          {t("requests:wizard.safetyRisk.continueToDocuments")}
        </Button>
      </div>
    </div>
  );
}

export default SafetyRiskStep;
