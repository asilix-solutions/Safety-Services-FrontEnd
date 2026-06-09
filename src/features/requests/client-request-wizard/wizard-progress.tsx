"use client";

import React from "react";
import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  steps: string[];
}

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  return (
    <div className="w-full py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 px-6 rounded-xl">
      <div className="flex items-center justify-between">
        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <React.Fragment key={index}>
              {/* Step circle */}
              <div className="flex flex-col items-center space-y-1.5 z-10">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-600/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                  }`}
                >
                  {stepName}
                </span>
              </div>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-slate-100 dark:bg-slate-800 relative -top-3">
                  <div
                    className="absolute h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
export default WizardProgress;
