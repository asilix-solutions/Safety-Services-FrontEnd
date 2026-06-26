"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { AlertCircle, FileEdit, CheckCircle2, ShieldAlert } from "lucide-react";

interface InspectionDecisionProps {
  notes: string;
  setNotes: (val: string) => void;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  handleApprove: () => void;
  handleRequestFixes: () => void;
  isConsultingEngineer: boolean;
  t: (key: string) => string;
}

export function InspectionDecision({
  notes,
  setNotes,
  isSubmitting,
  error,
  successMessage,
  handleApprove,
  handleRequestFixes,
  isConsultingEngineer,
  t,
}: InspectionDecisionProps) {
  if (!isConsultingEngineer) {
    return (
      <Card className="border-amber-500/25 bg-amber-500/[0.02] shadow-sm rounded-xl">
        <CardContent className="p-5 text-center space-y-3">
          <AlertCircle className="h-6 w-6 text-amber-500 mx-auto" />
          <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">
            {t("projects:inspection.awaitingDecision") || "Awaiting Consulting Engineer Decision"}
          </h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t("projects:inspection.awaitingDecisionDesc") || "Only assigned consulting engineers can log final official compliance audits and make approval decisions."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-500/20 bg-card shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileEdit className="h-4 w-4 text-indigo-500" />
          {t("projects:inspection.title") || "Final Compliance Decision"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 text-xs space-y-4">
        {error && (
          <div className="p-3 border border-destructive/20 bg-destructive/5 text-destructive rounded-lg flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{t(successMessage) || successMessage}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-semibold text-muted-foreground block">
            {t("projects:inspection.engineerNotes") || "Consulting Engineer Final Notes"}
          </label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("projects:inspection.notesPlaceholder") || "Provide details about approved regulations, verified equipment, or requested fixes..."}
            className="bg-secondary/40 min-h-[80px]"
            disabled={isSubmitting || !!successMessage}
          />
        </div>

        {!successMessage && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleRequestFixes}
              disabled={isSubmitting || !notes.trim()}
              variant="outline"
              className="flex-1 text-xs font-bold border-rose-500/30 text-rose-600 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 h-10"
            >
              {t("projects:inspection.requestFixesBtn") || "Request Fixes / Return to Execution"}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isSubmitting || !notes.trim()}
              className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-10"
            >
              {t("projects:inspection.approveBtn") || "Approve Final Inspection"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
