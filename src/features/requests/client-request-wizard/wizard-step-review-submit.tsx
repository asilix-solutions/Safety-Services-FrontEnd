"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientRequestFormValues } from "@/schemas/client-request.schema";
import { Button } from "@/shared/ui/button";
import { RequiredDocument, RequestType } from "@/domains/requests/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Check } from "lucide-react";

interface ReviewSubmitStepProps {
  form: UseFormReturn<ClientRequestFormValues>;
  documents: RequiredDocument[];
  classificationText: string;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export function ReviewSubmitStep({
  form,
  documents,
  classificationText,
  onSaveDraft,
  onSubmit,
  onPrev,
  isSubmitting,
}: ReviewSubmitStepProps) {
  const { watch } = form;
  const [termsAccepted, setTermsAccepted] = useState(false);

  const values = watch();

  const getRequestTypeLabel = (type: RequestType) => {
    const map: Record<RequestType, string> = {
      new_license: "New Safety License",
      maintenance_contract: "Maintenance Contract",
      engineering_blueprint: "Engineering Blueprint Review",
      technical_report: "Technical Safety Report",
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Review & Submit Request</h2>
        <p className="text-xs text-muted-foreground">
          Carefully review your information. Submitting will register the request inside the backoffice system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Side: Summaries */}
        <div className="space-y-4">
          {/* Facility Summary */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Facility Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block">Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{values.facilityName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">CR / 700 Number</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{values.crNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Area</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{values.area} m²</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block">Address</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">
                  {values.city}, {values.district} - {values.addressDescription}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Summary */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Representative Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{values.contactName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{values.contactPhone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Configuration & Documents */}
        <div className="space-y-4">
          {/* Classification details */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block">Workflow Target</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {getRequestTypeLabel(values.requestType)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Computed Classification</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {classificationText.replace("_", " ")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Documents checklist */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Documents Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">{doc.name}</span>
                  {doc.uploaded ? (
                    <span className="text-emerald-500 font-bold">Uploaded</span>
                  ) : (
                    <span className="text-amber-500 font-medium">Pending upload</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terms & Submit button */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 mt-0.5"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            I hereby certify that all declared facility safety equipment and address coordinates are true and accurate. Any discrepancies might suspend the safety certification evaluation process.
          </span>
        </label>

        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onPrev}>
              Back
            </Button>
            <Button type="button" variant="outline" size="sm" className="text-indigo-600 hover:text-indigo-700" onClick={onSaveDraft}>
              Save as Draft
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!termsAccepted || isSubmitting}
            isLoading={isSubmitting}
            onClick={onSubmit}
            className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/10"
          >
            Submit Safety Request
          </Button>
        </div>
      </div>
    </div>
  );
}
export default ReviewSubmitStep;
