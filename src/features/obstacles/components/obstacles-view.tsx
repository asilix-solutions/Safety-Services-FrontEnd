"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Building,
  User,
  Check,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "sonner";

interface SiteObstacle {
  id: string;
  title: string;
  description: string;
  facilityName: string;
  jobNumber: string;
  reportedBy: string;
  reportedAt: string;
  severity: "BLOCKING" | "DELAYING" | "MINOR";
  status: "OPENED" | "TRIAGED" | "ESCALATED" | "RESOLVED";
  assignedOfficer?: string;
  resolutionNotes?: string;
}

const INITIAL_OBSTACLES: SiteObstacle[] = [
  {
    id: "obs-01",
    title: "تمديدات مجاري تكييف تعيق مسار شبكة أنابيب الرشاشات",
    description: "قام مقاول التكييف بتمديد قنوات هواء رئيسية في السقف المستعار بمستوى يتعارض مع المسار المعتمد في المخطط الهندسي لكود SBC 801.",
    facilityName: "مستودعات الخليج للخدمات اللوجستية",
    jobNumber: "AMX-2026-8812",
    reportedBy: "فني فهد السبيعي",
    reportedAt: "منذ ساعتين",
    severity: "BLOCKING",
    status: "OPENED",
  },
  {
    id: "obs-02",
    title: "انقطاع التيار الكهربائي المخصص للوحة الإنذار الرئيسية",
    description: "عدم تفعيل القاطع الكهربائي المخصص للوحة إنذار الحريق المركزية من قبل الاستشاري المشرف على الموقع.",
    facilityName: "برج الأعمال التنفيذي",
    jobNumber: "AMX-2026-8815",
    reportedBy: "فني خالد الحربي",
    reportedAt: "منذ 5 ساعات",
    severity: "DELAYING",
    status: "TRIAGED",
    assignedOfficer: "مسؤول عمليات شركة السلامة",
  },
  {
    id: "obs-03",
    title: "إغلاق مخرج الطوارئ بمخلفات بناء وتشطيب",
    description: "وجود مواد بناء تعيق مسار الهروب المؤدي للمخرج الجنوبي، وتم توثيق المخالفة برفع صور الموقع.",
    facilityName: "فندق البيلسان الدولي",
    jobNumber: "AMX-2026-8790",
    reportedBy: "م. أحمد الشمري",
    reportedAt: "منذ يوم واحد",
    severity: "BLOCKING",
    status: "ESCALATED",
    assignedOfficer: "المدير العام لشركة السلامة",
  },
  {
    id: "obs-04",
    title: "تعديل في التقسيم الداخلي للمكاتب الإدارية",
    description: "تم نقل بعض الحواجز الزجاجية مما يتطلب إعادة توزيع كواشف الدخان في الطابق الثالث.",
    facilityName: "مجمع النخيل الطبي",
    jobNumber: "AMX-2026-8772",
    reportedBy: "م. فهد القحطاني",
    reportedAt: "منذ 3 أيام",
    severity: "MINOR",
    status: "RESOLVED",
    assignedOfficer: "م. فهد القحطاني",
    resolutionNotes: "تم التنسيق مع العميل وتحديث المخطط التنفيذي وتوزيع الكواشف بنجاح.",
  },
];

