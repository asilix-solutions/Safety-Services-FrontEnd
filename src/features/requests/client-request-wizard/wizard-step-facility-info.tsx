"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { HelpCircle, Building, Hash, Eye, Map, User, Phone } from "lucide-react";

interface FacilityInfoStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function FacilityInfoStep({ form, onNext, onPrev }: FacilityInfoStepProps) {
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
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Facility & Contact Information</h2>
        <p className="text-xs text-muted-foreground">
          Provide accurate details about the physical location and commercial license of the facility.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Facility Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-muted-foreground" /> Facility / Business Name
          </label>
          <input
            type="text"
            placeholder="e.g. Al Hamra Main Warehouse"
            {...register("facilityName")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.facilityName && (
            <p className="text-[10px] text-destructive font-medium">{errors.facilityName.message}</p>
          )}
        </div>

        {/* Commercial Registration / 700 Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Commercial Registration / 700 Number
          </label>
          <input
            type="text"
            placeholder="10-digit registration code"
            {...register("crNumber")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.crNumber && (
            <p className="text-[10px] text-destructive font-medium">{errors.crNumber.message}</p>
          )}
        </div>

        {/* Activity Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Safety Activity Name
          </label>
          <input
            type="text"
            placeholder="e.g. Commercial Kitchen or General Office Retail"
            {...register("activityName")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.activityName && (
            <p className="text-[10px] text-destructive font-medium">{errors.activityName.message}</p>
          )}
        </div>

        {/* ISIC Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" /> ISIC Activity Code
          </label>
          <input
            type="text"
            placeholder="e.g. 5610 or 4520"
            {...register("isicCode")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.isicCode && (
            <p className="text-[10px] text-destructive font-medium">{errors.isicCode.message}</p>
          )}
        </div>

        {/* Facility Area in m² */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Facility Total Area (m²)
          </label>
          <input
            type="number"
            placeholder="e.g. 120"
            {...register("area")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.area && (
            <p className="text-[10px] text-destructive font-medium">{errors.area.message}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-muted-foreground" /> City
          </label>
          <input
            type="text"
            placeholder="e.g. Riyadh"
            {...register("city")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.city && (
            <p className="text-[10px] text-destructive font-medium">{errors.city.message}</p>
          )}
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-muted-foreground" /> District
          </label>
          <input
            type="text"
            placeholder="e.g. Al Malaz"
            {...register("district")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.district && (
            <p className="text-[10px] text-destructive font-medium">{errors.district.message}</p>
          )}
        </div>

        {/* Address Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-muted-foreground" /> Detailed Address Description
          </label>
          <input
            type="text"
            placeholder="Street name, landmark details, building number"
            {...register("addressDescription")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.addressDescription && (
            <p className="text-[10px] text-destructive font-medium">{errors.addressDescription.message}</p>
          )}
        </div>

        {/* Contact Person Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> Contact Representative Name
          </label>
          <input
            type="text"
            placeholder="Full Name"
            {...register("contactName")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.contactName && (
            <p className="text-[10px] text-destructive font-medium">{errors.contactName.message}</p>
          )}
        </div>

        {/* Contact Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Contact Phone Number
          </label>
          <input
            type="text"
            placeholder="e.g. +966501234567"
            {...register("contactPhone")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
          />
          {errors.contactPhone && (
            <p className="text-[10px] text-destructive font-medium">{errors.contactPhone.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          Back
        </Button>
        <Button type="button" size="sm" onClick={handleNextStep}>
          Continue to Risk Details
        </Button>
      </div>
    </div>
  );
}
export default FacilityInfoStep;
