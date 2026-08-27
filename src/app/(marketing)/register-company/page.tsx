"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { THEME_PRESETS } from "@/constants/themes";
import {
  Building2,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  User,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

function RegisterCompanyContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const preselectedPlan = searchParams.get("plan") || "professional";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("royal-indigo");

  const handleSubdomainChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(sanitized);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API registration delay
    await new Promise((res) => setTimeout(res, 1000));

    toast.success("تم إنشاء بوابة شركة السلامة بنجاح!", {
      description: `تم إعداد النطاق الفرعي: ${subdomain || "company"}.sslm.sa والهوية البصرية.`,
    });

    // Auto-login as Company Admin for seamless onboarding
    await login("Company Admin");
    router.push("/dashboard");
  };

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Step Indicator Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>إعداد بوابة شركة السلامة الجديدة</span>
        </div>
        <h1 className="text-3xl font-black text-foreground">إنشاء حساب وبوابة سلامة مستقلة</h1>
        <p className="text-sm text-muted-foreground">
          الباقة المختارة: <span className="font-bold text-primary capitalize">{preselectedPlan}</span>
        </p>

        {/* 3-Step Dots */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div
            className={`h-2.5 rounded-full transition-all ${
              step >= 1 ? "w-8 bg-primary" : "w-2.5 bg-border"
            }`}
          />
          <div
            className={`h-2.5 rounded-full transition-all ${
              step >= 2 ? "w-8 bg-primary" : "w-2.5 bg-border"
            }`}
          />
          <div
            className={`h-2.5 rounded-full transition-all ${
              step >= 3 ? "w-8 bg-primary" : "w-2.5 bg-border"
            }`}
          />
        </div>
      </div>

      <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                بيانات المنشأة والترخيص
              </CardTitle>
              <CardDescription>أدخل البيانات الرسمية لمكتب أو شركة استشارات السلامة.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">اسم الشركة / المكتب الهندسي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة قمة السلامة للاستشارات الهندسية"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">رقم السجل التجاري (CR)</label>
                  <input
                    type="text"
                    required
                    placeholder="1010XXXXXX"
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">رقم ترخيص الدفاع المدني</label>
                  <input
                    type="text"
                    placeholder="CD-REG-XXXXX"
                    className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground">النطاق الفرعي المطلوب (Subdomain)</label>
                <div className="flex items-center rounded-lg border border-border bg-background/50 overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="my-company"
                    value={subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm text-foreground bg-transparent focus:outline-none"
                  />
                  <span className="px-3 text-xs font-bold text-muted-foreground bg-secondary/60 py-2.5 border-s border-border select-none" dir="ltr">
                    .sslm.sa
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  سيكون هذا الرابط المخصص لدخول فريقك وعملائك بهوية مستقلة.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-border/40 pt-4">
              <Link href="/">
                <Button variant="ghost" size="sm">إلغاء</Button>
              </Link>
              <Button
                size="sm"
                className="gap-2 font-bold"
                disabled={!companyName || !subdomain}
                onClick={() => setStep(2)}
              >
                التالي: الهوية البصرية
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground">
                <Palette className="h-5 w-5 text-primary" />
                تخصيص الهوية البصرية والألوان (White-Label)
              </CardTitle>
              <CardDescription>اختر النسق اللوني الافتراضي لبوابة شركتك ولوحة التحكم.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedThemeId(preset.id)}
                    className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      selectedThemeId === preset.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border/60 bg-secondary/30 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{preset.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-border"
                          style={{ backgroundColor: preset.colors.primary }}
                        />
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-border"
                          style={{ backgroundColor: preset.colors.secondary }}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{preset.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-border/40 pt-4">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                السابق
              </Button>
              <Button size="sm" className="gap-2 font-bold" onClick={() => setStep(3)}>
                التالي: حساب المدير
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <form onSubmit={handleCompleteRegistration}>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground">
                <User className="h-5 w-5 text-primary" />
                بيانات حساب مدير المنشأة (Company Admin)
              </CardTitle>
              <CardDescription>الحساب الرئيسي لإدارة الموظفين والمهندسين وتراخيص الشركة.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">الاسم الكامل للمسؤول</label>
                <div className="relative">
                  <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="م. خالد الأحمد"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">البريد الإلكتروني للعمل</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">كلمة المرور الآمنة</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <span>
                  بالضغط على إتمام التسجيل، فإنك توافق على شروط الاستخدام واتفاقية معالجة البيانات المعتمدة.
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-border/40 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                السابق
              </Button>

              <Button
                type="submit"
                size="sm"
                className="gap-2 font-bold shadow-lg shadow-primary/25"
                isLoading={isSubmitting}
              >
                <span>إتمام التسجيل وإطلاق البوابة</span>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function RegisterCompanyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <RegisterCompanyContent />
    </Suspense>
  );
}
