"use client";

import React, { useMemo } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HardHat } from "lucide-react";
import { laborSchema, LaborFormValues } from "@/schemas/labor.schema";
import { computeLaborCost } from "@/domains/labor/workflow";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { LEGAL_CATEGORY_OPTIONS, legalCategoryLabelKey } from "../helpers/helpers";

interface LaborFormProps {
  onSubmit: (values: LaborFormValues) => Promise<unknown>;
  isSaving: boolean;
}

const DEFAULT_VALUES: LaborFormValues = {
  workerName: "",
  fieldRole: "",
  legalCategory: "internal",
  agreedWage: 0,
};

export function LaborForm({ onSubmit, isSaving }: LaborFormProps) {
  const { t, locale } = useTranslation();

  const form = useForm<LaborFormValues, unknown, LaborFormValues>({
    resolver: zodResolver(laborSchema) as Resolver<LaborFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  const legalCategory = form.watch("legalCategory");
  const agreedWage = form.watch("agreedWage") || 0;
  const isInternal = legalCategory === "internal";

  const costPreview = useMemo(
    () => computeLaborCost(legalCategory, agreedWage).toLocaleString(locale === "ar" ? "ar-SA" : "en-US"),
    [legalCategory, agreedWage, locale]
  );

  const handleLegalCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as LaborFormValues["legalCategory"];
    form.setValue("legalCategory", value, { shouldValidate: true });
    if (value === "internal") {
      form.setValue("agreedWage", 0, { shouldValidate: true });
    }
  };

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset(DEFAULT_VALUES);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <HardHat className="h-4 w-4 text-primary" />
          {t("labor:form.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="labor-worker-name">{t("labor:form.workerName")}</Label>
              <Input
                id="labor-worker-name"
                placeholder={t("labor:form.workerNamePlaceholder")}
                {...form.register("workerName")}
              />
              {form.formState.errors.workerName && (
                <p className="text-xs text-destructive">{t(form.formState.errors.workerName.message as string)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="labor-field-role">{t("labor:form.fieldRole")}</Label>
              <Input
                id="labor-field-role"
                placeholder={t("labor:form.fieldRolePlaceholder")}
                {...form.register("fieldRole")}
              />
              {form.formState.errors.fieldRole && (
                <p className="text-xs text-destructive">{t(form.formState.errors.fieldRole.message as string)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="labor-legal-category">{t("labor:form.legalCategory")}</Label>
              <Select id="labor-legal-category" {...form.register("legalCategory")} onChange={handleLegalCategoryChange}>
                {LEGAL_CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {t(legalCategoryLabelKey(category))}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="labor-agreed-wage">{t("labor:form.agreedWage")}</Label>
              <Input
                id="labor-agreed-wage"
                type="number"
                step="0.01"
                min="0"
                disabled={isInternal}
                {...form.register("agreedWage")}
              />
              {form.formState.errors.agreedWage && (
                <p className="text-xs text-destructive">{t(form.formState.errors.agreedWage.message as string)}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t("labor:form.costPreview")}</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{costPreview}</span>
          </div>

          <Button type="submit" disabled={isSaving} isLoading={isSaving}>
            {t("labor:form.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default LaborForm;
