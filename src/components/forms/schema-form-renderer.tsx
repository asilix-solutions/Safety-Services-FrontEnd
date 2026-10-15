"use client";

import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { AlertCircle, UploadCloud, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "date"
  | "checkbox"
  | "radio"
  | "file";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldCondition {
  field: string;
  operator?: "equals" | "notEquals" | "in" | "contains";
  value: any;
}

export interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  options?: FieldOption[];
  defaultValue?: any;
  colSpan?: 1 | 2 | 3;
  condition?: FieldCondition;
}

export interface SchemaFormDefinition {
  title?: string;
  description?: string;
  fields: SchemaField[];
}

export interface SchemaFormRendererProps {
  schemaJson?: string | SchemaFormDefinition;
  defaultValues?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onChange?: (data: Record<string, any>) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  readOnly?: boolean;
  className?: string;
}

/**
 * Enterprise Dynamic JSON Schema Form Renderer.
 * Consumes backend JSON schemas and renders responsive, validated,
 * accessible form controls with dynamic field dependencies.
 */
export function SchemaFormRenderer({
  schemaJson,
  defaultValues = {},
  onSubmit,
  onChange,
  isSubmitting = false,
  submitButtonText = "حفظ ومتابعة",
  readOnly = false,
  className,
}: SchemaFormRendererProps) {
  // Parse incoming JSON schema or fallback to default
  const parsedSchema: SchemaFormDefinition = useMemo(() => {
    if (!schemaJson) return { fields: [] };
    if (typeof schemaJson === "object") return schemaJson;
    try {
      const parsed = JSON.parse(schemaJson);
      if (Array.isArray(parsed.fields)) return parsed;
      // Handle standard JSON Schema { properties: { ... }, required: [...] }
      if (parsed.properties) {
        const fields: SchemaField[] = Object.entries(parsed.properties).map(
          ([key, val]: [string, any]) => ({
            name: key,
            label: val.title || key,
            type:
              val.type === "number" || val.type === "integer"
                ? "number"
                : val.type === "boolean"
                ? "checkbox"
                : val.enum
                ? "select"
                : "text",
            options: val.enum
              ? val.enum.map((opt: any) => ({ label: String(opt), value: opt }))
              : undefined,
            required: Array.isArray(parsed.required) && parsed.required.includes(key),
            placeholder: val.description,
            helperText: val.description,
          })
        );
        return { fields, title: parsed.title, description: parsed.description };
      }
      return { fields: [] };
    } catch {
      return { fields: [] };
    }
  }, [schemaJson]);

  // Compute form initial default values
  const computedDefaults = useMemo(() => {
    const defaults: Record<string, any> = { ...defaultValues };
    parsedSchema.fields.forEach((field) => {
      if (defaults[field.name] === undefined && field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });
    return defaults;
  }, [parsedSchema, defaultValues]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: computedDefaults,
  });

  const watchedValues = watch();

  // Notify parent on changes if callback provided
  React.useEffect(() => {
    if (onChange) {
      onChange(watchedValues);
    }
  }, [watchedValues, onChange]);

  // Evaluate conditional visibility for dynamic dependencies
  const isFieldVisible = (field: SchemaField): boolean => {
    if (!field.condition) return true;
    const { field: targetFieldName, operator = "equals", value: targetValue } = field.condition;
    const currentVal = watchedValues[targetFieldName];

    switch (operator) {
      case "equals":
        return currentVal === targetValue;
      case "notEquals":
        return currentVal !== targetValue;
      case "in":
        return Array.isArray(targetValue) && targetValue.includes(currentVal);
      case "contains":
        return Array.isArray(currentVal) && currentVal.includes(targetValue);
      default:
        return true;
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  if (!parsedSchema.fields || parsedSchema.fields.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/20 p-6 text-center">
        <p className="text-xs text-muted-foreground">
          لا توجد حقول ديناميكية محددة لهذا النموذج. يمكنك المتابعة للخطوة التالية.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn("space-y-6", className)}>
      {parsedSchema.title && (
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-sm font-semibold text-foreground">{parsedSchema.title}</h3>
          {parsedSchema.description && (
            <p className="mt-1 text-xs text-muted-foreground">{parsedSchema.description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parsedSchema.fields.map((field) => {
          if (!isFieldVisible(field)) return null;

          const colSpanClass =
            field.colSpan === 3
              ? "md:col-span-2 lg:col-span-3"
              : field.colSpan === 2
              ? "md:col-span-2"
              : "col-span-1";

          const error = errors[field.name];

          return (
            <div key={field.name} className={cn("space-y-1.5", colSpanClass)}>
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-xs font-medium text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive mr-1">*</span>}
                </Label>
                {field.helperText && (
                  <span className="text-[10px] text-muted-foreground">{field.helperText}</span>
                )}
              </div>

              {/* Render field control based on type */}
              {field.type === "text" && (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  disabled={readOnly || isSubmitting}
                  {...register(field.name, {
                    required: field.required ? "هذا الحقل مطلوب" : false,
                    minLength: field.minLength
                      ? { value: field.minLength, message: `الحد الأدنى ${field.minLength} حروف` }
                      : undefined,
                    maxLength: field.maxLength
                      ? { value: field.maxLength, message: `الحد الأقصى ${field.maxLength} حروف` }
                      : undefined,
                  })}
                />
              )}

              {field.type === "number" && (
                <Input
                  id={field.name}
                  type="number"
                  placeholder={field.placeholder}
                  disabled={readOnly || isSubmitting}
                  {...register(field.name, {
                    required: field.required ? "هذا الحقل مطلوب" : false,
                    min: field.min
                      ? { value: field.min, message: `الحد الأدنى هو ${field.min}` }
                      : undefined,
                    max: field.max
                      ? { value: field.max, message: `الحد الأقصى هو ${field.max}` }
                      : undefined,
                    valueAsNumber: true,
                  })}
                />
              )}

              {field.type === "date" && (
                <Input
                  id={field.name}
                  type="date"
                  disabled={readOnly || isSubmitting}
                  {...register(field.name, {
                    required: field.required ? "هذا الحقل مطلوب" : false,
                  })}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  rows={3}
                  placeholder={field.placeholder}
                  disabled={readOnly || isSubmitting}
                  {...register(field.name, {
                    required: field.required ? "هذا الحقل مطلوب" : false,
                  })}
                />
              )}

              {field.type === "select" && (
                <Select
                  id={field.name}
                  disabled={readOnly || isSubmitting}
                  {...register(field.name, {
                    required: field.required ? "هذا الحقل مطلوب" : false,
                  })}
                >
                  <option value="">{field.placeholder || "اختر من القائمة..."}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              )}

              {field.type === "checkbox" && (
                <div className="flex items-center gap-2 pt-1.5">
                  <Controller
                    name={field.name}
                    control={control}
                    rules={{ required: field.required ? "هذا الاختيار مطلوب" : false }}
                    render={({ field: ctrlField }) => (
                      <Checkbox
                        id={field.name}
                        checked={Boolean(ctrlField.value)}
                        onChange={(e) => ctrlField.onChange(e.target.checked)}
                        disabled={readOnly || isSubmitting}
                      />
                    )}
                  />
                  <label
                    htmlFor={field.name}
                    className="text-xs text-foreground/80 cursor-pointer select-none"
                  >
                    {field.placeholder || field.label}
                  </label>
                </div>
              )}

              {field.type === "file" && (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3 bg-card hover:bg-muted/10 transition-colors">
                  <UploadCloud className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      id={field.name}
                      type="file"
                      disabled={readOnly || isSubmitting}
                      className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                      {...register(field.name, {
                        required: field.required ? "يرجى إرفاق الملف المطلوب" : false,
                      })}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      PDF, PNG, JPG أو DWG (الحد الأقصى: 10 ميجابايت)
                    </p>
                  </div>
                </div>
              )}

              {/* Validation Error Message */}
              {error && (
                <div className="flex items-center gap-1 text-[11px] text-destructive pt-0.5">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span>{String(error.message)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!readOnly && onSubmit && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                جاري المعالجة...
              </span>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
