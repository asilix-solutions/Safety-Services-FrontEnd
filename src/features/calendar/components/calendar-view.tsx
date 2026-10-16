"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Building,
  Filter,
  Eye,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";

interface InspectionEvent {
  id: string;
  title: string;
  facilityName: string;
  jobNumber: string;
  date: string; // YYYY-MM-DD
  time: string;
  inspectorName: string;
  category: "SPRINKLER" | "FIRE_ALARM" | "EVACUATION" | "MAINTENANCE";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  location: string;
  notes?: string;
}

const SAMPLE_EVENTS: InspectionEvent[] = [
  {
    id: "evt-01",
    title: "فحص واختبار شبكة الرشاشات ومضخات الحريق",
    facilityName: "مستودعات الخليج للخدمات اللوجستية",
    jobNumber: "AMX-2026-8812",
    date: "2026-10-16",
    time: "09:30 ص",
    inspectorName: "م. أحمد الشمري (استشاري معتمد)",
    category: "SPRINKLER",
    status: "SCHEDULED",
    location: "الرياض - المنطقة الصناعية الثانية",
    notes: "فحص ضغط شبكة الأنابيب الرئيسية واختبار مضخة الديزل الاحتياطية.",
  },
  {
    id: "evt-02",
    title: "معاينة هندسية لمخارج الطوارئ ومسالك الهروب",
    facilityName: "برج الأعمال التنفيذي",
    jobNumber: "AMX-2026-8815",
    date: "2026-10-16",
    time: "01:00 م",
    inspectorName: "م. فهد القحطاني",
    category: "EVACUATION",
    status: "IN_PROGRESS",
    location: "الرياض - حي العليا",
    notes: "مطابقة المخطط التنفيذي مع متطلبات كود البناء السعودي SBC 801.",
  },
  {
    id: "evt-03",
    title: "صيانة وقائية دورية لنظام الإنذار المبكر",
    facilityName: "مجمع النخيل الطبي التخصصي",
    jobNumber: "MNT-2026-0041",
    date: "2026-10-18",
    time: "10:00 ص",
    inspectorName: "فني فهد السبيعي",
    category: "MAINTENANCE",
    status: "SCHEDULED",
    location: "الرياض - حي الملز",
    notes: "اختبار كواشف الدخان والحرارة والتأكد من لوحة التحكم المركزية.",
  },
  {
    id: "evt-04",
    title: "اختبار جاهزية أنظمة الإطفاء بالغاز FM200",
    facilityName: "مركز بيانات السحابية المتقدمة",
    jobNumber: "AMX-2026-8804",
    date: "2026-10-19",
    time: "11:30 ص",
    inspectorName: "م. أحمد الشمري",
    category: "FIRE_ALARM",
    status: "SCHEDULED",
    location: "الرياض - واحة التقنية",
    notes: "معايرة أسطوانات الغاز وحساسات الضغط في غرف الخوادم الرئيسية.",
  },
  {
    id: "evt-05",
    title: "استلام نهائي وإصدار شهادة الامتثال",
    facilityName: "فندق البيلسان الدولي",
    jobNumber: "AMX-2026-8790",
    date: "2026-10-14",
    time: "02:00 م",
    inspectorName: "م. عبد العزيز بن سلطان",
    category: "SPRINKLER",
    status: "COMPLETED",
    location: "الرياض - طريق الملك فهد",
    notes: "تم التوثيق ورفع تقرير EXIF وصور الـ GPS وإصدار شهادة السلامة.",
  },
];