const SEVERITY_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  BLOCKING: { label: "حرج - معطل للتنفيذ", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200", color: "text-rose-600" },
  DELAYING: { label: "متوسط - تأخير زمني", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200", color: "text-amber-600" },
  MINOR: { label: "ملحوظة عادية", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200", color: "text-blue-600" },
};

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  OPENED: { label: "مفتوح حديثاً", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200" },
  TRIAGED: { label: "قيد المتابعة والفرز", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200" },
  ESCALATED: { label: "مصعد للإدارة العليا", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200" },
  RESOLVED: { label: "تم الحل واستئناف العمل", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200" },
};

export function ObstaclesView() {
  const [obstacles, setObstacles] = useState<SiteObstacle[]>(INITIAL_OBSTACLES);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [resolvingObstacle, setResolvingObstacle] = useState<SiteObstacle | null>(null);
  const [resolutionText, setResolutionText] = useState("");

  const openCount = obstacles.filter((o) => o.status !== "RESOLVED").length;
  const blockingCount = obstacles.filter((o) => o.severity === "BLOCKING" && o.status !== "RESOLVED").length;

  const handleTriage = (id: string) => {
    setObstacles((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "TRIAGED", assignedOfficer: "مسؤول العمليات الميدانية" } : o
      )
    );
    toast.success("تم استلام العائق وتعيين مسؤول العمليات للمتابعة الميدانية");
  };

  const handleEscalate = (id: string) => {
    setObstacles((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "ESCALATED", assignedOfficer: "المدير العام لشركة السلامة" } : o
      )
    );
    toast.warning("تم تصعيد العائق للإدارة العليا لطلب التنسيق مع المقاول الرئيسي");
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingObstacle || !resolutionText.trim()) {
      toast.error("يرجى كتابة بيان المعالجة والمبررات الهندسية لفك التعليق");
      return;
    }

    setObstacles((prev) =>
      prev.map((o) =>
        o.id === resolvingObstacle.id
          ? { ...o, status: "RESOLVED", resolutionNotes: resolutionText.trim() }
          : o
      )
    );

    toast.success("تم حل العائق واستئناف مهام التنفيذ الميدانية للمشروع");
    setResolvingObstacle(null);
    setResolutionText("");
  };

  const filtered = obstacles.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.facilityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || o.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">إدارة عوائق ومخاطر المواقع الميدانية</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            منظومة تصعيد ومتابعة العوائق الميدانية التي تعيق تنفيذ اشتراطات كود البناء السعودي مع التوثيق بالصور.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("تم تحديث قائمة العوائق الميدانية اللحظية")}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">عوائق نشطة جارية</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{openCount} عوائق</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">عوائق حرجة معطلة للمشروع</p>
              <h3 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {blockingCount} عائق حرج
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">عوائق تم حلها هذا الأسبوع</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">12 عائق</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">متوسط زمن المعالجة والحل</p>
              <h3 className="text-2xl font-bold tracking-tight text-primary">6.4 ساعات</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بعنوان العائق، رقم المعاملة، أو المنشأة..."
              className="ps-9 rounded-xl border-border"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSeverityFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                severityFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              الكل ({obstacles.length})
            </button>
            <button
              onClick={() => setSeverityFilter("BLOCKING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                severityFilter === "BLOCKING"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              حرجة معطلة
            </button>
            <button
              onClick={() => setSeverityFilter("DELAYING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                severityFilter === "DELAYING"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              تأخير متوسط
            </button>
            <button
              onClick={() => setSeverityFilter("MINOR")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                severityFilter === "MINOR"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              ملحوظات عادية
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Obstacles Cards List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((obs) => {
            const sev = SEVERITY_CONFIG[obs.severity];
            const stat = STATUS_CONFIG[obs.status];

            return (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
              >
                <Card
                  className={`rounded-2xl border transition-all ${
                    obs.status === "RESOLVED"
                      ? "border-border/60 bg-card/60 opacity-80"
                      : "border-border shadow-sm hover:shadow-md"
                  }`}
                >
                  <CardContent className="p-5 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${sev.badge}`}>
                            {sev.label}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${stat.badge}`}>
                            {stat.label}
                          </span>
                          <span className="font-mono text-xs font-semibold text-primary">
                            {obs.jobNumber}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground leading-snug pt-1">
                          {obs.title}
                        </h3>
                      </div>

                      <div className="text-xs text-muted-foreground shrink-0">
                        <span>{obs.reportedAt}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/60">
                      {obs.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">{obs.facilityName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>المبلّغ: {obs.reportedBy}</span>
                        </div>
                        {obs.assignedOfficer && (
                          <div className="flex items-center gap-1.5 text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>المسؤول: {obs.assignedOfficer}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {obs.status === "OPENED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTriage(obs.id)}
                            className="h-8 text-xs rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                          >
                            استلام المعالجة (Triage)
                          </Button>
                        )}

                        {obs.status !== "RESOLVED" && obs.status !== "ESCALATED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEscalate(obs.id)}
                            className="h-8 text-xs rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          >
                            تصعيد للإدارة العليا
                          </Button>
                        )}

                        {obs.status !== "RESOLVED" ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setResolvingObstacle(obs);
                              setResolutionText("");
                            }}
                            className="h-8 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            حل العائق واستئناف العمل
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            تم حل العائق واستئناف المهام
                          </span>
                        )}
                      </div>
                    </div>

                    {obs.resolutionNotes && (
                      <div className="mt-2 text-xs bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-800 dark:text-emerald-300">
                        <span className="font-semibold block mb-0.5">بيان المعالجة الهندسية:</span>
                        {obs.resolutionNotes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={!!resolvingObstacle} onOpenChange={() => setResolvingObstacle(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              تأكيد حل العائق الميداني
            </DialogTitle>
            <DialogDescription>
              تسجيل بيان المعالجة الهندسية لفك إيقاف المهمة واستئناف العمل الميداني.
            </DialogDescription>
          </DialogHeader>

          {resolvingObstacle && (
            <form onSubmit={handleResolveSubmit} className="space-y-4 pt-2">
              <div className="p-3 bg-muted/50 rounded-xl border border-border text-xs space-y-1">
                <span className="font-mono text-primary font-semibold block">{resolvingObstacle.jobNumber}</span>
                <span className="font-bold text-foreground block">{resolvingObstacle.title}</span>
                <span className="text-muted-foreground block">{resolvingObstacle.facilityName}</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">بيان المعالجة والمبرر الهندسي (إلزامي)</Label>
                <Textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="مثال: تم التنسيق مع المقاول وتم تعديل مسار قنوات التكييف وتثبيت أنابيب الإطفاء بارتفاع 2.8م مطابقاً لـ SBC 801..."
                  rows={4}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setResolvingObstacle(null)} className="rounded-xl">
                  إلغاء
                </Button>
                <Button type="submit" variant="default" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                  تأكيد الحل واستئناف العمل
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
