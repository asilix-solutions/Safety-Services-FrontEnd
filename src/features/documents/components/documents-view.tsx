"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  Building,
  Award,
  Layers,
  FileCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { toast } from "sonner";

interface SafetyDocument {
  id: string;
  name: string;
  category: "BLUEPRINT" | "LICENSE" | "CERTIFICATE" | "TEST_REPORT" | "CONTRACT";
  fileType: "PDF" | "DWG" | "ZIP" | "PNG";
  fileSize: string;
  jobNumber: string;
  facilityName: string;
  uploadedAt: string;
  isVerified: boolean;
}

const INITIAL_DOCS: SafetyDocument[] = [
  {
    id: "doc-01",
    name: "مخطط شبكة الرشاشات المعتمد (NFPA 13) - الطابق الأرضي",
    category: "BLUEPRINT",
    fileType: "PDF",
    fileSize: "4.8 MB",
    jobNumber: "AMX-2026-8812",
    facilityName: "مستودعات الخليج للخدمات اللوجستية",
    uploadedAt: "2026-10-14",
    isVerified: true,
  },
  {
    id: "doc-02",
    name: "رخصة الدفاع المدني المعتمدة للمنشأة",
    category: "LICENSE",
    fileType: "PDF",
    fileSize: "1.2 MB",
    jobNumber: "AMX-2026-8815",
    facilityName: "برج الأعمال التنفيذي",
    uploadedAt: "2026-10-12",
    isVerified: true,
  },
  {
    id: "doc-03",
    name: "تقرير اختبار الضغط الهيدروليكي لشبكة الأنابيب (50 بار)",
    category: "TEST_REPORT",
    fileType: "PDF",
    fileSize: "2.1 MB",
    jobNumber: "AMX-2026-8804",
    facilityName: "مركز بيانات السحابية المتقدمة",
    uploadedAt: "2026-10-11",
    isVerified: true,
  },
  {
    id: "doc-04",
    name: "شهادة مطابقة وتركيب أنظمة الإنذار والإطفاء المبكر",
    category: "CERTIFICATE",
    fileType: "PDF",
    fileSize: "950 KB",
    jobNumber: "AMX-2026-8790",
    facilityName: "فندق البيلسان الدولي",
    uploadedAt: "2026-10-09",
    isVerified: true,
  },
  {
    id: "doc-05",
    name: "مخطط أوتوكاد تنفيذي لمخارج الطوارئ ومسالك الهروب",
    category: "BLUEPRINT",
    fileType: "DWG",
    fileSize: "14.2 MB",
    jobNumber: "AMX-2026-8772",
    facilityName: "مجمع النخيل الطبي",
    uploadedAt: "2026-10-06",
    isVerified: false,
  },
  {
    id: "doc-06",
    name: "عقد صيانة دورية سنوية موقع ومختوم",
    category: "CONTRACT",
    fileType: "PDF",
    fileSize: "1.8 MB",
    jobNumber: "MNT-2026-0041",
    facilityName: "مجمع النخيل الطبي",
    uploadedAt: "2026-10-02",
    isVerified: true,
  },
];

