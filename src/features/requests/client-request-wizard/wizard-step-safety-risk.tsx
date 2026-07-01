"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { Label } from "@/shared/ui/label";

interface SafetyRiskStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function SafetyRiskStep({ form, onNext, onPrev }: SafetyRiskStepProps) {
  const { t } = useTranslation();
  const { register, watch, trigger, formState: { errors } } = form;

  const requestType = watch("requestType");

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof ClientRequestFormValues)[] = [];
    if (requestType === "new_license") {
      fieldsToValidate = ["landPlotNumber", "buildingStatus", "licensePurpose"];
    } else if (requestType === "maintenance_contract") {
      fieldsToValidate = ["existingSafetySystems", "preferredVisitDate", "onSiteCoordinatorName", "onSiteCoordinatorPhone"];
    } else if (requestType === "engineering_blueprint") {
      fieldsToValidate = ["blueprintScope", "buildingFloors", "constructionStatus"];
    } else if (requestType === "technical_report") {
      fieldsToValidate = ["reportType", "caseDescription"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">
          {t("requests:wizard.serviceDetails.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.safetyRisk.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {/* NEW SAFETY LICENSE FIELDS */}
        {requestType === "new_license" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.landPlotNumber")}
                </Label>
                <input
                  type="text"
                  {...register("landPlotNumber")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
                />
                {errors.landPlotNumber && (
                  <p className="text-[10px] text-destructive">{errors.landPlotNumber.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.gpsCoordinates")}
                </Label>
                <input
                  type="text"
                  {...register("gpsCoordinates")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.buildingStatus")}
                </Label>
                <select
                  {...register("buildingStatus")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">{t("requests:wizard.serviceDetails.placeholderSelectStatus")}</option>
                  <option value="ready">{t("requests:wizard.serviceDetails.buildingStatusReady")}</option>
                  <option value="under_construction">{t("requests:wizard.serviceDetails.buildingStatusUnderConstruction")}</option>
                  <option value="renovation">{t("requests:wizard.serviceDetails.buildingStatusRenovation")}</option>
                </select>
                {errors.buildingStatus && (
                  <p className="text-[10px] text-destructive">{errors.buildingStatus.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.licensePurpose")}
                </Label>
                <input
                  type="text"
                  {...register("licensePurpose")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
                />
                {errors.licensePurpose && (
                  <p className="text-[10px] text-destructive">{errors.licensePurpose.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {t("requests:wizard.serviceDetails.currentSafetyEquipment")}
              </Label>
              <textarea
                rows={3}
                {...register("currentSafetyEquipment")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
              />
            </div>
          </div>
        )}

        {/* MAINTENANCE CONTRACT FIELDS */}
        {requestType === "maintenance_contract" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {t("requests:wizard.serviceDetails.existingSafetySystems")}
              </Label>
              <textarea
                rows={3}
                {...register("existingSafetySystems")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
              />
              {errors.existingSafetySystems && (
                <p className="text-[10px] text-destructive">{errors.existingSafetySystems.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.lastMaintenanceDate")}
                </Label>
                <input
                  type="date"
                  {...register("lastMaintenanceDate")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.preferredVisitDate")}
                </Label>
                <input
                  type="date"
                  {...register("preferredVisitDate")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                {errors.preferredVisitDate && (
                  <p className="text-[10px] text-destructive">{errors.preferredVisitDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.onSiteCoordinatorName")}
                </Label>
                <input
                  type="text"
                  {...register("onSiteCoordinatorName")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
                />
                {errors.onSiteCoordinatorName && (
                  <p className="text-[10px] text-destructive">{errors.onSiteCoordinatorName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.onSiteCoordinatorPhone")}
                </Label>
                <input
                  type="text"
                  {...register("onSiteCoordinatorPhone")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
                />
                {errors.onSiteCoordinatorPhone && (
                  <p className="text-[10px] text-destructive">{errors.onSiteCoordinatorPhone.message}</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 p-2 rounded bg-muted/40 cursor-pointer">
              <input
                type="checkbox"
                {...register("oldContractAvailable")}
                className="h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-foreground">
                {t("requests:wizard.serviceDetails.oldContractAvailable")}
              </span>
            </label>
          </div>
        )}

        {/* BLUEPRINT REVIEW FIELDS */}
        {requestType === "engineering_blueprint" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {t("requests:wizard.serviceDetails.blueprintScope")}
              </Label>
              <textarea
                rows={3}
                {...register("blueprintScope")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
              />
              {errors.blueprintScope && (
                <p className="text-[10px] text-destructive">{errors.blueprintScope.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.buildingFloors")}
                </Label>
                <input
                  type="number"
                  {...register("buildingFloors")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
                />
                {errors.buildingFloors && (
                  <p className="text-[10px] text-destructive">{errors.buildingFloors.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">
                  {t("requests:wizard.serviceDetails.constructionStatus")}
                </Label>
                <select
                  {...register("constructionStatus")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">{t("requests:wizard.serviceDetails.placeholderSelectConstStatus")}</option>
                  <option value="not_started">{t("requests:wizard.serviceDetails.constructionStatusNotStarted")}</option>
                  <option value="foundation">{t("requests:wizard.serviceDetails.constructionStatusFoundation")}</option>
                  <option value="finishing">{t("requests:wizard.serviceDetails.constructionStatusFinishing")}</option>
                </select>
                {errors.constructionStatus && (
                  <p className="text-[10px] text-destructive">{errors.constructionStatus.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {t("requests:wizard.serviceDetails.requiredSystems")}
              </Label>
              <textarea
                rows={2}
                {...register("requiredSystems")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {t("requests:wizard.serviceDetails.engineeringNotes")}
              </Label>
              <textarea
                rows={2}
                {...register("engineeringNotes")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
              />
            </div>
          </div>
        )}

        {/* TECHNICAL SAFETY REPORT FIELDS */}
        {requestType === "technical_report" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {t("requests:wizard.serviceDetails.reportType")}
              </Label>
              <select
                {...register("reportType")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">{t("requests:wizard.serviceDetails.placeholderSelectReportType")}</option>
                <option value="instant">{t("requests:wizard.serviceDetails.reportTypeInstant")}</option>
                <option value="non_instant">{t("requests:wizard.serviceDetails.reportTypeNonInstant")}</option>
                <option value="compliance">{t("requests:wizard.serviceDetails.reportTypeCompliance")}</option>
              </select>
              {errors.reportType && (
                <p className="text-[10px] text-destructive">{errors.reportType.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {t("requests:wizard.serviceDetails.caseDescription")}
              </Label>
              <textarea
                rows={3}
                {...register("caseDescription")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
              />
              {errors.caseDescription && (
                <p className="text-[10px] text-destructive">{errors.caseDescription.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {t("requests:wizard.serviceDetails.buildingLicenseContext")}
              </Label>
              <textarea
                rows={2}
                {...register("buildingLicenseContext")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
              />
            </div>

            <label className="flex items-center gap-2 p-2 rounded bg-muted/40 cursor-pointer">
              <input
                type="checkbox"
                {...register("inspectionNeeded")}
                className="h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-foreground">
                {t("requests:wizard.serviceDetails.inspectionNeeded")}
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          {t("requests:wizard.buttons.previous")}
        </Button>
        <Button type="button" size="sm" onClick={handleNextStep}>
          {t("requests:wizard.safetyRisk.continueToDocuments")}
        </Button>
      </div>
    </div>
  );
}
export default SafetyRiskStep;
