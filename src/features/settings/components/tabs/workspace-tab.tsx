import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { WorkspacePreferenceSettings } from "@/domains/settings/types";
import {
  getLanguageOptions,
  getThemeOptions,
  getTimezoneOptions,
  getDateFormats,
  getTimeFormats,
  getPageSizeOptions
} from "../../helpers/options";

interface WorkspaceTabProps {
  draft: WorkspacePreferenceSettings | null;
  setDraft: React.Dispatch<React.SetStateAction<WorkspacePreferenceSettings | null>>;
  errors: Record<string, string>;
  isEditable: boolean;
  t: (key: string) => string;
}

export function WorkspaceTab({ draft, setDraft, errors, isEditable, t }: WorkspaceTabProps) {
  if (!draft) return null;

  const handleChange = (field: keyof WorkspacePreferenceSettings, value: any) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const languages = getLanguageOptions(t);
  const themes = getThemeOptions(t);
  const timezones = getTimezoneOptions();
  const dateFormats = getDateFormats();
  const timeFormats = getTimeFormats(t);
  const pageSizes = getPageSizeOptions();

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("settings:tab_preferences")}</CardTitle>
        <CardDescription>{t("settings:preferences_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_language")}</Label>
            <Select
              value={draft.language}
              onChange={(e) => handleChange("language", e.target.value)}
              disabled={!isEditable}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_theme")}</Label>
            <Select
              value={draft.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
              disabled={!isEditable}
            >
              {themes.map((theme) => (
                <option key={theme.value} value={theme.value}>{theme.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_timezone")} *</Label>
            <Select
              value={draft.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              disabled={!isEditable}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </Select>
            {errors.timezone && <p className="text-[10px] text-destructive">{t(`settings:${errors.timezone}`)}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_dateFormat")} *</Label>
            <Select
              value={draft.dateFormat}
              onChange={(e) => handleChange("dateFormat", e.target.value)}
              disabled={!isEditable}
            >
              {dateFormats.map((df) => (
                <option key={df.value} value={df.value}>{df.label}</option>
              ))}
            </Select>
            {errors.dateFormat && <p className="text-[10px] text-destructive">{t(`settings:${errors.dateFormat}`)}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_timeFormat")}</Label>
            <Select
              value={draft.timeFormat}
              onChange={(e) => handleChange("timeFormat", e.target.value)}
              disabled={!isEditable}
            >
              {timeFormats.map((tf) => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_defaultPageSize")}</Label>
            <Select
              value={String(draft.defaultPageSize)}
              onChange={(e) => handleChange("defaultPageSize", parseInt(e.target.value, 10))}
              disabled={!isEditable}
            >
              {pageSizes.map((ps) => (
                <option key={ps.value} value={ps.value}>{ps.label}</option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-4 md:col-span-2">
            <Checkbox
              id="compactMode"
              checked={draft.compactMode}
              onChange={(e) => handleChange("compactMode", e.target.checked)}
              disabled={!isEditable}
            />
            <Label htmlFor="compactMode" className="text-xs font-semibold cursor-pointer">
              {t("settings:lbl_compactMode")}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default WorkspaceTab;
