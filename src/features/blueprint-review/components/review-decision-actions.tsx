import React, { useState } from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
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

  const handleApproveClick = () => {
    setShowApproveConfirm(true);
  };

  const confirmApprove = () => {
    setShowApproveConfirm(false);
    onApprove();
  };

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
                className="h-9 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold"
                disabled={disabled}
                onClick={handleApproveClick}
              >
                <Check className="h-3.5 w-3.5" />
                {t("requests:blueprintReview.decisions.approve")}
              </Button>

              <Button
                className="h-9 text-xs gap-1 bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-bold"
                disabled={disabled}
                onClick={() => setShowReturnDialog(true)}
              >
                <CornerUpLeft className="h-3.5 w-3.5" />
                {t("requests:blueprintReview.decisions.return")}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full h-9 text-xs gap-1 text-purple-600 border-purple-500/30 hover:bg-purple-500/5 hover:text-purple-700 font-bold"
              disabled={disabled}
              onClick={() => setShowMissingDocsDialog(true)}
            >
              <FileQuestion className="h-3.5 w-3.5" />
              {t("requests:blueprintReview.decisions.missingDocs")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve Review Confirmation Dialog */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <Card className="max-w-md w-full border-border bg-card shadow-2xl font-sans">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-500" />
                {t("requests:blueprintReview.decisions.approveTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="p-3 bg-secondary/15 rounded-lg border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.currentStatus")}</span>
                  <span className="font-bold text-foreground">{t("requests:stages.UNDER_REVIEW")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.nextStage")}</span>
                  <span className="font-bold text-emerald-600">{t("requests:stages.QUOTATION")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.impact")}</span>
                  <span className="font-bold text-foreground">{t("requests:blueprintReview.decisions.approveImpact")}</span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("requests:blueprintReview.decisions.approveDesc")}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApproveConfirm(false)}
                >
                  {t("requests:blueprintReview.decisions.cancel")}
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  onClick={confirmApprove}
                >
                  {t("requests:blueprintReview.decisions.approveBtn")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Return to Client Dialog */}
      {showReturnDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <Card className="max-w-md w-full border-border bg-card shadow-2xl font-sans">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <CornerUpLeft className="h-5 w-5 text-orange-500" />
                {t("requests:blueprintReview.decisions.return")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="p-3 bg-secondary/15 rounded-lg border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.currentStatus")}</span>
                  <span className="font-bold text-foreground">{t("requests:stages.UNDER_REVIEW")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.nextStage")}</span>
                  <span className="font-bold text-orange-600">{t("requests:blueprintReview.decisions.returnNextStage")}</span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("requests:blueprintReview.decisions.returnDesc") || "This request will remain in Engineering Review until client corrections are completed."}
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground block">
                  {t("requests:blueprintReview.decisions.correctionReasonLabel")}
                </label>
                <Textarea
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder={t("requests:blueprintReview.decisions.correctionReasonPlaceholder")}
                  className="h-28 bg-background text-xs border-border text-foreground"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReturnDialog(false);
                    setCorrectionReason("");
                  }}
                >
                  {t("requests:blueprintReview.decisions.cancel")}
                </Button>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                  onClick={onSubmitReturn}
                >
                  {t("requests:blueprintReview.decisions.submit")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Missing Docs Dialog */}
      {showMissingDocsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <Card className="max-w-md w-full border-border bg-card shadow-2xl font-sans">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-purple-500" />
                {t("requests:blueprintReview.decisions.missingDocs")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="p-3 bg-secondary/15 rounded-lg border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.currentStatus")}</span>
                  <span className="font-bold text-foreground">{t("requests:stages.UNDER_REVIEW")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.impact")}</span>
                  <span className="font-bold text-purple-600">{t("requests:blueprintReview.decisions.missingDocsImpact")}</span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("requests:blueprintReview.decisions.missingDocsDesc") || "The client will be notified that additional documentation is required."}
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground block">
                  {t("requests:blueprintReview.decisions.missingDocsLabel")}
                </label>
                <Textarea
                  value={missingDocumentsNote}
                  onChange={(e) => setMissingDocumentsNote(e.target.value)}
                  placeholder={t("requests:blueprintReview.decisions.missingDocsPlaceholder")}
                  className="h-28 bg-background text-xs border-border text-foreground"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowMissingDocsDialog(false);
                    setMissingDocumentsNote("");
                  }}
                >
                  {t("requests:blueprintReview.decisions.cancel")}
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                  onClick={onSubmitMissingDocs}
                >
                  {t("requests:blueprintReview.decisions.submit")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
