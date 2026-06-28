"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { ShieldAlert, Info, Flame, EyeOff, ClipboardList, PenTool } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

interface SafetyRiskStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function SafetyRiskStep({ form, onNext, onPrev }: SafetyRiskStepProps) {
  const { t } = useTranslation();
  const { register, watch, setValue } = form;

  const gasExtensions = watch("gasExtensions");
  const hazardousMaterials = watch("hazardousMaterials");

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">
          {t("requests:wizard.safetyRisk.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.safetyRisk.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Toggles Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Safety Equipment */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-accent/50 transition-all select-none">
            <input
              type="checkbox"
              {...register("safetyEquipment")}
              className="h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                {t("requests:wizard.safetyRisk.equipmentTitle")}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {t("requests:wizard.safetyRisk.equipmentDesc")}
              </span>
            </div>
          </label>

          {/* Fire Alarm System */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-accent/50 transition-all select-none">
            <input
              type="checkbox"
              {...register("fireAlarm")}
              className="h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                {t("requests:wizard.safetyRisk.alarmTitle")}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {t("requests:wizard.safetyRisk.alarmDesc")}
              </span>
            </div>
          </label>

          {/* Fire Extinguishers */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-accent/50 transition-all select-none">
            <input
              type="checkbox"
              {...register("fireExtinguishers")}
              className="h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                {t("requests:wizard.safetyRisk.extinguishersTitle")}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {t("requests:wizard.safetyRisk.extinguishersDesc")}
              </span>
            </div>
          </label>

          {/* Emergency Exits */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-accent/50 transition-all select-none">
            <input
              type="checkbox"
              {...register("emergencyExits")}
              className="h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                {t("requests:wizard.safetyRisk.exitsTitle")}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {t("requests:wizard.safetyRisk.exitsDesc")}
              </span>
            </div>
          </label>

          {/* Gas Extensions */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-accent/50 transition-all select-none ${
            gasExtensions ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"
          }`}>
            <input
              type="checkbox"
              {...register("gasExtensions")}
              className="h-4 w-4 rounded border-input text-amber-500 focus:ring-amber-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                {t("requests:wizard.safetyRisk.gasTitle")}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                {t("requests:wizard.safetyRisk.gasDesc")}
              </span>
            </div>
          </label>

          {/* Hazardous Materials */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-accent/50 transition-all select-none ${
            hazardousMaterials ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"
          }`}>
            <input
              type="checkbox"
              {...register("hazardousMaterials")}
              className="h-4 w-4 rounded border-input text-amber-500 focus:ring-amber-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                {t("requests:wizard.safetyRisk.hazardousTitle")}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                {t("requests:wizard.safetyRisk.hazardousDesc")}
              </span>
            </div>
          </label>
        </div>

        {/* Hazard Risk category select */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.safetyRisk.declaredRisk")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["low", "medium", "high"].map((risk) => (
              <Button
                key={risk}
                type="button"
                variant={form.watch("riskCategory") === risk ? "default" : "outline"}
                className={`text-xs capitalize py-2.5 h-auto ${
                  form.watch("riskCategory") === risk && risk === "high"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : form.watch("riskCategory") === risk && risk === "medium"
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : form.watch("riskCategory") === risk
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : ""
                }`}
                onClick={() => setValue("riskCategory", risk as "low" | "medium" | "high")}
              >
                {risk === "low" 
                  ? t("requests:wizard.safetyRisk.riskLow") 
                  : risk === "medium"
                  ? t("requests:wizard.safetyRisk.riskMedium")
                  : t("requests:wizard.safetyRisk.riskHigh")}
              </Button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <PenTool className="h-3.5 w-3.5 text-muted-foreground" /> {t("requests:wizard.safetyRisk.notes")}
          </label>
          <textarea
            rows={3}
            placeholder={t("requests:wizard.safetyRisk.notesPlaceholder")}
            {...register("notes")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
          />
        </div>

        {(gasExtensions || hazardousMaterials) && (
          <div className="flex gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{t("requests:wizard.safetyRisk.hazardWarningTitle")}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                {t("requests:wizard.safetyRisk.hazardWarningDesc")}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          {t("requests:wizard.buttons.previous")}
        </Button>
        <Button type="button" size="sm" onClick={onNext}>
          {t("requests:wizard.safetyRisk.continueToDocuments")}
        </Button>
      </div>
    </div>
  );
}
export default SafetyRiskStep;
