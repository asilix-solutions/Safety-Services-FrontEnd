import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Select } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { SecuritySettings } from "@/domains/settings/types";
import { getSessionTimeoutOptions } from "../../helpers/options";

interface SecurityTabProps {
  draft: SecuritySettings | null;
  setDraft: React.Dispatch<React.SetStateAction<SecuritySettings | null>>;
  errors: Record<string, string>;
  isEditable: boolean;
  t: (key: string) => string;
}

export function SecurityTab({ draft, setDraft, errors, isEditable, t }: SecurityTabProps) {
  if (!draft) return null;

  const handleChange = (field: keyof SecuritySettings, value: any) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const timeoutOptions = getSessionTimeoutOptions(t);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("settings:tab_security")}</CardTitle>
        <CardDescription>{t("settings:security_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning note */}
        <div className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl text-amber-600 dark:text-amber-400 text-xs">
          <span className="font-bold uppercase block mb-1">{t("settings:security_note_title") || "SSLM MVP Configuration Node"}</span>
          {t("settings:security_note_desc") || "These controls set client-side session timeout intervals and testing parameters."}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_sessionTimeout")}</Label>
            <Select
              value={String(draft.sessionTimeoutMinutes)}
              onChange={(e) => handleChange("sessionTimeoutMinutes", parseInt(e.target.value, 10))}
              disabled={!isEditable}
            >
              {timeoutOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
            {errors.sessionTimeoutMinutes && <p className="text-[10px] text-destructive">{t(`settings:${errors.sessionTimeoutMinutes}`)}</p>}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Checkbox
              id="rememberLogin"
              checked={draft.rememberLogin}
              onChange={(e) => handleChange("rememberLogin", e.target.checked)}
              disabled={!isEditable}
            />
            <Label htmlFor="rememberLogin" className="text-xs font-semibold cursor-pointer">
              {t("settings:lbl_rememberLogin") || "Remember Login"}
            </Label>
          </div>

          <div className="flex items-center gap-2 pt-4 md:col-span-2">
            <Checkbox
              id="enableTwoFactorMock"
              checked={draft.enableTwoFactorMock}
              onChange={(e) => handleChange("enableTwoFactorMock", e.target.checked)}
              disabled={!isEditable}
            />
            <Label htmlFor="enableTwoFactorMock" className="text-xs font-semibold cursor-pointer">
              {t("settings:lbl_enableTwoFactorMock") || "Enable Two-Factor Verification Mock"}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default SecurityTab;
