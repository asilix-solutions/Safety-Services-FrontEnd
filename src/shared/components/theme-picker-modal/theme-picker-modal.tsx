"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  THEME_PRESETS,
  ThemePreset,
  DEFAULT_THEME_PRESET_ID,
  getThemePresetById,
} from "@/constants/themes";
import {
  Palette,
  Check,
  Sparkles,
  ShieldCheck,
  Building2,
  HardHat,
  Anchor,
  Leaf,
  Flame,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

export interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called when the user clicks 'Select / موافق' with the complete JSON object of the chosen theme.
   */
  onSelect: (selectedTheme: ThemePreset) => void;
  /**
   * Called when the user cancels or closes the popup, returning null.
   */
  onCancel?: () => void;
  /**
   * The currently active theme ID to pre-select.
   */
  currentThemeId?: string;
}

/**
 * Industry icon mapper for the theme cards
 */
function getThemeIndustryIcon(themeId: string) {
  switch (themeId) {
    case "royal-indigo":
      return <Sparkles className="h-3.5 w-3.5" />;
    case "safety-amber":
      return <HardHat className="h-3.5 w-3.5" />;
    case "corporate-navy":
      return <Anchor className="h-3.5 w-3.5" />;
    case "emerald-compliance":
      return <Leaf className="h-3.5 w-3.5" />;
    case "slate-steel":
      return <Building2 className="h-3.5 w-3.5" />;
    case "crimson-guard":
      return <Flame className="h-3.5 w-3.5" />;
    default:
      return <ShieldCheck className="h-3.5 w-3.5" />;
  }
}

/**
 * Mobile-inspired Wireframe Skeleton Preview Component
 */
function MobileSkeletonPreview({
  preset,
  isSelected,
}: {
  preset: ThemePreset;
  isSelected: boolean;
}) {
  const primaryColor = preset.colors.primary;

  return (
    <div
      className={`w-full rounded-xl bg-card border p-2.5 space-y-2 shadow-xs transition-all ${
        isSelected
          ? "border-primary/50 shadow-xs"
          : "border-border/80 group-hover:scale-[1.01]"
      }`}
    >
      {/* Mobile Top Status Bar & Mini Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <div
            className="h-4 w-4 rounded-md flex items-center justify-center text-[8px] font-bold text-white shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            S
          </div>
          <div className="h-2 w-14 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          <div className="h-1.5 w-3 rounded-full bg-muted-foreground/40" />
        </div>
      </div>

      {/* Mini Metric KPI Card */}
      <div className="rounded-lg bg-muted/40 p-2 border border-border/50 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 rounded-full bg-muted-foreground/30" />
          <div
            className="h-3 px-1.5 rounded-full text-[8px] font-semibold flex items-center gap-0.5 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <span>Live</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="h-3.5 w-10 rounded-sm bg-foreground/80" />
          <div className="h-2 w-6 rounded-sm bg-muted-foreground/40" />
        </div>
        {/* Mini progress bar */}
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: "72%", backgroundColor: primaryColor }}
          />
        </div>
      </div>

      {/* Mini Active Action Button */}
      <div
        className="h-6 w-full rounded-md flex items-center justify-center gap-1 text-[9px] font-semibold text-white shadow-xs"
        style={{ backgroundColor: primaryColor }}
      >
        <span>Action Button</span>
      </div>

      {/* Mini Bottom Nav Bar */}
      <div className="flex items-center justify-around pt-1 border-t border-border/50">
        <div
          className="h-3.5 w-3.5 rounded-md flex items-center justify-center text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="h-1.5 w-1.5 rounded-xs bg-white" />
        </div>
        <div className="h-2 w-3 rounded-xs bg-muted-foreground/30" />
        <div className="h-2 w-3 rounded-xs bg-muted-foreground/30" />
        <div className="h-2 w-3 rounded-xs bg-muted-foreground/30" />
      </div>
    </div>
  );
}

