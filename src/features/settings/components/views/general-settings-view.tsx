"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generalSettingsSchema, GeneralSettingsFormValues } from "@/schemas/settings.schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Sliders, Save, Palette, Sparkles, Paintbrush } from "lucide-react";
import { toast } from "sonner";
import { ThemePickerModal } from "@/shared/components/modals/theme-picker-modal";
import { ThemePreset, getThemePresetById } from "@/constants/themes";
import { applyTenantTheme } from "@/lib/theme-utils";
import { getBranding, saveBranding } from "@/domains/settings";
import { useAuth } from "@/providers/AuthProvider";

export function GeneralSettingsView() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const [activePreset, setActivePreset] = useState<ThemePreset>(() => {
    const branding = getBranding(user?.tenantId);
    return getThemePresetById(branding?.presetId);
  });

  useEffect(() => {
    const branding = getBranding(user?.tenantId);
    if (branding?.presetId) {
      setActivePreset(getThemePresetById(branding.presetId));
    }
  }, [user?.tenantId]);

  const handleSelectTheme = (selectedTheme: ThemePreset) => {
    setActivePreset(selectedTheme);
    applyTenantTheme(
      selectedTheme.colors.primary,
      selectedTheme.colors.primaryForeground || "#ffffff"
    );

    const currentBranding = getBranding(user?.tenantId);
    const updatedBranding = {
      ...currentBranding,
      presetId: selectedTheme.id,
      primaryColor: selectedTheme.colors.primary,
      primaryForeground: selectedTheme.colors.primaryForeground || "#ffffff",
      secondaryColor: selectedTheme.colors.secondary,
      accentColor: selectedTheme.colors.accent,
      darkModeOverrides: selectedTheme.darkModeOverrides,
      isCustom: false,
    };
    saveBranding(updatedBranding, user?.tenantId);
    toast.success(`تم تطبيق قالب "${selectedTheme.name}" بنجاح!`);
    setIsThemeModalOpen(false);
  };

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      workspaceName: "شركة فيرتكس لاستشارات السلامة الهندسية",
      workspaceShortName: "VERTEX",
      defaultLanguage: "ar",
      fallbackLanguage: "en",
      timezone: "Asia/Riyadh",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      defaultPageSize: 25,
      allowPublicRegistration: false,
    },
  });

  const onSubmit = async (_data: GeneralSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      toast.success("تم حفظ الإعدادات العامة بنجاح!");
    } catch {
      toast.error("فشل حفظ الإعدادات العامة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Sliders className="h-4.5 w-4.5 text-primary" />
                <span>الإعدادات العامة لمساحة العمل</span>
              </CardTitle>
              <CardDescription className="text-xs">
                تحديد هوية المنشأة، اللغة الافتراضية، المنطقة الزمنية وصيغ العرض.
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

        <CardContent className="pt-6 space-y-6">
          {/* Brand Identity & Theme Preset Section */}
          <div className="space-y-3 pb-6 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">
                    الهوية البصرية وقالب الألوان (Brand Identity & Theme Preset)
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  تحديد السمة اللونية وقالب الواجهة المعتمد لمنشأتك، بما يتوافق مع معايير الوصول العالمية WCAG 2.1.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsThemeModalOpen(true)}
                className="gap-2 text-xs font-semibold hover:border-primary/50 hover:bg-primary/5 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Paintbrush className="h-3.5 w-3.5 text-primary" />
                <span>تغيير قالب الألوان (Curated Presets)</span>
              </Button>
            </div>

            {/* Active Preset Preview Card */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-background/50 hover:border-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Color Swatch Preview */}
                <div
                  className="w-10 h-10 rounded-lg shadow-sm border border-black/10 flex items-center justify-center text-white shrink-0 relative overflow-hidden"
                  style={{ backgroundColor: activePreset.colors.primary }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: activePreset.colors.primaryForeground || "#ffffff" }} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">{activePreset.name}</span>
                    <Badge variant="outline" className="text-[10px] font-medium py-0 px-2 bg-primary/10 border-primary/30 text-primary">
                      {activePreset.industry}
                    </Badge>
                    <Badge
                      className="text-[10px] font-mono py-0 px-2 flex items-center gap-1 border-0"
                      style={{
                        backgroundColor: activePreset.colors.primary,
                        color: activePreset.colors.primaryForeground || "#ffffff",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {activePreset.colors.primary.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {activePreset.description}
                  </p>
                </div>
              </div>

              {/* Secondary Palette Tokens Quick View */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
                  <span>الثانوي:</span>
                  <span
                    className="w-3 h-3 rounded-full border border-border/80"
                    style={{ backgroundColor: activePreset.colors.secondary }}
                    title={`Secondary: ${activePreset.colors.secondary}`}
                  />
                  <span className="ms-1">التمييز:</span>
                  <span
                    className="w-3 h-3 rounded-full border border-border/80"
                    style={{ backgroundColor: activePreset.colors.accent }}
                    title={`Accent: ${activePreset.colors.accent}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">اسم مساحة العمل الرسمي</label>
                <input
                  type="text"
                  {...register("workspaceName")}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.workspaceName && (
                  <p className="text-[11px] text-destructive">{errors.workspaceName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">الاسم المختصر (Short Name)</label>
                <input
                  type="text"
                  {...register("workspaceShortName")}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                />
                {errors.workspaceShortName && (
                  <p className="text-[11px] text-destructive">{errors.workspaceShortName.message}</p>
                )}
              </div>
            </div>

            {/* Localization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/30">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">اللغة الافتراضية</label>
                <select
                  {...register("defaultLanguage")}
                  className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="ar">العربية (RTL - الافتراضية)</option>
                  <option value="en">English (LTR)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">المنطقة الزمنية</label>
                <select
                  {...register("timezone")}
                  className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-mono"
                >
                  <option value="Asia/Riyadh">توقيت الرياض (UTC+3)</option>
                  <option value="Asia/Dubai">توقيت دبي (UTC+4)</option>
                  <option value="UTC">توقيت غرينتش (UTC)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">صيغة التاريخ</label>
                <select
                  {...register("dateFormat")}
                  className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-mono"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (يوم/شهر/سنة)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </div>

            {/* Table display & Registration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/30">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">عدد السجلات الافتراضي في الجداول</label>
                <select
                  {...register("defaultPageSize", { valueAsNumber: true })}
                  className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="10">10 سجلات لكل صفحة</option>
                  <option value="25">25 سجل لكل صفحة</option>
                  <option value="50">50 سجل لكل صفحة</option>
                  <option value="100">100 سجل لكل صفحة</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="allow-public-reg"
                  {...register("allowPublicRegistration")}
                  className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="allow-public-reg" className="text-xs text-foreground font-medium cursor-pointer select-none">
                  السماح للعملاء بإنشاء طلبات ترخيص جديدة عبر الرابط العام
                </label>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Theme Picker Modal */}
      <ThemePickerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onSelect={handleSelectTheme}
        currentThemeId={activePreset.id}
      />
    </>
  );
}