const CATEGORY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  SPRINKLER: { label: "شبكات إطفاء ورشاشات", bg: "bg-red-500/10 border-red-500/30", text: "text-red-600 dark:text-red-400" },
  FIRE_ALARM: { label: "إنذار وكشف مبكر", bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-600 dark:text-orange-400" },
  EVACUATION: { label: "مخارج ومسالك هروب", bg: "bg-indigo-500/10 border-indigo-500/30", text: "text-indigo-600 dark:text-indigo-400" },
  MAINTENANCE: { label: "صيانة دورية وقائية", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400" },
};

const STATUS_STYLES: Record<string, { label: string; badge: string }> = {
  SCHEDULED: { label: "مجدولة", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200" },
  IN_PROGRESS: { label: "قيد التنفيذ حالياً", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200" },
  COMPLETED: { label: "مكتملة وموثقة", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200" },
  DELAYED: { label: "متأخرة", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200" },
};

export function CalendarView() {
  const [events, setEvents] = useState<InspectionEvent[]>(SAMPLE_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<InspectionEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newFacility, setNewFacility] = useState("");
  const [newDate, setNewDate] = useState("2026-10-20");
  const [newTime, setNewTime] = useState("10:00 ص");
  const [newInspector, setNewInspector] = useState("م. أحمد الشمري");
  const [newCategory, setNewCategory] = useState<"SPRINKLER" | "FIRE_ALARM" | "EVACUATION" | "MAINTENANCE">("SPRINKLER");
  const [newLocation, setNewLocation] = useState("");

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newFacility) {
      toast.error("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    const event: InspectionEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle,
      facilityName: newFacility,
      jobNumber: `AMX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: newDate,
      time: newTime,
      inspectorName: newInspector,
      category: newCategory,
      status: "SCHEDULED",
      location: newLocation || "الرياض",
      notes: "زيارة فحص مجدولة حديثاً عبر لوحة التحكم.",
    };

    setEvents((prev) => [event, ...prev]);
    setIsAddModalOpen(false);
    toast.success("تم حجز موعد الزيارة الميدانية وتكليف المهندس بنجاح");

    // Reset Form
    setNewTitle("");
    setNewFacility("");
    setNewLocation("");
  };

  const filteredEvents = filterCategory === "ALL" 
    ? events 
    : events.filter((e) => e.category === filterCategory);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">جدول الزيارات الميدانية والصيانة الوقائية</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            تنسيق وجدولة زيارات المعاينة الهندسية، واختبارات الإطفاء الدورية، وفرق التفتيش الميداني.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
            جدولة زيارة جديدة
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">زيارات اليوم المجدولة</p>
              <h3 className="text-2xl font-bold tracking-tight">2 زيارات</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">زيارات مكتملة هذا الأسبوع</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">14 زيارة</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">صيانة وقائية دورية مستحقة</p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">6 عقود</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">المهندسين الميدانيين النشطين</p>
              <h3 className="text-2xl font-bold tracking-tight text-primary">8 مهندسين</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <User className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between overflow-x-auto gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => setFilterCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterCategory === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              جميع الزيارات ({events.length})
            </button>
            {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filterCategory === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events Agenda Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((evt) => {
            const catStyle = CATEGORY_STYLES[evt.category];
            const statusStyle = STATUS_STYLES[evt.status];

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
              >
                <Card className="rounded-2xl border-border/80 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${catStyle.bg} ${catStyle.text}`}>
                        {catStyle.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusStyle.badge}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold text-foreground leading-snug">
                      {evt.title}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1.5 mt-1 font-mono text-primary">
                      {evt.jobNumber}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs">
                    <div className="p-3 bg-muted/40 rounded-xl space-y-2 border border-border">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{evt.facilityName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="font-semibold text-foreground">{evt.date} - {evt.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[120px]">{evt.inspectorName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvent(evt)}
                        className="w-full rounded-xl gap-1.5 text-xs h-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        معاينة تفاصيل الموعد
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              تفاصيل زيارة التفتيش الميداني
            </DialogTitle>
            <DialogDescription>
              رقم المعاملة: {selectedEvent?.jobNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2.5">
                <div>
                  <span className="text-xs text-muted-foreground block">المنشأة المستهدفة:</span>
                  <span className="font-semibold text-foreground text-base">{selectedEvent.facilityName}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">نوع المهمة:</span>
                  <span className="font-medium text-foreground">{selectedEvent.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground block">التاريخ والوقت:</span>
                    <span className="font-medium text-foreground">{selectedEvent.date} ({selectedEvent.time})</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">المهندس المسؤول:</span>
                    <span className="font-medium text-foreground">{selectedEvent.inspectorName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">الموقع الجغرافي:</span>
                  <span className="font-medium text-foreground">{selectedEvent.location}</span>
                </div>
                {selectedEvent.notes && (
                  <div>
                    <span className="text-xs text-muted-foreground block">تعليمات الفحص:</span>
                    <p className="text-xs text-muted-foreground bg-background p-2 rounded-lg mt-1 border border-border">
                      {selectedEvent.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="default"
                  onClick={() => {
                    toast.success("تم إرسال تذكير فوري للمهندس ومسؤول المنشأة");
                    setSelectedEvent(null);
                  }}
                  className="rounded-xl"
                >
                  إرسال تذكير للمهندس والعميل
                </Button>
                <Button variant="outline" onClick={() => setSelectedEvent(null)} className="rounded-xl">
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Event Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              جدولة زيارة تفتيش ميداني جديدة
            </DialogTitle>
            <DialogDescription>
              تحديد موعد المعاينة وتكليف المهندس أو الفني الميداني المعتمد.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEvent} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">عنوان المهمة / نوع الزيارة</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: فحص واختبار شبكة الرشاشات الآلية"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">اسم المنشأة أو العميل</Label>
              <Input
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                placeholder="مثال: شركة التطوير العقاري - برج 3"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">تاريخ الزيارة</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">الوقت المحدد</Label>
                <Input
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="مثال: 10:00 ص"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">تصنيف نظام السلامة</Label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="SPRINKLER">شبكات إطفاء ورشاشات مائية (NFPA 13)</option>
                <option value="FIRE_ALARM">أنظمة إنذار وكشف مبكر (NFPA 72)</option>
                <option value="EVACUATION">مخارج طوارئ ومسالك هروب (SBC 801)</option>
                <option value="MAINTENANCE">صيانة وقائية دورية</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">المهندس / الفني المسؤول</Label>
              <Input
                value={newInspector}
                onChange={(e) => setNewInspector(e.target.value)}
                placeholder="اسم المهندس"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">الموقع الجغرافي / العنوان</Label>
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="مثال: الرياض - طريق الملك فهد"
                className="rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
                إلغاء
              </Button>
              <Button type="submit" variant="default" className="rounded-xl">
                تأكيد الجدولة
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
