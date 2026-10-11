"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import {
  closureApi,
  ClosureReadinessDto,
  PunchListItemDto,
  ClosureCertificateDto,
  PunchListItemStatus,
} from "@/domains/closure/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileCheck2,
  PenTool,
  Award,
  RefreshCw,
  Stamp,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { SignaturePad } from "@/shared/components/signature-pad";
import { alertService } from "@/services/alert-notification";

interface LegalClosureHubProps {
  projectId: string;
  onClosed?: () => void;
  onFallbackToLocal?: () => void;
}

export function LegalClosureHub({
  projectId,
  onClosed,
  onFallbackToLocal,
}: LegalClosureHubProps) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<ClosureReadinessDto | null>(null);
  const [punchList, setPunchList] = useState<PunchListItemDto[]>([]);
  const [certificate, setCertificate] = useState<ClosureCertificateDto | null>(null);

  // Inspection item modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedPunchItem, setSelectedPunchItem] = useState<PunchListItemDto | null>(null);
  const [inspectionVerdict, setInspectionVerdict] = useState<PunchListItemStatus>(
    PunchListItemStatus.Passed
  );
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [submittingInspection, setSubmittingInspection] = useState(false);

  // Client Sign Modal
  const [clientSignModalOpen, setClientSignModalOpen] = useState(false);
  const [clientRepName, setClientRepName] = useState(user?.name || "");
  const [clientSignature, setClientSignature] = useState("");
  const [submittingClientSign, setSubmittingClientSign] = useState(false);

  // Manager Sign Modal
  const [managerSignModalOpen, setManagerSignModalOpen] = useState(false);
  const [managerSignature, setManagerSignature] = useState("");
  const [submittingManagerSign, setSubmittingManagerSign] = useState(false);

  // Seal Dialog
  const [sealConfirmOpen, setSealConfirmOpen] = useState(false);
  const [submittingSeal, setSubmittingSeal] = useState(false);

  // Applying standard checklist
  const [applyingStandard, setApplyingStandard] = useState(false);

  const isEngineerOrAdmin =
    user?.role === "Super Admin" ||
    user?.role === "Company Admin" ||
    user?.role === "Consulting Engineer" ||
    user?.role === "Operations Officer";

  const isClient = user?.role === "Client";

  const loadClosureData = async () => {
    try {
      setLoading(true);
      const [readinessRes, punchListRes] = await Promise.all([
        closureApi.getReadiness(projectId),
        closureApi.getPunchList(projectId),
      ]);

      if (readinessRes.isSuccess && readinessRes.data) {
        setReadiness(readinessRes.data);
      } else {
        // If 404 or not found on remote staging, fallback to local mock
        onFallbackToLocal?.();
        return;
      }

      if (punchListRes.isSuccess && punchListRes.data) {
        setPunchList(punchListRes.data);
      }

      // Check if certificate exists
      try {
        const certRes = await closureApi.getCertificate(projectId);
        if (certRes.isSuccess && certRes.data) {
          setCertificate(certRes.data);
        }
      } catch {
        // Certificate may not be generated yet
      }
    } catch (err: any) {
      console.warn("Could not query live closure API, falling back:", err);
      onFallbackToLocal?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadClosureData();
    }
  }, [projectId]);

  const handleApplyStandardChecklist = async () => {
    try {
      setApplyingStandard(true);
      const res = await closureApi.applyStandardPunchList(projectId);
      if (res.isSuccess && res.data) {
        setPunchList(res.data);
        alertService.showSuccess(
          "تم تطبيق قائمة فحص الكود السعودي SBC 801 بنجاح",
          "تم إدراج معايير السلامة الإلزامية."
        );
        loadClosureData();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في تطبيق معايير SBC 801", err.message);
    } finally {
      setApplyingStandard(false);
    }
  };

  const handleSaveInspectionVerdict = async () => {
    if (!selectedPunchItem) return;
    try {
      setSubmittingInspection(true);
      const res = await closureApi.inspectPunchListItem(
        selectedPunchItem.id,
        inspectionVerdict,
        inspectionNotes.trim() || undefined
      );

      if (res.isSuccess) {
        alertService.showSuccess(
          "تم تسجيل نتيجة الفحص الهندسي",
          `البند: ${selectedPunchItem.description}`
        );
        setInspectModalOpen(false);
        setSelectedPunchItem(null);
        setInspectionNotes("");
        loadClosureData();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في تسجيل نتيجة الفحص", err.message);
    } finally {
      setSubmittingInspection(false);
    }
  };

  const handleSubmitClientSignature = async () => {
    if (!clientSignature || !clientRepName.trim()) {
      alertService.showWarning("يرجى إدخال اسم ممثل العميل والتوقيع");
      return;
    }
    try {
      setSubmittingClientSign(true);
      const res = await closureApi.signAsClient(projectId, {
        representativeName: clientRepName.trim(),
        signatureBase64: clientSignature,
      });

      if (res.isSuccess) {
        alertService.showSuccess(
          "تم تسجيل توقيع واعتماد العميل (الطرف الأول)",
          "تم توثيق محضر الاستلام الميداني."
        );
        setClientSignModalOpen(false);
        setClientSignature("");
        loadClosureData();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في تسجيل توقيع العميل", err.message);
    } finally {
      setSubmittingClientSign(false);
    }
  };

  const handleSubmitManagerSignature = async () => {
    if (!managerSignature) {
      alertService.showWarning("يرجى إدخال توقيع المدير المسؤول");
      return;
    }
    try {
      setSubmittingManagerSign(true);
      const res = await closureApi.signAsManager(projectId, {
        signatureBase64: managerSignature,
      });

      if (res.isSuccess) {
        alertService.showSuccess(
          "تم توثيق توقيع مدير السلامة المعتمد (الطرف الثاني)",
          "المشروع جاهز الآن للإغلاق القانوني النهائي."
        );
        setManagerSignModalOpen(false);
        setManagerSignature("");
        loadClosureData();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في توثيق توقيع المدير", err.message);
    } finally {
      setSubmittingManagerSign(false);
    }
  };

  const handleSealProject = async () => {
    try {
      setSubmittingSeal(true);
      const res = await closureApi.sealProject(projectId);
      if (res.isSuccess && res.data) {
        setCertificate(res.data);
        alertService.showSuccess(
          "تم إغلاق وختم المشروع وتوليد شهادة السلامة",
          `رقم الشهادة المعتمدة: ${res.data.certificateNumber}`
        );
        setSealConfirmOpen(false);
        loadClosureData();
        onClosed?.();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في إغلاق وختم المشروع", err.message);
    } finally {
      setSubmittingSeal(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center border-dashed border-border">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
        <p className="text-sm text-muted-foreground font-medium">
          جاري التحقق من جاهزية الإغلاق القانوني ومطابقة SBC 801...
        </p>
      </Card>
    );
  }

  if (!readiness) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Legal Closure & Immutability Vault */}
      <Card
        className={`border-2 transition-all ${
          readiness.isSealed
            ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
            : readiness.canSeal
            ? "border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10"
            : "border-border bg-card"
        }`}
      >
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {readiness.isSealed ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Lock className="h-5 w-5 text-primary" />
                )}
                <CardTitle className="text-lg font-bold">
                  {readiness.isSealed
                    ? "شهادة الإغلاق النهائي وخزينة السلامة غير القابلة للتعديل"
                    : "محضر الإغلاق القانوني وشهادة المطابقة (SBC 801)"}
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                {readiness.isSealed
                  ? "تم ختم المشروع وحفظ كافة الوثائق الهندسية في الخزينة الرقمية الثابتة."
                  : "إجراءات التسليم النهائي، محضر الاستلام المشترك، وإصدار شهادة الدفاع المدني المعتمدة."}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  readiness.isSealed
                    ? "success"
                    : readiness.canSeal
                    ? "default"
                    : "outline"
                }
                className="text-xs px-3 py-1 font-semibold uppercase tracking-wider"
              >
                {readiness.isSealed
                  ? "مختوم ومحمي قانونياً"
                  : readiness.canSeal
                  ? "جاهز للختم النهائي"
                  : "قيد استكمال المتطلبات"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadClosureData}
                className="h-8 w-8 p-0"
                title="تحديث الحالة"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Readiness Indicators Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-secondary/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                المهام الميدانية المفتوحة
              </span>
              <span
                className={`text-base font-bold ${
                  readiness.outstandingTasks > 0 ? "text-destructive" : "text-emerald-600"
                }`}
              >
                {readiness.outstandingTasks === 0 ? "مكتملة بالكامل" : `${readiness.outstandingTasks} معلقة`}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-secondary/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                قائمة المعاينة SBC 801
              </span>
              <span
                className={`text-base font-bold ${
                  readiness.outstandingPunchListItems > 0
                    ? "text-destructive"
                    : "text-emerald-600"
                }`}
              >
                {readiness.outstandingPunchListItems === 0
                  ? "مطابقة 100%"
                  : `${readiness.outstandingPunchListItems} بحاجة لفحص`}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-secondary/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                توقيع العميل (الطرف أ)
              </span>
              <span
                className={`text-base font-bold ${
                  readiness.isClientSigned ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {readiness.isClientSigned ? "معتمد وموقع" : "في انتظار التوقيع"}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-secondary/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                توقيع المدير (الطرف ب)
              </span>
              <span
                className={`text-base font-bold ${
                  readiness.isManagerSigned ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {readiness.isManagerSigned ? "معتمد وموقع" : "في انتظار التوقيع"}
              </span>
            </div>
          </div>

          {/* Blockers alert if any */}
          {readiness.blockers && readiness.blockers.length > 0 && !readiness.isSealed && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <div className="space-y-1">
                <p className="font-semibold">المتطلبات المتبقية لتمكين الإغلاق القانوني:</p>
                <ul className="list-disc list-inside space-y-0.5 opacity-90">
                  {readiness.blockers.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sealed Certificate Display */}
          {readiness.isSealed && certificate && (
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      شهادة إتمام وتوافق أنظمة السلامة
                    </h4>
                    <p className="text-xs font-mono text-muted-foreground">
                      {certificate.certificateNumber}
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="text-xs px-3 py-1 font-mono">
                  SBC 801 COMPLIANT
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    صافي قيمة العقد
                  </span>
                  <span className="font-bold text-foreground">
                    {certificate.finalContractNet.toLocaleString()} ر.س
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    التكلفة المباشرة الإجمالية
                  </span>
                  <span className="font-bold text-foreground">
                    {certificate.finalTotalCost.toLocaleString()} ر.س
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    هامش الربح الصافي
                  </span>
                  <span className="font-bold text-emerald-600">
                    {certificate.finalNetMarginAmount.toLocaleString()} ر.س (
                    {certificate.finalNetMarginPercent}%)
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    الأرشيف الميداني المحمي
                  </span>
                  <span className="font-bold text-foreground">
                    {certificate.archivedPhotoCount} صور • {certificate.archivedTaskCount} مهام
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar for Signing & Sealing */}
          {!readiness.isSealed && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!readiness.isClientSigned && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setClientSignModalOpen(true)}
                  className="gap-2 text-xs border-primary/30 hover:border-primary"
                >
                  <PenTool className="h-3.5 w-3.5 text-primary" />
                  تسجيل توقيع العميل (الطرف أ)
                </Button>
              )}

              {!readiness.isManagerSigned && isEngineerOrAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setManagerSignModalOpen(true)}
                  className="gap-2 text-xs border-primary/30 hover:border-primary"
                >
                  <Stamp className="h-3.5 w-3.5 text-primary" />
                  اعتماد وتوقيع مدير السلامة (الطرف ب)
                </Button>
              )}

              {readiness.canSeal && isEngineerOrAdmin && (
                <Button
                  size="sm"
                  onClick={() => setSealConfirmOpen(true)}
                  className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-semibold"
                >
                  <Lock className="h-3.5 w-3.5" />
                  ختم المشروع نهائياً وإصدار الشهادة
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SBC 801 Punch List Section */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-primary" />
                قائمة الفحص والمطابقة للكود السعودي (SBC 801 Punch List)
              </CardTitle>
              <CardDescription className="text-xs">
                بنود التحقق الإلزامية لأنظمة الإطفاء والإنذار ومخارج الطوارئ قبل التسليم النهائي.
              </CardDescription>
            </div>

            {punchList.length === 0 && isEngineerOrAdmin && (
              <Button
                size="sm"
                onClick={handleApplyStandardChecklist}
                disabled={applyingStandard}
                isLoading={applyingStandard}
                className="gap-1.5 text-xs bg-primary text-primary-foreground"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                تطبيق بنود كود الحريق السعودي SBC 801
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {punchList.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
              <p className="text-sm font-semibold text-foreground">
                لم يتم إدراج بنود فحص السلامة بعد
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                يمكنك تطبيق قائمة المعايير القياسية المعتمدة طبقاً للكود السعودي للحماية من الحرائق
                (SBC 801) بضغطة واحدة.
              </p>
              {isEngineerOrAdmin && (
                <Button
                  size="sm"
                  onClick={handleApplyStandardChecklist}
                  disabled={applyingStandard}
                  isLoading={applyingStandard}
                  className="mt-2 text-xs"
                >
                  تطبيق معايير SBC 801 القياسية
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {punchList.map((item, index) => {
                const isPassed = item.status === PunchListItemStatus.Passed;
                const isFailed = item.status === PunchListItemStatus.Failed;
                const isPending = item.status === PunchListItemStatus.Pending;
                const isNA = item.status === PunchListItemStatus.NotApplicable;

                return (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/5 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {item.description}
                        </span>
                        {item.standardReference && (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {item.standardReference}
                          </Badge>
                        )}
                      </div>

                      {item.inspectorNotes && (
                        <p className="text-xs text-muted-foreground italic ps-5">
                          ملاحظات المهندس: {item.inspectorNotes}
                        </p>
                      )}

                      {item.inspectedByName && (
                        <p className="text-[10px] text-muted-foreground ps-5">
                          تم الفحص بواسطة: {item.inspectedByName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          isPassed
                            ? "success"
                            : isFailed
                            ? "destructive"
                            : isNA
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs px-2.5 py-0.5"
                      >
                        {isPassed
                          ? "مطابق ومجاز"
                          : isFailed
                          ? "غير مطابق"
                          : isNA
                          ? "غير منطبق"
                          : "قيد المعاينة"}
                      </Badge>

                      {isEngineerOrAdmin && !readiness.isSealed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPunchItem(item);
                            setInspectionVerdict(item.status);
                            setInspectionNotes(item.inspectorNotes || "");
                            setInspectModalOpen(true);
                          }}
                          className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        >
                          تسجيل الفحص
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspect Item Modal */}
      <Dialog open={inspectModalOpen} onOpenChange={setInspectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تسجيل نتيجة الفحص الهندسي للبند</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedPunchItem?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">قرار المطابقة الهندسية</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={
                    inspectionVerdict === PunchListItemStatus.Passed ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setInspectionVerdict(PunchListItemStatus.Passed)}
                  className={`text-xs ${
                    inspectionVerdict === PunchListItemStatus.Passed
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : ""
                  }`}
                >
                  مطابق (Passed)
                </Button>
                <Button
                  type="button"
                  variant={
                    inspectionVerdict === PunchListItemStatus.Failed ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setInspectionVerdict(PunchListItemStatus.Failed)}
                  className={`text-xs ${
                    inspectionVerdict === PunchListItemStatus.Failed
                      ? "bg-destructive text-destructive-foreground"
                      : ""
                  }`}
                >
                  مرفوض (Failed)
                </Button>
                <Button
                  type="button"
                  variant={
                    inspectionVerdict === PunchListItemStatus.NotApplicable
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setInspectionVerdict(PunchListItemStatus.NotApplicable)}
                  className="text-xs"
                >
                  غير منطبق (N/A)
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inspect-notes" className="text-xs font-semibold">
                ملاحظات المهندس الفاحص والتوصيات
              </Label>
              <Textarea
                id="inspect-notes"
                rows={3}
                placeholder="أدخل أي ملاحظات فنية أو قياسات تم رصدها بالموقع..."
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInspectModalOpen(false)}
              disabled={submittingInspection}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleSaveInspectionVerdict}
              isLoading={submittingInspection}
              disabled={submittingInspection}
            >
              حفظ النتيجة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Sign Ceremony Modal */}
      <Dialog open={clientSignModalOpen} onOpenChange={setClientSignModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-primary" />
              مراسم توقيع واعتماد العميل (الطرف الأول)
            </DialogTitle>
            <DialogDescription className="text-xs">
              إقرار استلام الأعمال الميدانية ومطابقة أنظمة الإطفاء والإنذار.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="client-rep-name" className="text-xs font-semibold">
                اسم ممثل العميل المفوض *
              </Label>
              <Input
                id="client-rep-name"
                value={clientRepName}
                onChange={(e) => setClientRepName(e.target.value)}
                placeholder="الاسم الثلاثي لممثل العميل..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">لوحة التوقيع الحي *</Label>
              <SignaturePad
                value={clientSignature}
                onChange={(val) => setClientSignature(val)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClientSignModalOpen(false)}
              disabled={submittingClientSign}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitClientSignature}
              disabled={submittingClientSign || !clientSignature || !clientRepName.trim()}
              isLoading={submittingClientSign}
            >
              توثيق توقيع العميل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Sign Ceremony Modal */}
      <Dialog open={managerSignModalOpen} onOpenChange={setManagerSignModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stamp className="h-5 w-5 text-primary" />
              اعتماد وتوقيع مدير السلامة المعتمد (الطرف الثاني)
            </DialogTitle>
            <DialogDescription className="text-xs">
              التوقيع الهندسي الرسمي لإصدار شهادة الدفاع المدني وإغلاق العقد.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">لوحة التوقيع الرقمي للمدير *</Label>
              <SignaturePad
                value={managerSignature}
                onChange={(val) => setManagerSignature(val)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManagerSignModalOpen(false)}
              disabled={submittingManagerSign}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitManagerSignature}
              disabled={submittingManagerSign || !managerSignature}
              isLoading={submittingManagerSign}
            >
              توثيق توقيع الإدارة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Sealing Confirmation Alert Dialog */}
      <AlertDialog open={sealConfirmOpen} onOpenChange={setSealConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              تأكيد الختم النهائي للمشروع وتجميد التعديلات
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-xs">
              <p>
                هذا الإجراء نهائي وغير قابل للتراجع. سيتم نقل كافة سجلات المشروع ومرفقاته إلى خزينة
                الأمان الرقمية (Immutability Vault) وقفل أي إمكانية للتعديل أو الحذف، وتوليد شهادة
                السلامة الرسمية برقم تسلسلي موثق.
              </p>
              <p className="font-semibold text-foreground">
                هل أنت متأكد من اكتمال كافة الأعمال الميدانية والمالية والختم النهائي؟
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submittingSeal}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
              onClick={handleSealProject}
              disabled={submittingSeal}
            >
              {submittingSeal ? "جاري الختم وتوليد الشهادة..." : "تأكيد الختم النهائي"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default LegalClosureHub;
