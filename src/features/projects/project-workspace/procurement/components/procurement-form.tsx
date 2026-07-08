"use client";

import React, { useMemo } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCart } from "lucide-react";
import { procurementSchema, ProcurementFormValues } from "@/schemas/procurement.schema";
import { computeProcurementVat } from "@/domains/procurement/workflow";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { CameraCapture } from "@/shared/components/camera-capture";
import { VatBreakdownCard } from "./vat-breakdown";
import { SILO_TAG_OPTIONS, INVOICE_TYPE_OPTIONS, siloLabelKey, invoiceTypeLabelKey } from "../helpers/helpers";

interface ProcurementFormProps {
  onSubmit: (values: ProcurementFormValues) => Promise<unknown>;
  isSaving: boolean;
}

const DEFAULT_VALUES: ProcurementFormValues = {
  supplierName: "",
  siloTag: "alarm",
  invoiceType: "taxable",
  preTaxValue: 0,
  receiptImage: "",
};

export function ProcurementForm({ onSubmit, isSaving }: ProcurementFormProps) {
  const { t } = useTranslation();

  const form = useForm<ProcurementFormValues, unknown, ProcurementFormValues>({
    resolver: zodResolver(procurementSchema) as Resolver<ProcurementFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  const invoiceType = form.watch("invoiceType");
  const preTaxValue = form.watch("preTaxValue") || 0;
  const receiptImage = form.watch("receiptImage");

  const preview = useMemo(
    () => computeProcurementVat(preTaxValue, invoiceType),
    [preTaxValue, invoiceType]
  );

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset(DEFAULT_VALUES);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          {t("procurement:form.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="procurement-supplier-name">{t("procurement:form.supplierName")}</Label>
              <Input
                id="procurement-supplier-name"
                placeholder={t("procurement:form.supplierNamePlaceholder")}
                {...form.register("supplierName")}
              />
              {form.formState.errors.supplierName && (
                <p className="text-xs text-destructive">{t(form.formState.errors.supplierName.message as string)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="procurement-silo">{t("procurement:form.silo")}</Label>
              <Select id="procurement-silo" {...form.register("siloTag")}>
                {SILO_TAG_OPTIONS.map((silo) => (
                  <option key={silo} value={silo}>
                    {t(siloLabelKey(silo))}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="procurement-invoice-type">{t("procurement:form.invoiceType")}</Label>
              <Select id="procurement-invoice-type" {...form.register("invoiceType")}>
                {INVOICE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {t(invoiceTypeLabelKey(type))}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="procurement-pretax-value">{t("procurement:form.preTaxValue")}</Label>
              <Input
                id="procurement-pretax-value"
                type="number"
                step="0.01"
                min="0"
                {...form.register("preTaxValue")}
              />
              {form.formState.errors.preTaxValue && (
                <p className="text-xs text-destructive">{t(form.formState.errors.preTaxValue.message as string)}</p>
              )}
            </div>
          </div>

          <VatBreakdownCard breakdown={preview} />

          <div className="space-y-1.5">
            <Label>{t("procurement:form.receiptPhoto")}</Label>
            <CameraCapture
              value={receiptImage}
              onChange={(base64) => form.setValue("receiptImage", base64, { shouldValidate: true })}
              error={
                form.formState.errors.receiptImage
                  ? t(form.formState.errors.receiptImage.message as string)
                  : undefined
              }
            />
          </div>

          <Button type="submit" disabled={isSaving || !receiptImage} isLoading={isSaving}>
            {t("procurement:form.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProcurementForm;
