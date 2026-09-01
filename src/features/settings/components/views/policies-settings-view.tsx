"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { policiesSettingsSchema, PoliciesSettingsFormValues } from "@/schemas/settings.schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Scale, Save, Receipt, DollarSign, CheckSquare } from "lucide-react";
import { toast } from "sonner";

export function PoliciesSettingsView() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<PoliciesSettingsFormValues>({
    resolver: zodResolver(policiesSettingsSchema),
    defaultValues: {
      zatcaTaxRate: 0.15,
      zatcaVatNumber: "300998822100003",
      zatcaPhase2Enabled: true,
      spendingCeilings: {
        salesAgentMaxDiscountPercent: 10,
        engineerMaxVariationApproval: 5000,
        companyAdminSpendingCeiling: 500000,
      },
      approvalHierarchy: {
        requireDualApprovalAboveSar: 100000,
        requireSuperAdminForContractTermination: true,
        autoAssignInspectionOnQuotationApproval: true,
      },
    },
  });

  const onSubmit = async (_data: PoliciesSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      toast.success("تم حفظ سياسات المنشأة والامتثال لـ ZATCA بنجاح!");
    } catch {
      toast.error("فشل حفظ السياسات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Scale className="h-4.5 w-4.5 text-primary" />
              <span>السياسات المالية والامتثال الضريبي (ZATCA Compliance)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              تهيئة نسبة ضريبة القيمة المضافة 15%، السقوف المالية للمبيعات، وسلسلة الاعتمادات.
            </CardDescription>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={!isDirty || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="gap-2 font-bold shadow-md shadow-primary/20"
          >
            <Save className="h-4 w-4" />
            <span>حفظ التغييرات</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ZATCA Tax Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/40 pb-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span>إعدادات الفوترة الإلكترونية وضريبة القيمة المضافة (ZATCA 15%)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">نسبة ضريبة القيمة المضافة</label>
                <input
                  type="number"
                  step="0.01"
                  readOnly
                  value={0.15}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono"
                />
                <span className="text-[10px] text-muted-foreground">ثابتة نظاماً بنسبة 15%</span>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">الرقم الضريبي ZATCA VAT (15 رقماً)</label>
                <input
                  type="text"
                  maxLength={15}
                  dir="ltr"
                  {...register("zatcaVatNumber")}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-start"
                />
                {errors.zatcaVatNumber && (
                  <p className="text-[11px] text-destructive">{errors.zatcaVatNumber.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="zatca-phase2"
                {...register("zatcaPhase2Enabled")}
                className="rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="zatca-phase2" className="text-xs text-foreground font-medium cursor-pointer select-none">
                تفعيل تكامل المرحلة الثانية (الربط والتكامل مع منصة فاتورة ZATCA Phase 2)
              </label>
            </div>
          </div>

          {/* Financial Spending Ceilings */}
          <div className="space-y-4 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/40 pb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>السقوف المالية والصلاحيات التقديرية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">أقصى خصم مسموح لمسؤول المبيعات (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  {...register("spendingCeilings.salesAgentMaxDiscountPercent", { valueAsNumber: true })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">سقف اعتماد أوامر التغيير للمهندس (ر.س)</label>
                <input
                  type="number"
                  min={0}
                  {...register("spendingCeilings.engineerMaxVariationApproval", { valueAsNumber: true })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">سقف العقود المباشرة لمدير المنشأة (ر.س)</label>
                <input
                  type="number"
                  min={0}
                  {...register("spendingCeilings.companyAdminSpendingCeiling", { valueAsNumber: true })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* Approval Hierarchy */}
          <div className="space-y-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/40 pb-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span>سلسلة الموافقات والاعتمادات الهندسية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  طلب اعتماد ثنائي (Dual Approval) للعقود التي تتجاوز (ر.س)
                </label>
                <input
                  type="number"
                  min={0}
                  {...register("approvalHierarchy.requireDualApprovalAboveSar", { valueAsNumber: true })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="auto-assign-insp"
                    {...register("approvalHierarchy.autoAssignInspectionOnQuotationApproval")}
                    className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="auto-assign-insp" className="text-xs text-foreground font-medium cursor-pointer select-none">
                    إسناد المعاينة الميدانية آلياً فور اعتماد عرض السعر
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
