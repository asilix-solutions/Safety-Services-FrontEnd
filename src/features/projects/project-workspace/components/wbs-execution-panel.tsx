"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  fieldOpsApi,
  ExecutionPlanDto,
  FieldTaskDto,
  FieldPhotoDto,
  TaskStatus,
} from "@/domains/field-ops/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/shared/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog";
import {
  Kanban,
  CheckCircle2,
  Clock,
  Play,
  CheckSquare,
  Upload,
  Camera,
  RefreshCw,
  MapPin,
  Layers,
  FileCheck,
} from "lucide-react";
import { alertService } from "@/services/alert-notification";

interface WbsExecutionPanelProps {
  projectId: string;
}

export function WbsExecutionPanel({ projectId }: WbsExecutionPanelProps) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<ExecutionPlanDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [applyingStandard, setApplyingStandard] = useState(false);

  // Submit Task Dialog
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<FieldTaskDto | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  // Photo Upload Dialog
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Photos view dialog
  const [viewPhotosDialogOpen, setViewPhotosDialogOpen] = useState(false);
  const [taskPhotos, setTaskPhotos] = useState<FieldPhotoDto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const isStaff =
    user?.role === "Super Admin" ||
    user?.role === "Company Admin" ||
    user?.role === "Consulting Engineer" ||
    user?.role === "Operations Officer";

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await fieldOpsApi.getExecutionPlan(projectId);
      if (res.isSuccess && res.data) {
        setPlan(res.data);
      } else {
        setPlan(null);
      }
    } catch (err: any) {
      console.warn("Could not query execution plan from live backend:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchPlan();
    }
  }, [projectId]);

  const handleApplyStandardWbs = async () => {
    try {
      setApplyingStandard(true);
      const res = await fieldOpsApi.applyStandardSections(projectId);
      if (res.isSuccess) {
        alertService.showSuccess("تم تطبيق هيكل تجزئة العمل القياسي (Standard WBS)");
        fetchPlan();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في تطبيق مراحل WBS", err.message);
    } finally {
      setApplyingStandard(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const res = await fieldOpsApi.startTask(taskId);
      if (res.isSuccess) {
        alertService.showSuccess("تم بدء المهمة الميدانية وتسجيل وقت الانطلاق");
        fetchPlan();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في بدء المهمة", err.message);
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask) return;
    try {
      setSubmittingTask(true);
      const res = await fieldOpsApi.submitTask(selectedTask.id, submissionNotes.trim() || undefined);
      if (res.isSuccess) {
        alertService.showSuccess("تم تسليم المهمة بنجاح وبانتظار اعتماد المشرف");
        setSubmitDialogOpen(false);
        setSelectedTask(null);
        setSubmissionNotes("");
        fetchPlan();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في تسليم المهمة", err.message);
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !photoFile) return;

    try {
      setUploadingPhoto(true);
      const res = await fieldOpsApi.uploadTaskPhoto(
        selectedTask.id,
        photoFile,
        latitude,
        longitude
      );

      if (res.isSuccess) {
        alertService.showSuccess(
          "تم رفع الصورة الميدانية والتحقق من الموقع الجغرافي",
          "تم توثيق إحداثيات الموقع EXIF بنجاح."
        );
        setPhotoDialogOpen(false);
        setPhotoFile(null);
        fetchPlan();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في رفع الصورة الميدانية", err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleViewPhotos = async (task: FieldTaskDto) => {
    try {
      setSelectedTask(task);
      setLoadingPhotos(true);
      setViewPhotosDialogOpen(true);
      const res = await fieldOpsApi.getTaskPhotos(task.id);
      if (res.isSuccess && res.data) {
        setTaskPhotos(res.data);
      } else {
        setTaskPhotos([]);
      }
    } catch (err: any) {
      alertService.showError("فشل في جلب صور المهمة", err.message);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const formatTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Planned:
        return <Badge variant="outline" className="text-[10px]">مخططة (Planned)</Badge>;
      case TaskStatus.InProgress:
        return <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">قيد التنفيذ (In Progress)</Badge>;
      case TaskStatus.Submitted:
        return <Badge variant="default" className="text-[10px]">بانتظار الاعتماد (Submitted)</Badge>;
      case TaskStatus.Approved:
        return <Badge variant="success" className="text-[10px]">معتمدة ومطابقة (Approved)</Badge>;
      case TaskStatus.Rejected:
        return <Badge variant="destructive" className="text-[10px]">مرفوضة (Rejected)</Badge>;
      case TaskStatus.Blocked:
        return <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">معلقة (Blocked)</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">حالة {status}</Badge>;
    }
  };

  if (!plan) return null;

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Kanban className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-base font-bold">
                خطة التنفيذ الميداني وإدارة المهام (WBS Execution Plan)
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">
                {plan.progressPercent}% إنجاز
              </Badge>
            </div>
            <CardDescription className="text-xs">
              متابعة المهام التنفيذية الميدانية، الفنيين المخصصين، والتوثيق الجغرافي بالصور.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPlan}
              disabled={loading}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </Button>

            {plan.sections.length === 0 && isStaff && (
              <Button
                size="sm"
                onClick={handleApplyStandardWbs}
                disabled={applyingStandard}
                isLoading={applyingStandard}
                className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground"
              >
                <Layers className="h-3.5 w-3.5" />
                تطبيق هيكل WBS القياسي
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>نسبة الإنجاز الميداني التراكمي</span>
            <span className="font-mono text-primary">{plan.progressPercent}%</span>
          </div>
          <Progress value={plan.progressPercent} className="h-2" />
        </div>

        {/* Tasks List */}
        {plan.tasks.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-lg">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground stroke-1" />
            <p className="font-semibold text-foreground">لم يتم ربط مهام ميدانية بعد</p>
            <p>يمكنك تطبيق هيكل WBS القياسي لإنشاء مراحل العمل والمهام تلقائياً.</p>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {plan.tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/5 transition-colors text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{task.title}</span>
                    {formatTaskStatusBadge(task.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    {task.workerName && (
                      <span>
                        الفني المسؤول: <strong className="text-foreground">{task.workerName}</strong>
                      </span>
                    )}
                    <span>
                      تاريخ التخطيط:{" "}
                      <span className="font-mono">
                        {new Date(task.plannedDateUtc).toLocaleDateString("ar-SA")}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewPhotos(task)}
                    className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    الصور
                  </Button>

                  {isStaff && task.status === TaskStatus.Planned && (
                    <Button
                      size="sm"
                      onClick={() => handleStartTask(task.id)}
                      className="h-7 text-[11px] gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Play className="h-3 w-3" />
                      بدء المهمة
                    </Button>
                  )}

                  {isStaff && task.status === TaskStatus.InProgress && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setPhotoDialogOpen(true);
                        }}
                        className="h-7 text-[11px] gap-1 text-primary border-primary/30"
                      >
                        <Upload className="h-3 w-3" />
                        إرفاق صورة
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setSubmitDialogOpen(true);
                        }}
                        className="h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckSquare className="h-3 w-3" />
                        تسليم المهمة
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Submit Task Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تسليم المهمة الميدانية للمعاينة</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">ملاحظات الإنجاز الميداني</Label>
              <Input
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات فنية حول تنفيذ المهمة..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitDialogOpen(false)}
              disabled={submittingTask}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitTask}
              disabled={submittingTask}
              isLoading={submittingTask}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              تأكيد التسليم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Geotagged Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              رفع صورة ميدانية موثقة جغرافياً
            </DialogTitle>
            <DialogDescription className="text-xs">
              يتم استخراج إحداثيات GPS للتحقق من التواجد الفعلي بموقع المشروع.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadPhoto} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">ملف الصورة (JPG / PNG) *</Label>
              <Input
                required
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhotoFile(file);
                }}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">خط العرض (Latitude)</Label>
                <Input
                  type="number"
                  step="any"
                  value={latitude !== undefined ? latitude : ""}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || undefined)}
                  placeholder="24.7136"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">خط الطول (Longitude)</Label>
                <Input
                  type="number"
                  step="any"
                  value={longitude !== undefined ? longitude : ""}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || undefined)}
                  placeholder="46.6753"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhotoDialogOpen(false)}
                disabled={uploadingPhoto}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={uploadingPhoto || !photoFile}
                isLoading={uploadingPhoto}
              >
                رفع وتوثيق الصورة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Photos Viewer Dialog */}
      <Dialog open={viewPhotosDialogOpen} onOpenChange={setViewPhotosDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>الصور الميدانية للمهمة</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>

          {loadingPhotos ? (
            <div className="py-8 text-center text-muted-foreground text-xs">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
              جاري تحميل الصور...
            </div>
          ) : taskPhotos.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              لم يتم رفع صور لهذه المهمة حتى الآن.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              {taskPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-lg border border-border overflow-hidden bg-card space-y-1.5 p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.photoUrl}
                    alt="Task verification"
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="flex items-center justify-between text-[10px]">
                    <Badge
                      variant={photo.isVerified ? "success" : "outline"}
                      className="text-[9px]"
                    >
                      {photo.isVerified ? "موقع جغرافي معتمد" : "قيد المراجعة"}
                    </Badge>
                    <span className="text-muted-foreground font-mono">
                      {new Date(photo.uploadedAtUtc).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewPhotosDialogOpen(false)}
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default WbsExecutionPanel;
