import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent } from "@/shared/ui/card";
import { Check } from "lucide-react";
import { WorkflowStage } from "@/domains/requests/types";

interface WorkflowTimelineProps {
  currentStage: WorkflowStage;
}

export function WorkflowTimeline({ currentStage }: WorkflowTimelineProps) {
  const { t } = useTranslation();

  // Linear progression steps
  const steps = [
    { labelKey: "stages.SUBMITTED", stages: ["DRAFT", "SUBMITTED"] },
    { labelKey: "stages.UNDER_REVIEW", stages: ["UNDER_REVIEW"] },
    { labelKey: "stages.QUOTATION", stages: ["QUOTATION", "QUOTATION_APPROVAL"] },
    { labelKey: "stages.READY_FOR_PAYMENT", stages: ["READY_FOR_PAYMENT", "PAYMENT_CONFIRMED"] },
    { labelKey: "stages.PROJECT_CREATED", stages: ["PROJECT_CREATED"] },
    { labelKey: "stages.FIELD_EXECUTION", stages: ["FIELD_EXECUTION", "FINAL_INSPECTION"] },
    { labelKey: "stages.COMPLETED", stages: ["COMPLETED"] },
  ];

  // Find index of current stage
  const currentStepIndex = steps.findIndex((step) => step.stages.includes(currentStage));

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] px-2 font-sans">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;

            return (
              <React.Fragment key={idx}>
                {/* Step Item */}
                <div className="flex flex-col items-center space-y-1.5 shrink-0 z-10">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-success border-success text-success-foreground"
                        : isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold transition-colors ${
                      isActive ? "text-primary font-bold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t(`requests:${step.labelKey}`)}
                  </span>
                </div>

                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      idx < currentStepIndex ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
