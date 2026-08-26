"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { BrandingSettings } from "@/domains/settings/types";
import { THEME_PRESETS, ThemePreset } from "@/constants/themes";
import { evaluateWcagCompliance, getContrastForeground } from "@/lib/theme-utils";
import { Check, Sparkles, Sliders, ShieldCheck, AlertTriangle, Eye, Palette } from "lucide-react";

interface BrandingTabProps {
  draft: BrandingSettings | null;
  setDraft: React.Dispatch<React.SetStateAction<BrandingSettings | null>>;
  errors: Record<string, string>;
  isEditable: boolean;
  companyShortName: string;
  t: (key: string) => string;
}

export function BrandingTab({
  draft,
  setDraft,
  errors,
  isEditable,
  companyShortName,
  t
}: BrandingTabProps) {
  const [activeMode, setActiveMode] = useState<"presets" | "custom">(() => {
    return draft?.isCustom ? "custom" : "presets";
  });

  const handleChange = (field: keyof BrandingSettings, value: string) => {
    setDraft((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
        isCustom: true,
      };
    });
  };

  const handleSelectPreset = (preset: ThemePreset) => {
    setDraft((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        presetId: preset.id,
        primaryColor: preset.colors.primary,
        primaryForeground: preset.colors.primaryForeground || "#ffffff",
        secondaryColor: preset.colors.secondary,
        accentColor: preset.colors.accent,
        darkModeOverrides: preset.darkModeOverrides,
        isCustom: false,
      };
    });
  };

  const primaryColor = draft?.primaryColor || "#4f46e5";
  const secondaryColor = draft?.secondaryColor || "#0f172a";

  // WCAG Relative Luminance Compliance computation for primary color
  const wcagResult = useMemo(() => {
    return evaluateWcagCompliance(primaryColor);
  }, [primaryColor]);

  // Derived button text color for preview
  const primaryFgColor = useMemo(() => {
    return getContrastForeground(primaryColor);
  }, [primaryColor]);

  const secondaryFgColor = useMemo(() => {
    return getContrastForeground(secondaryColor);
  }, [secondaryColor]);

  if (!draft) return null;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                {t("settings:tab_branding") || "Branding & Theme Presets"}
              </CardTitle>
              <CardDescription>
                {t("settings:branding_desc") || "Select a curated safety enterprise theme or configure custom corporate branding tokens."}
              </CardDescription>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/80 self-start">
              <button
                type="button"
                onClick={() => {
                  setActiveMode("presets");
                  setDraft((prev) => prev ? { ...prev, isCustom: false } : null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeMode === "presets"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Curated Presets
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode("custom");
                  setDraft((prev) => prev ? { ...prev, isCustom: true } : null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeMode === "custom"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                Custom HEX
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Section 1: Curated Presets Cards */}
          {activeMode === "presets" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Enterprise Safety Presets (5 Curated Palettes)
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Tested for full WCAG 2.1 AA/AAA compliance in Light & Dark modes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = draft.presetId === preset.id && !draft.isCustom;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => isEditable && handleSelectPreset(preset)}
                      className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs"
                          : "border-border hover:border-primary/50 hover:bg-muted/30 bg-card"
                      } ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                          {preset.industry}
                        </p>
                      </div>

                      {/* Swatch Strip */}
                      <div className="pt-3 space-y-1.5">
                        <div className="flex h-4 w-full rounded-md overflow-hidden border border-border/80 shadow-xs">
                          <div
                            style={{ backgroundColor: preset.colors.primary }}
                            className="flex-1"
                            title={`Primary: ${preset.colors.primary}`}
                          />
                          <div
                            style={{ backgroundColor: preset.colors.secondary }}
                            className="w-1/3"
                            title={`Secondary: ${preset.colors.secondary}`}
                          />
                          <div
                            style={{ backgroundColor: preset.colors.accent }}
                            className="w-1/4"
                            title={`Accent: ${preset.colors.accent}`}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                          <span>{preset.colors.primary}</span>
                          <span className="text-[8px] opacity-75">AAA</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Color Configuration & Live Sandbox Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Color Inputs & WCAG Verification Panel (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Active Palette Tokens
                </Label>

                {/* Primary Color Input */}
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      {t("settings:lbl_primaryColor") || "Primary Theme Color"}
                    </Label>
                    {/* Real-time WCAG Badge */}
                    <div className="flex items-center gap-1">
                      {wcagResult.level === "FAIL" ? (
                        <Badge variant="destructive" className="text-[10px] h-5 py-0 px-1.5 gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {wcagResult.contrastRatio}:1 Fail
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px] h-5 py-0 px-1.5 gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {wcagResult.contrastRatio}:1 {wcagResult.level} Pass
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draft.primaryColor.startsWith("#") ? draft.primaryColor : "#4f46e5"}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      disabled={!isEditable}
                      className="h-8 w-8 rounded-lg border border-border cursor-pointer bg-transparent shrink-0"
                    />
                    <Input
                      value={draft.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      disabled={!isEditable}
                      className="text-xs h-8 bg-background font-mono flex-1"
                      placeholder="#4f46e5"
                    />
                  </div>
                  {errors.primaryColor && (
                    <p className="text-[10px] text-destructive">{t(`settings:${errors.primaryColor}`)}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Foreground contrast auto-evaluates to:{" "}
                    <span className="font-semibold text-foreground">
                      {wcagResult.isDarkForeground ? "Dark Slate (#020817)" : "Pure White (#FFFFFF)"}
                    </span>
                  </p>
                </div>

                {/* Secondary & Accent Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1.5">
                    <Label className="text-[11px] font-semibold block">
                      {t("settings:lbl_secondaryColor") || "Secondary"}
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={draft.secondaryColor.startsWith("#") ? draft.secondaryColor : "#0f172a"}
                        onChange={(e) => handleChange("secondaryColor", e.target.value)}
                        disabled={!isEditable}
                        className="h-7 w-7 rounded border border-border cursor-pointer bg-transparent shrink-0"
                      />
                      <Input
                        value={draft.secondaryColor}
                        onChange={(e) => handleChange("secondaryColor", e.target.value)}
                        disabled={!isEditable}
                        className="text-[11px] h-7 px-2 bg-background font-mono"
                        placeholder="#0f172a"
                      />
                    </div>
                    {errors.secondaryColor && (
                      <p className="text-[9px] text-destructive">{t(`settings:${errors.secondaryColor}`)}</p>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1.5">
                    <Label className="text-[11px] font-semibold block">
                      {t("settings:lbl_accentColor") || "Accent Color"}
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={draft.accentColor.startsWith("#") ? draft.accentColor : "#f59e0b"}
                        onChange={(e) => handleChange("accentColor", e.target.value)}
                        disabled={!isEditable}
                        className="h-7 w-7 rounded border border-border cursor-pointer bg-transparent shrink-0"
                      />
                      <Input
                        value={draft.accentColor}
                        onChange={(e) => handleChange("accentColor", e.target.value)}
                        disabled={!isEditable}
                        className="text-[11px] h-7 px-2 bg-background font-mono"
                        placeholder="#f59e0b"
                      />
                    </div>
                    {errors.accentColor && (
                      <p className="text-[9px] text-destructive">{t(`settings:${errors.accentColor}`)}</p>
                    )}
                  </div>
                </div>

                {/* Logo Assets Configuration */}
                <div className="pt-2 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">{t("settings:lbl_logoUrl") || "Light Logo URL"}</Label>
                    <Input
                      value={draft.logoUrl || ""}
                      onChange={(e) => handleChange("logoUrl", e.target.value)}
                      disabled={!isEditable}
                      className="text-xs h-8 bg-background"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">{t("settings:lbl_logoDarkUrl") || "Dark Mode Logo URL"}</Label>
                    <Input
                      value={draft.logoDarkUrl || ""}
                      onChange={(e) => handleChange("logoDarkUrl", e.target.value)}
                      disabled={!isEditable}
                      className="text-xs h-8 bg-background"
                      placeholder="https://example.com/logo-dark.png"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Sandbox Preview (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="border border-border/90 rounded-xl p-4 bg-muted/10 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      Live Workspace Sandbox Preview
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Simulating Active Workspace
                    </span>
                  </div>

                  {/* Simulated App Header */}
                  <div
                    style={{ backgroundColor: draft.secondaryColor, color: secondaryFgColor }}
                    className="p-3.5 rounded-lg flex items-center justify-between border border-border/40 shadow-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {draft.logoUrl ? (
                        <div className="h-7 w-7 rounded bg-white/10 p-0.5 flex items-center justify-center overflow-hidden">
                          <img src={draft.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div
                          style={{ backgroundColor: draft.primaryColor, color: primaryFgColor }}
                          className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs"
                        >
                          {companyShortName ? companyShortName.charAt(0) : "S"}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-xs block leading-tight">
                          {companyShortName || "Apex Safety Ltd"}
                        </span>
                        <span className="text-[9px] opacity-75 block">
                          Safety Inspection Workspace
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: draft.primaryColor, color: primaryFgColor }}
                        className="h-6 px-2.5 rounded-md text-[10px] font-semibold flex items-center shadow-xs"
                      >
                        Active Tenant
                      </div>
                      <div
                        style={{ borderColor: draft.accentColor, color: draft.accentColor }}
                        className="h-6 px-2 rounded-md border text-[10px] font-semibold flex items-center bg-card/10"
                      >
                        Verified
                      </div>
                    </div>
                  </div>

                  {/* Simulated Workspace Components Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {/* Simulated KPI Card */}
                    <div className="p-3 rounded-lg border border-border bg-card space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground text-[11px] font-medium">Compliance Rate</span>
                        <span style={{ color: draft.primaryColor }} className="font-bold text-xs">
                          98.4%
                        </span>
                      </div>
                      {/* Simulated Chart Progress Bar */}
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          style={{ backgroundColor: draft.primaryColor }}
                          className="h-full w-[85%] rounded-full transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground block">
                        Calculated from 42 active site inspections
                      </span>
                    </div>

                    {/* Simulated Primary Action Card */}
                    <div className="p-3 rounded-lg border border-border bg-card space-y-2 flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground block">
                        Action Buttons Contrast
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          style={{ backgroundColor: draft.primaryColor, color: primaryFgColor }}
                          className="h-7 px-3 rounded-md text-xs font-semibold shadow-xs flex-1 transition-colors"
                        >
                          Submit Report
                        </button>
                        <button
                          type="button"
                          style={{ borderColor: draft.primaryColor, color: draft.primaryColor }}
                          className="h-7 px-2.5 rounded-md border text-xs font-semibold bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Changes apply across all workspace dashboards immediately upon save.</span>
                  <span className="font-mono text-[10px]">
                    Token ID: {draft.presetId || "custom"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BrandingTab;
