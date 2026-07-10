"use client";

import React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ShieldAlert, TriangleAlert } from "lucide-react";
import { closureSchema, ClosureFormValues } from "@/schemas/closure.schema";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { SignatureCapture } from "./signature-capture";

interface ClosureFormProps {
  onSubmit: (values: ClosureFormValues) => Promise<unknown>;
  isSaving: boolean;
  saveError: Error | null;
}

const DEFAULT_VALUES: ClosureFormValues = {
  signatureImage: "",
  method: "canvas",
  signedBy: "",
};

export function ClosureForm({ onSubmit, isSaving, saveError }: ClosureFormProps) {
  const { t } = useTranslation();

  const form = useForm<ClosureFormValues, unknown, ClosureFormValues>({
    resolver: zodResolver(closureSchema) as Resolver<ClosureFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  const signatureImage = form.watch("signatureImage");
  const method = form.watch("method");

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          {t("closure:form.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
            <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" />
            {t("closure:form.mandatoryHint")}
          </div>

          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="closure-signed-by">{t("closure:form.signedBy")}</Label>
            <Input
              id="closure-signed-by"
              placeholder={t("closure:form.signedByPlaceholder")}
              {...form.register("signedBy")}
            />
            {form.formState.errors.signedBy && (
              <p className="text-xs text-destructive">{t(form.formState.errors.signedBy.message as string)}</p>
            )}
          </div>

          <SignatureCapture
            value={signatureImage}
            method={method}
            onChange={(value, nextMethod) => {
              form.setValue("signatureImage", value, { shouldValidate: true });
              form.setValue("method", nextMethod, { shouldValidate: true });
            }}
            error={form.formState.errors.signatureImage ? t(form.formState.errors.signatureImage.message as string) : undefined}
          />

          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            {t("closure:form.irreversibleWarning")}
          </div>

          {saveError && (
            <p className="text-xs font-semibold text-destructive">{t("closure:form.saveFailed")}</p>
          )}

          <Button type="submit" disabled={isSaving || !signatureImage} isLoading={isSaving}>
            {t("closure:form.close")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ClosureForm;
