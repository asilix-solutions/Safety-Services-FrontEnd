"use client";

import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { SERVICE_REGISTRY, FieldConfig, FieldOption } from "@/domains/requests/service-config";
import { RequestType } from "@/domains/requests/types";

interface SafetyRiskStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  /**
   * Rule gates from `workflow.ts#classifyRequest`. This step only reads them —
   * it never decides what opens or closes a gate (ADR-003).
   */
  instantReportAllowed: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function SafetyRiskStep({ form, instantReportAllowed, onNext, onPrev }: SafetyRiskStepProps) {
  const { t } = useTranslation();
  const { register, watch, trigger, setValue, formState: { errors } } = form;

  const requestType = watch("requestType") as RequestType;
  const config = SERVICE_REGISTRY[requestType];

  // FR-RUL-05 / UC-01.5: the client-declared hazard elements. Read here only to
  // decide whether to *explain* the consequence — the consequence itself is
  // decided by `workflow.ts#classifyRequest`, which reads the same three fields.
  const hasDeclaredHazard =
    watch("gasExtensions") === true ||
    watch("hazardousMaterials") === true ||
    watch("riskCategory") === "high";

  const isGateOpen = (option: FieldOption): boolean =>
    option.gate === "instantReportAllowed" ? instantReportAllowed : true;

  /** The blocked option currently selected for this field, if any. */
  const findBlockedSelection = (field: FieldConfig): FieldOption | undefined => {
    const selected = watch(field.key);
    return field.options?.find((option) => option.value === selected && !isGateOpen(option));
  };

  // A gate can close after the fact: the client picks "instant" here, steps back
  // to the facility step, and changes the activity or area to something the rules
  // classify as hazardous or oversized. Clear the now-forbidden choice and say why
  // — the field is required, so validation stops them until they pick again.
  useEffect(() => {
    if (instantReportAllowed || !config) return;

    for (const field of config.fields) {
      const blocked = findBlockedSelection(field);
      if (blocked) {
        setValue(field.key, undefined, { shouldValidate: false });
        toast.warning(t("requests:wizard.serviceDetails.reportTypeInstantCleared"));
      }
    }
  }, [instantReportAllowed, requestType]);

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

      {/*
        FR-RUL-05 hazard declaration. Common to every request type, so it lives
        here rather than being repeated across all four `SERVICE_REGISTRY`
        entries. These three fields are inputs to `classifyRequest` — this block
        only collects them, it never classifies (ADR-003).
      */}
      <fieldset className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
        <legend className="px-1 text-xs font-bold text-foreground">
          {t("requests:wizard.safetyRisk.declaredRisk")}
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-card hover:bg-secondary/10 transition-colors cursor-pointer">
            <Checkbox className="mt-0.5" {...register("gasExtensions")} />
            <span className="space-y-0.5">
              <span className="block text-xs font-semibold text-foreground">
                {t("requests:wizard.safetyRisk.gasTitle")}
              </span>
              <span className="block text-[10px] text-muted-foreground leading-relaxed">
                {t("requests:wizard.safetyRisk.gasDesc")}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-card hover:bg-secondary/10 transition-colors cursor-pointer">
            <Checkbox className="mt-0.5" {...register("hazardousMaterials")} />
            <span className="space-y-0.5">
              <span className="block text-xs font-semibold text-foreground">
                {t("requests:wizard.safetyRisk.hazardousTitle")}
              </span>
              <span className="block text-[10px] text-muted-foreground leading-relaxed">
                {t("requests:wizard.safetyRisk.hazardousDesc")}
              </span>
            </span>
          </label>
        </div>

        <div className="space-y-1.5 sm:max-w-xs">
          <Label htmlFor="riskCategory" className="text-xs font-semibold text-foreground/80">
            {t("requests:wizard.safetyRisk.declaredRisk")}
          </Label>
          <Select id="riskCategory" {...register("riskCategory")}>
            <option value="low">{t("requests:wizard.safetyRisk.riskLow")}</option>
            <option value="medium">{t("requests:wizard.safetyRisk.riskMedium")}</option>
            <option value="high">{t("requests:wizard.safetyRisk.riskHigh")}</option>
          </Select>
        </div>

        {hasDeclaredHazard && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {t("requests:wizard.safetyRisk.hazardWarningTitle")}
              </p>
              <p className="text-[10px] leading-relaxed text-amber-700/90 dark:text-amber-400/90">
                {t("requests:wizard.safetyRisk.hazardWarningDesc")}
              </p>
            </div>
          </div>
        )}
      </fieldset>

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
          const blockedOptions = (field.options ?? []).filter((opt) => !isGateOpen(opt));

          return (
            <div key={field.key} className={`space-y-1.5 flex flex-col justify-end ${colClass}`}>
              <Label className="mb-1 text-xs font-semibold text-foreground/80">
                {t(field.labelKey)}
                {field.required && <span className="text-destructive ms-0.5">*</span>}
              </Label>

              {field.type === "select" && (
                <Select {...register(field.key)}>
                  <option value="">{field.placeholderKey ? t(field.placeholderKey) : ""}</option>
                  {field.options?.map((opt) => {
                    const blocked = !isGateOpen(opt);
                    return (
                      <option key={opt.value} value={opt.value} disabled={blocked}>
                        {t(opt.labelKey)}
                        {blocked && ` — ${t("requests:wizard.serviceDetails.reportTypeInstantUnavailableSuffix")}`}
                      </option>
                    );
                  })}
                </Select>
              )}

              {blockedOptions.map((opt) => (
                <p
                  key={opt.value}
                  className="flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed mt-1"
                >
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>{opt.gateBlockedReasonKey ? t(opt.gateBlockedReasonKey) : ""}</span>
                </p>
              ))}

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
