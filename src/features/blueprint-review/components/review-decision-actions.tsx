import React, { useState } from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/shared/ui/alert-dialog";
import { Check, CornerUpLeft, FileQuestion } from "lucide-react";

interface ReviewDecisionActionsProps {
  onApprove: () => void;
  onReturn: () => void;
  onRequestMissingDocs: () => void;
  disabled?: boolean;

  // Return dialog control
  showReturnDialog: boolean;
  setShowReturnDialog: (show: boolean) => void;
  correctionReason: string;
  setCorrectionReason: (val: string) => void;
  onSubmitReturn: () => void;

  // Missing docs dialog control
  showMissingDocsDialog: boolean;
  setShowMissingDocsDialog: (show: boolean) => void;
  missingDocumentsNote: string;
  setMissingDocumentsNote: (val: string) => void;
  onSubmitMissingDocs: () => void;
}

export function ReviewDecisionActions({
  onApprove,
  onReturn,
  onRequestMissingDocs,
  disabled,

  showReturnDialog,
  setShowReturnDialog,
  correctionReason,
  setCorrectionReason,
  onSubmitReturn,

  showMissingDocsDialog,
  setShowMissingDocsDialog,
  missingDocumentsNote,
  setMissingDocumentsNote,
  onSubmitMissingDocs,
}: ReviewDecisionActionsProps) {
  const { t } = useTranslation();
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  return (
    <>
      <Card className="border-border bg-card shadow-sm w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t("requests:blueprintReview.decisions.title")}
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground">
            {t("requests:blueprintReview.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {/* Decision Grid */}
          <div className="flex flex-col gap-2 font-sans">
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="h-9 text-xs gap-1 bg-success hover:bg-success/90 text-success-foreground shadow-sm font-bold"
                disabled={disabled}
                onClick={() => setShowApproveConfirm(true)}
              >
                <Check className="h-3.5 w-3.5" />
                {t("requests:blueprintReview.decisions.approve")}
              </Button>

              <Button
                className="h-9 text-xs gap-1 bg-warning hover:bg-warning/90 text-warning-foreground shadow-sm font-bold"
                disabled={disabled}
                onClick={onReturn}
              >
                <CornerUpLeft className="h-3.5 w-3.5" />
                {t("requests:blueprintReview.decisions.return")}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full h-9 text-xs gap-1 text-info border-info/30 hover:bg-info/5 hover:text-info font-bold"
              disabled={disabled}
              onClick={onRequestMissingDocs}
            >
              <FileQuestion className="h-3.5 w-3.5" />
              {t("requests:blueprintReview.decisions.missingDocs")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve confirmation */}
      <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-sm">
              <Check className="h-5 w-5 text-success shrink-0" />
              {t("requests:blueprintReview.decisions.approveTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              {t("requests:blueprintReview.decisions.approveDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-3 bg-secondary/15 rounded-lg border border-border space-y-2 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.currentStatus")}</span>
              <span className="font-bold text-foreground">{t("requests:stages.UNDER_REVIEW")}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.nextStage")}</span>
              <span className="font-bold text-success">{t("requests:stages.QUOTATION")}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.impact")}</span>
              <span className="font-bold text-foreground text-end">{t("requests:blueprintReview.decisions.approveImpact")}</span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("requests:blueprintReview.decisions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-success hover:bg-success/90 text-success-foreground font-semibold"
              onClick={onApprove}
            >
              {t("requests:blueprintReview.decisions.approveBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Return for modification — FR-CON-02 blocks the return until a reason is filled */}
      <AlertDialog
        open={showReturnDialog}
        onOpenChange={(open) => {
          setShowReturnDialog(open);
          if (!open) setCorrectionReason("");
        }}
      >
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-sm">
              <CornerUpLeft className="h-5 w-5 text-warning shrink-0" />
              {t("requests:blueprintReview.decisions.return")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              {t("requests:blueprintReview.decisions.returnDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="correction-reason" className="text-[11px] font-semibold text-foreground">
              {t("requests:blueprintReview.decisions.correctionReasonLabel")}
            </Label>
            <Textarea
              id="correction-reason"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder={t("requests:blueprintReview.decisions.correctionReasonPlaceholder")}
              rows={4}
              className="bg-background text-xs border-border text-foreground"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("requests:blueprintReview.decisions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-warning hover:bg-warning/90 text-warning-foreground font-semibold"
              disabled={!correctionReason.trim()}
              onClick={onSubmitReturn}
            >
              {t("requests:blueprintReview.decisions.submit")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request missing documents — same note gate */}
      <AlertDialog
        open={showMissingDocsDialog}
        onOpenChange={(open) => {
          setShowMissingDocsDialog(open);
          if (!open) setMissingDocumentsNote("");
        }}
      >
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-sm">
              <FileQuestion className="h-5 w-5 text-info shrink-0" />
              {t("requests:blueprintReview.decisions.missingDocs")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              {t("requests:blueprintReview.decisions.missingDocsDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="missing-docs-note" className="text-[11px] font-semibold text-foreground">
              {t("requests:blueprintReview.decisions.missingDocsLabel")}
            </Label>
            <Textarea
              id="missing-docs-note"
              value={missingDocumentsNote}
              onChange={(e) => setMissingDocumentsNote(e.target.value)}
              placeholder={t("requests:blueprintReview.decisions.missingDocsPlaceholder")}
              rows={4}
              className="bg-background text-xs border-border text-foreground"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("requests:blueprintReview.decisions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-info hover:bg-info/90 text-info-foreground font-semibold"
              disabled={!missingDocumentsNote.trim()}
              onClick={onSubmitMissingDocs}
            >
              {t("requests:blueprintReview.decisions.submit")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
