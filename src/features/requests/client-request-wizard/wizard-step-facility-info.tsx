"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { HelpCircle, Building, Hash, Eye, Map, User, Phone } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

interface FacilityInfoStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function FacilityInfoStep({ form, onNext, onPrev }: FacilityInfoStepProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    trigger,
  } = form;

  const handleNextStep = async () => {
    const fieldsToValidate = [
      "facilityName",
      "crNumber",
      "activityName",
      "isicCode",
      "area",
      "city",
      "district",
      "addressDescription",
      "contactName",
      "contactPhone",
    ] as const;

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {t("requests:wizard.facilityInfo.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.facilityInfo.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Facility Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.facilityName")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.facilityNamePlaceholder")}
            {...register("facilityName")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.facilityName && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.facilityName.message === "This field is required" ? t("requests:wizard.validation.required") : errors.facilityName.message}
            </p>
          )}
        </div>

        {/* Commercial Registration / 700 Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.crNumber")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.crNumberPlaceholder")}
            {...register("crNumber")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.crNumber && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.crNumber.message === "This field is required" 
                ? t("requests:wizard.validation.required") 
                : errors.crNumber.message === "Commercial Registration number must be 10 digits"
                ? t("requests:wizard.validation.invalidCr")
                : errors.crNumber.message}
            </p>
          )}
        </div>

        {/* Activity Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.activityName")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.activityNamePlaceholder")}
            {...register("activityName")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.activityName && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.activityName.message === "This field is required" ? t("requests:wizard.validation.required") : errors.activityName.message}
            </p>
          )}
        </div>

        {/* ISIC Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.isicCode")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.isicCodePlaceholder")}
            {...register("isicCode")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.isicCode && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.isicCode.message === "This field is required" ? t("requests:wizard.validation.required") : errors.isicCode.message}
            </p>
          )}
        </div>

        {/* Facility Area in m² */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.area")}
          </label>
          <input
            type="number"
            placeholder={t("requests:wizard.facilityInfo.areaPlaceholder")}
            {...register("area")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.area && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.area.message === "This field is required" 
                ? t("requests:wizard.validation.required") 
                : errors.area.message === "Facility area must be a positive number"
                ? t("requests:wizard.validation.invalidArea")
                : errors.area.message}
            </p>
          )}
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.city")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.cityPlaceholder")}
            {...register("city")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.city && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.city.message === "This field is required" ? t("requests:wizard.validation.required") : errors.city.message}
            </p>
          )}
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.district")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.districtPlaceholder")}
            {...register("district")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.district && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.district.message === "This field is required" ? t("requests:wizard.validation.required") : errors.district.message}
            </p>
          )}
        </div>

        {/* Address Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.addressDescription")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.addressDescriptionPlaceholder")}
            {...register("addressDescription")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.addressDescription && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.addressDescription.message === "This field is required" ? t("requests:wizard.validation.required") : errors.addressDescription.message}
            </p>
          )}
        </div>

        {/* Contact Person Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.contactName")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.contactNamePlaceholder")}
            {...register("contactName")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.contactName && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.contactName.message === "This field is required" ? t("requests:wizard.validation.required") : errors.contactName.message}
            </p>
          )}
        </div>

        {/* Contact Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.facilityInfo.contactPhone")}
          </label>
          <input
            type="text"
            placeholder={t("requests:wizard.facilityInfo.contactPhonePlaceholder")}
            {...register("contactPhone")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.contactPhone && (
            <p className="text-[10px] text-destructive font-medium">
              {errors.contactPhone.message === "This field is required" 
                ? t("requests:wizard.validation.required") 
                : errors.contactPhone.message === "Contact phone number must start with 05 and be 10 digits"
                ? t("requests:wizard.validation.invalidPhone")
                : errors.contactPhone.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          {t("requests:wizard.buttons.previous")}
        </Button>
        <Button type="button" size="sm" onClick={handleNextStep}>
          {t("requests:wizard.facilityInfo.continueToRisk")}
        </Button>
      </div>
    </div>
  );
}
export default FacilityInfoStep;