const CATEGORY_MAP: Record<string, { label: string; badge: string }> = {
  BLUEPRINT: { label: "مخططات هندسية معتمدة", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200" },
  LICENSE: { label: "تراخيص الدفاع المدني", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200" },
  CERTIFICATE: { label: "شهادات السلامة", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200" },
  TEST_REPORT: { label: "تقارير الاختبارات", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200" },
  CONTRACT: { label: "عقود واتفاقيات", badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200" },
};

export function DocumentsView() {
  const [docs, setDocs] = useState<SafetyDocument[]>(INITIAL_DOCS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload state
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState<SafetyDocument["category"]>("BLUEPRINT");
  const [uploadJobNumber, setUploadJobNumber] = useState("AMX-2026-8812");
  const [uploadFacility, setUploadFacility] = useState("");

  const handleDownload = (doc: SafetyDocument) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 600)),
      {
        loading: `جاري تحميل المستند: ${doc.name}...`,
        success: "تم تحميل الملف بنجاح",
        error: "فشل التحميل",
      }
    );
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName || !uploadFacility) {
      toast.error("يرجى ملء الحقول الإلزامية");
      return;
    }

    const newDoc: SafetyDocument = {
      id: `doc-${Date.now()}`,
      name: uploadName,
      category: uploadCategory,
      fileType: "PDF",
      fileSize: "2.4 MB",
      jobNumber: uploadJobNumber,
      facilityName: uploadFacility,
      uploadedAt: new Date().toISOString().split("T")[0],
      isVerified: true,
    };

    setDocs((prev) => [newDoc, ...prev]);
    setIsUploadModalOpen(false);
    toast.success("تم أرشفة الوثيقة وتثبيتها في خزنة المشروع بنجاح");

    setUploadName("");
    setUploadFacility("");
  };

  const filtered = docs.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.facilityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <FileCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">خزنة المخططات والوثائق الهندسية المعتمدة</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            أرشيف رقمي سحابي آمن لمخططات كود البناء السعودي (SBC 801)، وتراخيص الدفاع المدني، وشهادات الامتثال.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="gap-2 rounded-xl shadow-sm"
          >
            <Upload className="h-4 w-4" />
            رفع وثيقة جديدة
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">إجمالي الوثائق بالأرشيف</p>
              <h3 className="text-2xl font-bold tracking-tight">{docs.length} وثيقة</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">مخططات معتمدة بختم هندسي</p>
              <h3 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {docs.filter((d) => d.category === "BLUEPRINT").length} مخططات
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">رخص دفاع مدني نشطة</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {docs.filter((d) => d.category === "LICENSE").length} رخص
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">شهادات سلامة نافذة</p>
              <h3 className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                {docs.filter((d) => d.category === "CERTIFICATE").length} شهادات
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <Award className="h-5 w-5" />
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
              placeholder="البحث باسم المستند، رقم المعاملة، أو المنشأة..."
              className="ps-9 rounded-xl border-border"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              الكل ({docs.length})
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((doc) => {
            const cat = CATEGORY_MAP[doc.category];

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
              >
                <Card className="rounded-2xl border-border/80 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${cat.badge}`}>
                        {cat.label}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {doc.fileType} • {doc.fileSize}
                      </span>
                    </div>

                    <CardTitle className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                      {doc.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono text-primary mt-1">
                      {doc.jobNumber}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs">
                    <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border border-border">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{doc.facilityName}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>تاريخ الرفع: {doc.uploadedAt}</span>
                        {doc.isVerified && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            مختوم رسمياً
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="w-full rounded-xl gap-1.5 text-xs h-9 shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        تحميل الوثيقة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              رفع وثيقة أو مخطط هندسي للخزنة
            </DialogTitle>
            <DialogDescription>
              أرشفة الوثائق بصيغة PDF أو DWG مع ربطها برقم المعاملة والمنشأة.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">عنوان الوثيقة</Label>
              <Input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="مثال: مخطط شبكة الإنذار المعتمد - الطابق الأول"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">تصنيف الوثيقة</Label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="BLUEPRINT">مخططات هندسية معتمدة</option>
                <option value="LICENSE">رخص الدفاع المدني</option>
                <option value="CERTIFICATE">شهادات السلامة</option>
                <option value="TEST_REPORT">تقارير الاختبارات الميدانية</option>
                <option value="CONTRACT">عقود واتفاقيات</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">اسم المنشأة أو المشروع</Label>
              <Input
                value={uploadFacility}
                onChange={(e) => setUploadFacility(e.target.value)}
                placeholder="مثال: برج الأعمال التنفيذي"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">رقم المعاملة (Job Number)</Label>
              <Input
                value={uploadJobNumber}
                onChange={(e) => setUploadJobNumber(e.target.value)}
                placeholder="AMX-2026-8812"
                required
                className="rounded-xl font-mono"
              />
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center text-xs text-muted-foreground bg-muted/20">
              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <span>اضغط هنا لاختيار الملف أو اسحبه إلى هنا (PDF, DWG حتى 50MB)</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)} className="rounded-xl">
                إلغاء
              </Button>
              <Button type="submit" variant="default" className="rounded-xl">
                تأكيد الرفع والأرشفة
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
