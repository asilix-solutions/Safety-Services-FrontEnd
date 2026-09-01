"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { communicationSettingsSchema, CommunicationSettingsFormValues } from "@/schemas/settings.schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { MessageSquare, Save, Mail, Send } from "lucide-react";
import { toast } from "sonner";

export function CommunicationSettingsView() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty, errors },
  } = useForm<CommunicationSettingsFormValues>({
    resolver: zodResolver(communicationSettingsSchema),
    defaultValues: {
      smsProvider: "unifonic",
      smsApiKey: "unifonic_live_key_998822",
      smsSenderId: "VERTEX-SA",
      emailProvider: "smtp",
      smtpHost: "smtp.mailgun.org",
      smtpPort: 587,
      smtpUsername: "postmaster@vertex.sslm.sa",
      fromEmail: "notifications@vertex.sslm.sa",
      fromName: "إشعارات فيرتكس للسلامة",
    },
  });

  const smsProvider = watch("smsProvider");
  const emailProvider = watch("emailProvider");

  const onSubmit = async (_data: CommunicationSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      toast.success("تم حفظ إعدادات بوابات الرسائل والبريد بنجاح!");
    } catch {
      toast.error("فشل حفظ إعدادات الاتصال.");
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
              <MessageSquare className="h-4.5 w-4.5 text-primary" />
              <span>بوابات الإشعار والرسائل النصية (SMS & Email Gateways)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              ربط مزودي رسائل SMS المحلية (Unifonic / Taqnyat) وخوادم البريد SMTP لإرسال التنبيهات.
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
          {/* SMS Gateway Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/40 pb-2">
              <Send className="h-4 w-4 text-primary" />
              <span>مزود خدمة الرسائل النصية القصيرة (SMS Provider)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">بوابة SMS</label>
                <select
                  {...register("smsProvider")}
                  className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="unifonic">Unifonic (يونيفونك المعتمد)</option>
                  <option value="taqnyat">Taqnyat (تقنيات)</option>
                  <option value="custom_gateway">بوابة مخصصة (Custom API)</option>
                  <option value="none">معطل (بدون رسائل SMS)</option>
                </select>
              </div>

              {smsProvider !== "none" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">مفتاح API Key</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      {...register("smsApiKey")}
                      className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">اسم المرسل المعتمد (Sender ID)</label>
                    <input
                      type="text"
                      placeholder="VERTEX"
                      {...register("smsSenderId")}
                      className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Email Gateway Section */}
          <div className="space-y-4 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/40 pb-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>خادم إرسال البريد الإلكتروني (Email SMTP Dispatch)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">نوع المزود</label>
                <select
                  {...register("emailProvider")}
                  className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="smtp">خادم SMTP مخصص</option>
                  <option value="sendgrid">SendGrid API</option>
                  <option value="aws_ses">Amazon SES</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">عنوان البريد المرسل (From Email)</label>
                <input
                  type="email"
                  dir="ltr"
                  {...register("fromEmail")}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-start font-mono"
                />
                {errors.fromEmail && (
                  <p className="text-[11px] text-destructive">{errors.fromEmail.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">اسم المرسل المعروض</label>
                <input
                  type="text"
                  {...register("fromName")}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {emailProvider === "smtp" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">مضيف SMTP (Host)</label>
                  <input
                    type="text"
                    dir="ltr"
                    {...register("smtpHost")}
                    className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-start"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">منفذ SMTP (Port)</label>
                  <input
                    type="number"
                    dir="ltr"
                    {...register("smtpPort", { valueAsNumber: true })}
                    className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-start"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">اسم المستخدم SMTP</label>
                  <input
                    type="text"
                    dir="ltr"
                    {...register("smtpUsername")}
                    className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-start"
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
