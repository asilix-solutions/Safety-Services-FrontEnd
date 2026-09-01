"use client";

import React from "react";
import { User, Mail, Phone, Lock, KeyRound, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { OnboardingStep3Values } from "@/schemas/onboarding.schema";
import { PasswordStrengthMeter } from "@/features/auth/reset-password";
import { SAUDI_PHONE_REGEX } from "@/schemas/profile.schema";
import { PASSWORD_COMPLEXITY_REGEX } from "@/schemas/auth.schema";

interface Step3AdminCredentialsProps {
  data: OnboardingStep3Values;
  onChange: (data: Partial<OnboardingStep3Values>) => void;
  onSubmitStep: () => void;
  onPrev: () => void;
  isSubmitting?: boolean;
}

export function Step3AdminCredentials({
  data,
  onChange,
  onSubmitStep,
  onPrev,
  isSubmitting = false,
}: Step3AdminCredentialsProps) {
  const isPhoneValid = SAUDI_PHONE_REGEX.test(data.adminPhone || "");
  const isPasswordValid = PASSWORD_COMPLEXITY_REGEX.test(data.adminPassword || "");
  const doPasswordsMatch =
    data.adminPassword && data.adminPassword === data.confirmAdminPassword;

  const canProceed =
    data.adminFullName?.trim().length >= 3 &&
    data.adminEmail?.includes("@") &&
    isPhoneValid &&
    isPasswordValid &&
    doPasswordsMatch &&
    data.agreeToTerms;

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground">
          <User className="h-5 w-5 text-primary" />
          <span>بيانات حساب مدير المنشأة الرئيسي (Company Admin)</span>
        </CardTitle>
        <CardDescription>
          الحساب الإداري المخول بإدارة التراخيص، مراجعة المخططات، وتعيين المهندسين المعتمدين.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            الاسم الكامل للمسؤول <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="م. خالد الأحمد"
              value={data.adminFullName || ""}
              onChange={(e) => onChange({ adminFullName: e.target.value })}
              className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Email & Saudi Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              البريد الإلكتروني للعمل <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="admin@company.com"
                value={data.adminEmail || ""}
                onChange={(e) => onChange({ adminEmail: e.target.value })}
                className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              رقم الجوال السعودي (05XXXXXXXX) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                maxLength={10}
                dir="ltr"
                placeholder="05XXXXXXXX"
                value={data.adminPhone || ""}
                onChange={(e) => onChange({ adminPhone: e.target.value.replace(/[^0-9]/g, "") })}
                className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-start"
              />
            </div>
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              كلمة المرور الآمنة <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={data.adminPassword || ""}
                onChange={(e) => onChange({ adminPassword: e.target.value })}
                className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              تأكيد كلمة المرور <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={data.confirmAdminPassword || ""}
                onChange={(e) => onChange({ confirmAdminPassword: e.target.value })}
                className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        <PasswordStrengthMeter password={data.adminPassword || ""} />

        {/* Terms Agreement */}
        <div className="pt-2 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="agree-terms"
            checked={!!data.agreeToTerms}
            onChange={(e) => onChange({ agreeToTerms: e.target.checked as true })}
            className="mt-1 rounded border-border text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="agree-terms" className="text-xs text-muted-foreground cursor-pointer select-none">
            أوافق على اتفاقية استخدام منصة SSLM ومعالجة بيانات الرخص الهندسية والامتثال للأنظمة واللوائح المعتمدة.
          </label>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border/40 pt-4">
        <Button variant="ghost" size="sm" onClick={onPrev} className="gap-1.5">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>السابق</span>
        </Button>

        <Button
          size="sm"
          className="gap-2 font-bold"
          disabled={!canProceed}
          isLoading={isSubmitting}
          onClick={onSubmitStep}
        >
          <span>إرسال رمز التحقق (OTP)</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </CardFooter>
    </>
  );
}
