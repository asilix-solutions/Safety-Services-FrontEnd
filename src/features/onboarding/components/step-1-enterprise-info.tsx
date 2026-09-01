"use client";

import React from "react";
import { Building2, ArrowRight } from "lucide-react";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { OnboardingStep1Values } from "@/schemas/onboarding.schema";
import { useSubdomainCheck } from "../hooks/use-subdomain-check";
import { SubdomainAvailabilityBadge } from "./subdomain-availability-badge";

interface Step1EnterpriseInfoProps {
  data: OnboardingStep1Values;
  onChange: (data: Partial<OnboardingStep1Values>) => void;
  onNext: () => void;
  errors: Partial<Record<keyof OnboardingStep1Values, string>>;
}

export function Step1EnterpriseInfo({ data, onChange, onNext, errors }: Step1EnterpriseInfoProps) {
  const { state, message, suggestions } = useSubdomainCheck(data.subdomain || "");

  const isSubdomainValid = state === "available";
  const canProceed =
    data.companyName?.trim().length >= 3 &&
    data.commercialRegistration?.length === 10 &&
    data.unifiedNumber700?.length === 10 &&
    data.unifiedNumber700?.startsWith("7") &&
    data.civilDefenseLicense?.trim().length >= 3 &&
    isSubdomainValid;

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground">
          <Building2 className="h-5 w-5 text-primary" />
          <span>بيانات المنشأة والترخيص الرسمي</span>
        </CardTitle>
        <CardDescription>
          أدخل البيانات النظامية المعتمدة لشركة أو مكتب استشارات السلامة الهندسية.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            اسم المنشأة / المكتب الهندسي الرسمي <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="مثال: شركة قمة السلامة للاستشارات الهندسية"
            value={data.companyName || ""}
            onChange={(e) => onChange({ companyName: e.target.value })}
            className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {errors.companyName && (
            <p className="text-xs text-destructive font-medium">{errors.companyName}</p>
          )}
        </div>

        {/* CR & Unified 700 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              رقم السجل التجاري (CR - 10 أرقام) <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="1010XXXXXX"
              value={data.commercialRegistration || ""}
              onChange={(e) => onChange({ commercialRegistration: e.target.value.replace(/[^0-9]/g, "") })}
              className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
            />
            {errors.commercialRegistration && (
              <p className="text-xs text-destructive font-medium">{errors.commercialRegistration}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              الرقم الموحد 700 (10 أرقام تبدأ بـ 7) <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="7001XXXXXX"
              value={data.unifiedNumber700 || ""}
              onChange={(e) => onChange({ unifiedNumber700: e.target.value.replace(/[^0-9]/g, "") })}
              className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
            />
            {errors.unifiedNumber700 && (
              <p className="text-xs text-destructive font-medium">{errors.unifiedNumber700}</p>
            )}
          </div>
        </div>

        {/* Civil Defense License */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            رقم ترخيص الدفاع المدني <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="CD-REG-88221"
            value={data.civilDefenseLicense || ""}
            onChange={(e) => onChange({ civilDefenseLicense: e.target.value })}
            className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
          />
          {errors.civilDefenseLicense && (
            <p className="text-xs text-destructive font-medium">{errors.civilDefenseLicense}</p>
          )}
        </div>

        {/* Subdomain Input with live check */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-foreground">
            النطاق الفرعي المخصص للبوابة (Subdomain) <span className="text-destructive">*</span>
          </label>
          <div
            className={`flex items-center rounded-lg border bg-background/50 overflow-hidden transition-colors ${
              state === "available"
                ? "border-emerald-500 ring-1 ring-emerald-500/30"
                : state === "unavailable" || state === "invalid"
                ? "border-destructive ring-1 ring-destructive/30"
                : "border-border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary"
            }`}
          >
            <input
              type="text"
              dir="ltr"
              placeholder="company-name"
              value={data.subdomain || ""}
              onChange={(e) =>
                onChange({
                  subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                })
              }
              className="w-full px-3.5 py-2.5 text-sm text-foreground bg-transparent focus:outline-none font-mono"
            />
            <span className="px-3 text-xs font-bold text-muted-foreground bg-secondary/60 py-2.5 border-s border-border select-none" dir="ltr">
              .sslm.sa
            </span>
          </div>

          <SubdomainAvailabilityBadge
            state={state}
            message={message}
            suggestions={suggestions}
            onSelectSuggestion={(sug) => onChange({ subdomain: sug })}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end border-t border-border/40 pt-4">
        <Button
          size="sm"
          className="gap-2 font-bold"
          disabled={!canProceed}
          onClick={onNext}
        >
          <span>التالي: الهوية البصرية</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </CardFooter>
    </>
  );
}
