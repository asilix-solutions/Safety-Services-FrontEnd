"use client";

import React, { useEffect, useState } from "react";
import { SchemaFormRenderer } from "@/components/forms/schema-form-renderer";
import { workflowsApi, WorkflowTemplateDetailDto } from "@/domains/workflows/api";
import { BackendServiceCategory } from "@/domains/requests/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Layers, Sparkles } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

interface DynamicIntakeFieldsProps {
  serviceCategory: BackendServiceCategory;
  value: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  readOnly?: boolean;
}

export function DynamicIntakeFields({
  serviceCategory,
  value,
  onChange,
  readOnly = false,
}: DynamicIntakeFieldsProps) {
  const { t } = useTranslation();
  const [template, setTemplate] = useState<WorkflowTemplateDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [schemaJson, setSchemaJson] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    workflowsApi
      .getDefaultTemplateForCategory(serviceCategory)
      .then((tpl) => {
        if (!isMounted) return;
        setTemplate(tpl);
        if (tpl && tpl.steps.length > 0) {
          const intakeStep = tpl.steps.find((s) => s.stepCode.toUpperCase().includes("INTAKE")) || tpl.steps[0];
          if (intakeStep && intakeStep.formSchemaJson) {
            setSchemaJson(intakeStep.formSchemaJson);
          } else {
            setSchemaJson(null);
          }
        } else {
          setSchemaJson(null);
        }
      })
      .catch((err) => {
        console.warn("Failed to load workflow template schema:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [serviceCategory]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
        <p className="text-xs text-muted-foreground animate-pulse">
          {t("common:loading") || "جاري فحص المخطط الديناميكي لمسار الخدمة..."}
        </p>
      </div>
    );
  }

  // If no schema or empty, do not render
  if (!schemaJson) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/[0.02] shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Layers className="h-4 w-4 text-primary" />
            <span>{t("requests:wizard.dynamicForm.title") || "متطلبات النموذج الديناميكي"}</span>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 me-1 text-primary inline" />
              {template?.nameAr || "قالب سير العمل"}
            </Badge>
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.dynamicForm.description") ||
            "حقول إضافية تم تحديدها آلياً بواسطة محرك سير العمل لضمان استيفاء معايير الفحص الهندسي."}
        </p>
      </CardHeader>
      <CardContent>
        <SchemaFormRenderer
          schemaJson={schemaJson}
          defaultValues={value}
          onChange={onChange}
          readOnly={readOnly}
          className="space-y-4"
        />
      </CardContent>
    </Card>
  );
}

export default DynamicIntakeFields;