export function ThemePickerModal({
  isOpen,
  onClose,
  onSelect,
  onCancel,
  currentThemeId,
}: ThemePickerModalProps) {
  const { dir } = useTranslation();
  const isRtl = dir === "rtl";

  // Selected preset state (defaults to currentThemeId or standard default)
  const [selectedId, setSelectedId] = useState<string>(
    currentThemeId || DEFAULT_THEME_PRESET_ID
  );

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Sync selectedId when modal opens or currentThemeId changes
  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentThemeId || DEFAULT_THEME_PRESET_ID);
      setSearchQuery("");
    }
  }, [isOpen, currentThemeId]);

  // Filtered themes list
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return THEME_PRESETS;
    const q = searchQuery.toLowerCase();
    return THEME_PRESETS.filter(
      (theme) =>
        theme.name.toLowerCase().includes(q) ||
        theme.industry.toLowerCase().includes(q) ||
        theme.description.toLowerCase().includes(q) ||
        theme.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedTheme = useMemo(() => {
    return getThemePresetById(selectedId);
  }, [selectedId]);

  const handleConfirm = () => {
    onSelect(selectedTheme);
    onClose();
  };

  const handleDismiss = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold flex items-center gap-2.5 text-foreground">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Palette className="h-4 w-4" />
                </div>
                <span>
                  {isRtl ? "اختيار سمة الهوية البصرية" : "Choose Enterprise Theme Preset"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isRtl
                  ? "حدد إحدى السمات المؤسسية المعتمدة لتطبيق الهوية المتوافقة مع معايير الوصول العالمية WCAG AAA"
                  : "Select a curated corporate theme palette to apply instant tenant branding with verified WCAG compliance."}
              </DialogDescription>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? "بحث في السمات..." : "Filter themes..."}
                className="w-full bg-card rounded-lg border border-border ps-8 pe-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body: Theme Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-175px)]">
          {filteredThemes.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Palette className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">
                {isRtl ? "لم يتم العثور على سمات مطابقة" : "No themes match your search"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRtl ? "جرب البحث بكلمات أخرى" : "Try searching by industry or color name"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThemes.map((preset) => {
                const isSelected = selectedId === preset.id;
                const isDefault = preset.id === DEFAULT_THEME_PRESET_ID;

                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedId(preset.id)}
                    className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer select-none bg-card hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/[0.03] ring-2 ring-primary/40 shadow-xs"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    {/* Card Header: Title & Radio Indicator */}
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-foreground">
                              {preset.name}
                            </span>
                            {isDefault && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 font-medium"
                              >
                                {isRtl ? "افتراضي" : "Default"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                            {getThemeIndustryIcon(preset.id)}
                            <span className="truncate">{preset.industry}</span>
                          </div>
                        </div>

                        {/* Custom Radio Button */}
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-card group-hover:border-primary/50"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {preset.description}
                      </p>

                      {/* Mobile Wireframe Skeleton Preview */}
                      <MobileSkeletonPreview preset={preset} isSelected={isSelected} />
                    </div>

                    {/* Card Footer: Swatch Palette & Contrast Verification */}
                    <div className="pt-3 mt-3 border-t border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-black/10 inline-block shadow-2xs"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <span className="font-semibold text-foreground">
                            {preset.colors.primary}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-success font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>AAA White</span>
                        </span>
                      </div>

                      {/* Mini Tri-Color Swatch Strip */}
                      <div className="flex h-2.5 w-full rounded-md overflow-hidden border border-border/80">
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer: Active Summary & Actions */}
        <DialogFooter className="p-4 sm:p-5 border-t border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Selected Theme Badge Info */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-muted-foreground">
              {isRtl ? "السمة المحددة:" : "Selected Theme:"}
            </span>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-card border border-border shadow-2xs">
              <span
                className="h-3 w-3 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: selectedTheme.colors.primary }}
              />
              <span className="text-xs font-bold text-foreground">
                {selectedTheme.name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                ({selectedTheme.colors.primary})
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:self-auto self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="text-xs cursor-pointer"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isRtl ? "اختيار السمة (موافق)" : "Select Theme"}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ThemePickerModal;
