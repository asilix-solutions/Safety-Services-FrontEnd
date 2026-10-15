import React, { useState } from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
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
import { Check, CornerUpLeft, FileQuestion, ShieldCheck } from "lucide-react";
import { OccupancyHazardClass } from "@/domains/engineering";

export interface Sbc801ComplianceData {
  occupancyHazardClass: OccupancyHazardClass;
  isolatedCompartmentAreaM2: number;
  requiredSprinklerDensity: number;
  pumpHeadRatingMeters?: number;
  smokeVentilationAirChangesPerHour?: number;
  technicalRemarks?: string;
}

interface ReviewDecisionActionsProps {
  onApprove: (compliance: Sbc801ComplianceData) => void;
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

  // SBC 801 Engineering Parameters State
  const [hazardClass, setHazardClass] = useState<OccupancyHazardClass>(OccupancyHazardClass.OrdinaryHazard1);
  const [compartmentArea, setCompartmentArea] = useState<number>(1200);
  const [sprinklerDensity, setSprinklerDensity] = useState<number>(0.15);
  const [pumpHead, setPumpHead] = useState<number>(60);
  const [smokeVentilation, setSmokeVentilation] = useState<number>(6);
  const [techRemarks, setTechRemarks] = useState<string>("");

  const handleConfirmApproval = () => {
    onApprove({
      occupancyHazardClass: hazardClass,
      isolatedCompartmentAreaM2: Number(compartmentArea) || 1200,
      requiredSprinklerDensity: Number(sprinklerDensity) || 0.15,
      pumpHeadRatingMeters: pumpHead ? Number(pumpHead) : undefined,
      smokeVentilationAirChangesPerHour: smokeVentilation ? Number(smokeVentilation) : undefined,
      technicalRemarks: techRemarks.trim() || undefined,
    });
    setShowApproveConfirm(false);
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

      {/* SBC 801 Compliance Approval Dialog */}
      <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <AlertDialogContent className="font-sans max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-sm text-foreground">
              <ShieldCheck className="h-5 w-5 text-success shrink-0" />
              <span>اعتماد المخططات الهندسية وفق كود البناء السعودي (SBC 801)</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
              يرجى التحقق من محددات السلامة والوقاية من الحريق وتسجيل بارامترات الامتثال قبل إحالة المشروع لمرحلة التسعير.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* Status Summary */}
            <div className="p-3 bg-secondary/15 rounded-lg border border-border space-y-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.currentStatus")}</span>
                <span className="font-bold text-foreground">{t("requests:stages.UNDER_REVIEW")}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t("requests:blueprintReview.decisions.nextStage")}</span>
                <span className="font-bold text-success">{t("requests:stages.QUOTATION")}</span>
              </div>
            </div>

            {/* SBC 801 Form Section */}
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="hazard-class" className="text-[11px] font-semibold text-foreground">
                  فئة خطورة الإشغال (Occupancy Hazard Class) *
                </Label>
                <Select
                  id="hazard-class"
                  value={String(hazardClass)}
                  onChange={(e) => setHazardClass(Number(e.target.value) as OccupancyHazardClass)}
                  className="text-xs bg-background"
                >
                  <option value={OccupancyHazardClass.LightHazard}>
                    خطورة خفيفة (Light Hazard) — مكاتب، مدارس، مستشفيات
                  </option>
                  <option value={OccupancyHazardClass.OrdinaryHazard1}>
                    خطورة عادية 1 (Ordinary Hazard 1) — مواقف سيارات، مطاعم
                  </option>
                  <option value={OccupancyHazardClass.OrdinaryHazard2}>
                    خطورة عادية 2 (Ordinary Hazard 2) — مستودعات تجارية، ورش
                  </option>
                  <option value={OccupancyHazardClass.ExtraHazard}>
                    خطورة عالية (Extra Hazard) — مواد كيميائية، غازات، تصنيع
                  </option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <Label htmlFor="compartment-area" className="text-[11px] font-semibold text-foreground">
                    مساحة القطاع المعزول (م²) *
                  </Label>
                  <Input
                    id="compartment-area"
                    type="number"
                    min={1}
                    value={compartmentArea}
                    onChange={(e) => setCompartmentArea(Number(e.target.value))}
                    className="text-xs bg-background h-8"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sprinkler-density" className="text-[11px] font-semibold text-foreground">
                    كثافة الرشاشات (L/min/m²) *
                  </Label>
                  <Input
                    id="sprinkler-density"
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={sprinklerDensity}
                    onChange={(e) => setSprinklerDensity(Number(e.target.value))}
                    className="text-xs bg-background h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <Label htmlFor="pump-head" className="text-[11px] font-semibold text-foreground">
                    ضغط المضخة التصميمي (متر)
                  </Label>
                  <Input
                    id="pump-head"
                    type="number"
                    min={0}
                    value={pumpHead}
                    onChange={(e) => setPumpHead(Number(e.target.value))}
                    className="text-xs bg-background h-8"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="smoke-ventilation" className="text-[11px] font-semibold text-foreground">
                    معدل تجديد الهواء (تغيير/ساعة)
                  </Label>
                  <Input
                    id="smoke-ventilation"
                    type="number"
                    min={0}
                    value={smokeVentilation}
                    onChange={(e) => setSmokeVentilation(Number(e.target.value))}
                    className="text-xs bg-background h-8"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tech-remarks" className="text-[11px] font-semibold text-foreground">
                  الملاحظات الفنية ومبررات الامتثال
                </Label>
                <Textarea
                  id="tech-remarks"
                  value={techRemarks}
                  onChange={(e) => setTechRemarks(e.target.value)}
                  placeholder="ملاحظات الاعتماد وفق كود البناء السعودي الصادر عن الدفاع المدني..."
                  rows={2}
                  className="text-xs bg-background"
                />
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("requests:blueprintReview.decisions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-success hover:bg-success/90 text-success-foreground font-semibold"
              onClick={handleConfirmApproval}
            >
              تأكيد الاعتماد والامتثال لـ SBC 801
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
