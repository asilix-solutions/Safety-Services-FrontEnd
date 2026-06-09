"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { ShieldAlert, Info, Flame, EyeOff, ClipboardList, PenTool } from "lucide-react";

interface SafetyRiskStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function SafetyRiskStep({ form, onNext, onPrev }: SafetyRiskStepProps) {
  const { register, watch, setValue } = form;

  const gasExtensions = watch("gasExtensions");
  const hazardousMaterials = watch("hazardousMaterials");

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Safety systems & Risk Checklist</h2>
        <p className="text-xs text-muted-foreground">
          Indicate what safety assets are already in place and declare potential hazard elements.
        </p>
      </div>

      <div className="space-y-4">
        {/* Toggles Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Safety Equipment */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all select-none">
            <input
              type="checkbox"
              {...register("safetyEquipment")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-850 dark:text-slate-100">Basic Safety Equipment</span>
              <span className="text-[10px] text-muted-foreground block">Safety helmets, protective vests, safety signage.</span>
            </div>
          </label>

          {/* Fire Alarm System */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all select-none">
            <input
              type="checkbox"
              {...register("fireAlarm")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-850 dark:text-slate-100">Fire Alarm System</span>
              <span className="text-[10px] text-muted-foreground block">Smoke detectors, heat sensors, alarm controls.</span>
            </div>
          </label>

          {/* Fire Extinguishers */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all select-none">
            <input
              type="checkbox"
              {...register("fireExtinguishers")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-850 dark:text-slate-100">Fire Extinguishers</span>
              <span className="text-[10px] text-muted-foreground block">CO2/dry powder cylinders positioned near exits.</span>
            </div>
          </label>

          {/* Emergency Exits */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all select-none">
            <input
              type="checkbox"
              {...register("emergencyExits")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-850 dark:text-slate-100">Emergency Exits</span>
              <span className="text-[10px] text-muted-foreground block">Clearly mapped and unobstructed exit pathways.</span>
            </div>
          </label>

          {/* Gas Extensions */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all select-none ${
            gasExtensions ? "border-amber-500/30 bg-amber-500/5" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
          }`}>
            <input
              type="checkbox"
              {...register("gasExtensions")}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-850 dark:text-slate-100">Active Gas Extensions</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">Overriding Hazard Element: Instantly flags high risk.</span>
            </div>
          </label>

          {/* Hazardous Materials */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all select-none ${
            hazardousMaterials ? "border-amber-500/30 bg-amber-500/5" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
          }`}>
            <input
              type="checkbox"
              {...register("hazardousMaterials")}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-850 dark:text-slate-100">Hazardous / Flammables</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">Overriding Hazard Element: Instantly flags high risk.</span>
            </div>
          </label>
        </div>

        {/* Hazard Risk category select */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" /> Declared Risk Category
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
                {risk} Risk
              </Button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <PenTool className="h-3.5 w-3.5 text-muted-foreground" /> Notes / Special Requests
          </label>
          <textarea
            rows={3}
            placeholder="Describe any special conditions, access codes, or timing preferences..."
            {...register("notes")}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none"
          />
        </div>

        {(gasExtensions || hazardousMaterials) && (
          <div className="flex gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">High Hazard Elements Detected</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                Because your facility declares gas extensions or hazardous storage elements, it will be classified under high-hazard review standards. Instant certification will be bypassed.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          Back
        </Button>
        <Button type="button" size="sm" onClick={onNext}>
          Continue to Document Uploads
        </Button>
      </div>
    </div>
  );
}
export default SafetyRiskStep;
