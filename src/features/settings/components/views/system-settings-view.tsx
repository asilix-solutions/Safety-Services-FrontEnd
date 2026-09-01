"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { systemSettingsSchema, SystemSettingsFormValues } from "@/schemas/settings.schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ShieldCheck, Save, Clock, Lock, HardDrive } from "lucide-react";
import { toast } from "sonner";

export function SystemSettingsView() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      sessionTimeoutMinutes: 30,
      maxConcurrentSessionsPerUser: 3,
      enforce2FAForRoles: ["Super Admin", "Company Admin"],
      ipWhitelist: "192.168.1.0/24\n10.0.0.1",
      maxFileUploadSizeMb: 25,
      allowedDocumentExtensions: ".pdf, .dwg, .dxf, .png, .jpg, .jpeg, .zip",
    },
  });

  const onSubmit = async (_data: SystemSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      toast.success("تم تحديث إعدادات الأمان وحدود النظام بنجاح!");
    } catch {
      toast.error("فشل حفظ إعدادات النظام.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4.5 w-4.5 text-primary" />
              <span>تهيئة النظام والأمان (Core System & Security)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              مهلة انتهاء الجلسات التلقائي، سياسات التحقق بخطوتين، وحدود تخزين ورفع المخططات.
            </CardDescription>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={!isDirty || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="gap-2 font-bold shadow-md shadow-primary/20"
          >
            <Save className="h-4 w-4" />
            <span>حفظ التغييرات</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Session Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/40 pb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>إدارة الجلسات ومهلة تسجيل الخروج التلقائي</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  مهلة خمول الجلسة (بالدقائق)
                </label>
                <select
                  {...register("sessionTimeoutMinutes", { valueAsNumber: true })}
                  className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-mono"
                >
                  <option value="15">15 دقيقة (أقصى أمان)</option>
                  <option value="30">30 دقيقة (موصى به)</option>
                  <option value="60">60 دقيقة (ساعة واحدة)</option>
                  <option value="120">120 دقيقة (ساعتان)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  أقصى عدد جلسات متزامنة لكل مستخدم
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  {...register("maxConcurrentSessionsPerUser", { valueAsNumber: true })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* 2FA & Access Control */}
          <div className="space-y-4 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/40 pb-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>سياسة التحقق بخطوتين (2FA) وعناوين IP الموثوقة</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                إلزام التحقق بخطوتين (2FA) للأدوار الحساسة:
              </label>
              <div className="flex flex-wrap gap-4 text-xs">
                {["Super Admin", "Company Admin", "Consulting Engineer"].map((role) => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      value={role}
                      {...register("enforce2FAForRoles")}
                      className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-foreground font-medium">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-foreground">
                عناوين IP المسموح لها بالدخول الإداري (IP Whitelist - سطر لكل عنوان):
              </label>
              <textarea
                rows={2}
                dir="ltr"
                {...register("ipWhitelist")}
                className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Storage & Upload Limits */}
          <div className="space-y-4 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/40 pb-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span>حدود تخزين ورفع المخططات الهندسية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  أقصى حجم للملف الواحد (ميغابايت - MB)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  {...register("maxFileUploadSizeMb", { valueAsNumber: true })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  صيغ الملفات والمخططات المسموح بها
                </label>
                <input
                  type="text"
                  dir="ltr"
                  {...register("allowedDocumentExtensions")}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-start"
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
