import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { getCountryOptions } from "../../helpers/options";
import { CompanyProfileSettings } from "@/domains/settings/types";

interface CompanyTabProps {
  draft: CompanyProfileSettings | null;
  setDraft: React.Dispatch<React.SetStateAction<CompanyProfileSettings | null>>;
  errors: Record<string, string>;
  isEditable: boolean;
  t: (key: string) => string;
}

export function CompanyTab({ draft, setDraft, errors, isEditable, t }: CompanyTabProps) {
  if (!draft) return null;

  const handleChange = (field: keyof CompanyProfileSettings, value: string) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const countries = getCountryOptions(t);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("settings:tab_companyProfile")}</CardTitle>
        <CardDescription>{t("settings:companyProfile_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_companyName")} *</Label>
            <Input
              value={draft.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
            {errors.companyName && <p className="text-[10px] text-destructive">{t(`settings:${errors.companyName}`)}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_companyShortName")} *</Label>
            <Input
              value={draft.companyShortName}
              onChange={(e) => handleChange("companyShortName", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
            {errors.companyShortName && <p className="text-[10px] text-destructive">{t(`settings:${errors.companyShortName}`)}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_commercialRegistration")} *</Label>
            <Input
              value={draft.commercialRegistration}
              onChange={(e) => handleChange("commercialRegistration", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
            {errors.commercialRegistration && <p className="text-[10px] text-destructive">{t(`settings:${errors.commercialRegistration}`)}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_taxNumber")} *</Label>
            <Input
              value={draft.taxNumber}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
            {errors.taxNumber && <p className="text-[10px] text-destructive">{t(`settings:${errors.taxNumber}`)}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_licenseNumber")}</Label>
            <Input
              value={draft.licenseNumber}
              onChange={(e) => handleChange("licenseNumber", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_civilDefenseRegistration")}</Label>
            <Input
              value={draft.civilDefenseRegistration}
              onChange={(e) => handleChange("civilDefenseRegistration", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_industry")}</Label>
            <Input
              value={draft.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_country")}</Label>
            <Select
              value={draft.country}
              onChange={(e) => handleChange("country", e.target.value)}
              disabled={!isEditable}
            >
              {countries.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_city")}</Label>
            <Input
              value={draft.city}
              onChange={(e) => handleChange("city", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_address")}</Label>
            <Input
              value={draft.address}
              onChange={(e) => handleChange("address", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_phone")} *</Label>
            <Input
              value={draft.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
            {errors.phone && <p className="text-[10px] text-destructive">{t(`settings:${errors.phone}`)}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_email")} *</Label>
            <Input
              value={draft.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
            {errors.email && <p className="text-[10px] text-destructive">{t(`settings:${errors.email}`)}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_supportPhone")}</Label>
            <Input
              value={draft.supportPhone || ""}
              onChange={(e) => handleChange("supportPhone", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">{t("settings:lbl_supportEmail")}</Label>
            <Input
              value={draft.supportEmail || ""}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
            {errors.supportEmail && <p className="text-[10px] text-destructive">{t(`settings:${errors.supportEmail}`)}</p>}
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs font-semibold">{t("settings:lbl_website")}</Label>
            <Input
              value={draft.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs font-semibold">{t("settings:lbl_description")}</Label>
            <Textarea
              value={draft.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={!isEditable}
              className="text-xs bg-background min-h-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
