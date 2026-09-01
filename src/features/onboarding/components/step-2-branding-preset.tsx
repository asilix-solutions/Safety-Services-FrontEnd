"use client";

import React from "react";
import { Palette, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { OnboardingStep2Values } from "@/schemas/onboarding.schema";
import { THEME_PRESETS } from "@/constants/themes";

interface Step2BrandingPresetProps {
  data: OnboardingStep2Values;
  onChange: (data: Partial<OnboardingStep2Values>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step2BrandingPreset({ data, onChange, onNext, onPrev }: Step2BrandingPresetProps) {
  const selectedPreset = THEME_PRESETS.find((p) => p.id === data.presetId) || THEME_PRESETS[0];

  const handleSelectPreset = (preset: typeof THEME_PRESETS[number]) => {
    onChange({
      presetId: preset.id,
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      accentColor: preset.colors.accent,
    });
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground">
          <Palette className="h-5 w-5 text-primary" />
          <span>تخصيص الهوية البصرية (White-Label Branding)</span>
        </CardTitle>
        <CardDescription>
          اختر النسق اللوني الافتراضي لبوابة الشركة ولوحة التحكم الخاصة بفريق العمل والعملاء.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {THEME_PRESETS.map((preset) => {
            const isSelected = (data.presetId || "royal-indigo") === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/40"
                    : "border-border/60 bg-secondary/30 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-border shrink-0"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <span className="text-xs font-bold text-foreground">{preset.name}</span>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground">{preset.description}</p>

                {/* Color Swatch Preview */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div
                    className="h-3 flex-1 rounded-sm"
                    style={{ backgroundColor: preset.colors.primary }}
                    title="Primary"
                  />
                  <div
                    className="h-3 flex-1 rounded-sm"
                    style={{ backgroundColor: preset.colors.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="h-3 flex-1 rounded-sm"
                    style={{ backgroundColor: preset.colors.accent }}
                    title="Accent"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Preview Box */}
        <div className="p-4 rounded-xl border border-border/80 bg-secondary/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">معاينة الهوية المحددة:</span>
            <span className="font-bold text-primary">{selectedPreset.name}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            سيتم تفعيل هذه الألوان آلياً في شريط التنقل، الأزرار، والبطاقات التحليلية داخل مساحة عملك.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border/40 pt-4">
        <Button variant="ghost" size="sm" onClick={onPrev} className="gap-1.5">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>السابق</span>
        </Button>

        <Button size="sm" className="gap-2 font-bold" onClick={onNext}>
          <span>التالي: حساب المدير</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </CardFooter>
    </>
  );
}
