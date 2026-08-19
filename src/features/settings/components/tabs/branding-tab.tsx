import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { BrandingSettings } from "@/domains/settings/types";

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
  if (!draft) return null;

  const handleChange = (field: keyof BrandingSettings, value: string) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("settings:tab_branding")}</CardTitle>
        <CardDescription>{t("settings:branding_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo configuration */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{t("settings:lbl_logoUrl")}</Label>
              <Input
                value={draft.logoUrl || ""}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                disabled={!isEditable}
                className="text-xs bg-background"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{t("settings:lbl_logoDarkUrl")}</Label>
              <Input
                value={draft.logoDarkUrl || ""}
                onChange={(e) => handleChange("logoDarkUrl", e.target.value)}
                disabled={!isEditable}
                className="text-xs bg-background"
                placeholder="https://example.com/logo-dark.png"
              />
            </div>

            {/* Hex color inputs */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase">{t("settings:lbl_primaryColor")}</Label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={draft.primaryColor.startsWith("#") ? draft.primaryColor : "#4f46e5"}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    disabled={!isEditable}
                    className="h-7 w-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={draft.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    disabled={!isEditable}
                    className="text-[10px] h-7 px-1.5 bg-background font-mono w-20"
                  />
                </div>
                {errors.primaryColor && <p className="text-[9px] text-destructive">{t(`settings:${errors.primaryColor}`)}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase">{t("settings:lbl_secondaryColor")}</Label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={draft.secondaryColor.startsWith("#") ? draft.secondaryColor : "#0f172a"}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    disabled={!isEditable}
                    className="h-7 w-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={draft.secondaryColor}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    disabled={!isEditable}
                    className="text-[10px] h-7 px-1.5 bg-background font-mono w-20"
                  />
                </div>
                {errors.secondaryColor && <p className="text-[9px] text-destructive">{t(`settings:${errors.secondaryColor}`)}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase">{t("settings:lbl_accentColor")}</Label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={draft.accentColor.startsWith("#") ? draft.accentColor : "#f59e0b"}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    disabled={!isEditable}
                    className="h-7 w-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={draft.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    disabled={!isEditable}
                    className="text-[10px] h-7 px-1.5 bg-background font-mono w-20"
                  />
                </div>
                {errors.accentColor && <p className="text-[9px] text-destructive">{t(`settings:${errors.accentColor}`)}</p>}
              </div>
            </div>
          </div>

          {/* Visual Live Preview Card */}
          <div className="border border-border rounded-xl p-4 flex flex-col justify-between bg-card text-card-foreground">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                {t("settings:branding_preview_title") || "Live Workspace Header Preview"}
              </span>
              <div
                style={{ backgroundColor: draft.secondaryColor }}
                className="p-3 rounded-lg flex items-center justify-between border border-border shadow-inner"
              >
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: draft.primaryColor }}
                    className="h-7 w-7 rounded-full flex items-center justify-center font-bold text-white text-xs"
                  >
                    V
                  </div>
                  <span className="font-bold text-xs text-white">
                    {companyShortName || "Vertex Safety"}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div
                    style={{ backgroundColor: draft.primaryColor }}
                    className="h-4 px-2 rounded text-[8px] font-semibold text-white flex items-center"
                  >
                    {t("settings:preview_btn_active") || "Active"}
                  </div>
                  <div
                    style={{ borderColor: draft.accentColor, color: draft.accentColor }}
                    className="h-4 px-2 rounded border text-[8px] font-semibold flex items-center"
                  >
                    {t("settings:preview_btn_alert") || "Alert"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-border flex items-center gap-3">
              {draft.logoUrl && (
                <div className="h-10 w-10 border border-border rounded p-1 bg-card flex items-center justify-center">
                  <img src={draft.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div>
                <span className="text-xs font-semibold block">{t("settings:preview_logo_label") || "Logo Assets"}</span>
                <span className="text-[10px] text-muted-foreground block">{t("settings:preview_logo_desc") || "Branded logo scaling online."}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default BrandingTab;
