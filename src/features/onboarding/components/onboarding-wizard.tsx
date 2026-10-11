"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Step1EnterpriseInfo } from "./step-1-enterprise-info";
import { Step2BrandingPreset } from "./step-2-branding-preset";
import { Step3AdminCredentials } from "./step-3-admin-credentials";
import { Step4OtpVerification } from "./step-4-otp-verification";
import {
  OnboardingStep1Values,
  OnboardingStep2Values,
  OnboardingStep3Values,
} from "@/schemas/onboarding.schema";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { THEME_PRESETS } from "@/constants/themes";
import { tenantOnboardingApi, TenantActivationMethod } from "@/domains/tenants";
import { alertService } from "@/services/alert-service";

export function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithCredentials } = useAuth();

  const preselectedPlan = searchParams.get("plan") || "professional";
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registered entity state from backend
  const [, setRegisteredTenantId] = useState<string | null>(null);
  const [registeredAdminUserId, setRegisteredAdminUserId] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Form states across wizard
  const [step1Data, setStep1Data] = useState<OnboardingStep1Values>({
    companyName: "",
    commercialRegistration: "",
    unifiedNumber700: "",
    civilDefenseLicense: "",
    subdomain: "",
  });

  const [step2Data, setStep2Data] = useState<OnboardingStep2Values>({
    presetId: "royal-indigo",
    primaryColor: THEME_PRESETS[0].colors.primary,
    secondaryColor: THEME_PRESETS[0].colors.secondary,
    accentColor: THEME_PRESETS[0].colors.accent,
    logoUrl: "",
  });

  const [step3Data, setStep3Data] = useState<OnboardingStep3Values>({
    adminFullName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
    confirmAdminPassword: "",
    agreeToTerms: true,
  });

  const handleStep3Submit = async () => {
    setIsSubmitting(true);
    try {
      const res = await tenantOnboardingApi.registerCompany({
        companyNameAr: step1Data.companyName.trim(),
        companyNameEn: step1Data.subdomain.toUpperCase() + " Safety Co.",
        commercialRegistrationNumber: step1Data.commercialRegistration.trim(),
        nationalUnifiedNumber700: step1Data.unifiedNumber700.trim(),
        subdomain: step1Data.subdomain.trim().toLowerCase(),
        adminFullName: step3Data.adminFullName.trim(),
        adminEmail: step3Data.adminEmail.trim(),
        adminPhoneNumber: step3Data.adminPhone.trim(),
        password: step3Data.adminPassword,
        activationMethod: TenantActivationMethod.ManualPlatformApproval,
      });

      if (res.isSuccess && res.data) {
        setRegisteredTenantId(res.data.tenantId);
        setRegisteredAdminUserId(res.data.adminUserId);
        if (res.data.devOnlyOtp) {
          setDevOtp(res.data.devOnlyOtp);
          toast.success("تم إرسال رمز التحقق OTP بنجاح!", {
            description: `رمز التحقق التجريبي (OTP): ${res.data.devOnlyOtp}`,
            duration: 8000,
          });
        } else {
          toast.success("تم إرسال رمز التحقق OTP بنجاح إلى بريدك الإلكتروني!");
        }
        setStep(4);
      } else {
        alertService.showApiResponse(res, {
          defaultError: "فشل تسجيل المنشأة. يرجى التحقق من صحة البيانات.",
        });
      }
    } catch (err) {
      alertService.showApiError(err, { fallbackMessage: "فشل إرسال طلب تسجيل المنشأة." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setIsSubmitting(true);
    try {
      if (registeredAdminUserId) {
        const res = await tenantOnboardingApi.verifyTenantOtp({
          userId: registeredAdminUserId,
          otpCode: otp.trim(),
        });

        if (res.isSuccess && res.data) {
          toast.success("تم تفعيل بوابة شركة السلامة بنجاح!", {
            description: `تم إعداد النطاق https://${res.data.subdomain}.sslm.sa وتفعيل الصلاحيات.`,
          });
          // Authenticate with the credentials
          await loginWithCredentials({
            email: step3Data.adminEmail.trim(),
            password: step3Data.adminPassword,
          });
          router.push("/dashboard");
          return;
        } else {
          alertService.showApiResponse(res, {
            defaultError: "رمز التحقق غير صحيح أو انتهت صلاحيته.",
          });
          return;
        }
      }

      // Fallback
      await login("Company Admin");
      router.push("/dashboard");
    } catch (err) {
      alertService.showApiError(err, { fallbackMessage: "فشل التحقق من الرمز." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Wizard Header & Progress Dots */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>إعداد بوابة شركة السلامة الجديدة</span>
        </div>

        <h1 className="text-3xl font-black text-foreground">إنشاء حساب وبوابة سلامة مستقلة</h1>
        <p className="text-sm text-muted-foreground">
          الباقة المختارة: <span className="font-bold text-primary capitalize">{preselectedPlan}</span>
        </p>

        {/* 4-Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                step >= stepNumber ? "w-8 bg-primary shadow-sm shadow-primary/40" : "w-2.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden">
        {step === 1 && (
          <Step1EnterpriseInfo
            data={step1Data}
            onChange={(patch) => setStep1Data((prev) => ({ ...prev, ...patch }))}
            onNext={() => setStep(2)}
            errors={{}}
          />
        )}

        {step === 2 && (
          <Step2BrandingPreset
            data={step2Data}
            onChange={(patch) => setStep2Data((prev) => ({ ...prev, ...patch }))}
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3AdminCredentials
            data={step3Data}
            onChange={(patch) => setStep3Data((prev) => ({ ...prev, ...patch }))}
            onSubmitStep={handleStep3Submit}
            onPrev={() => setStep(2)}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 4 && (
          <Step4OtpVerification
            email={step3Data.adminEmail}
            subdomain={step1Data.subdomain}
            initialOtp={devOtp || undefined}
            onVerify={handleVerifyOtp}
            onPrev={() => setStep(3)}
            isSubmitting={isSubmitting}
          />
        )}
      </Card>
    </div>
  );
}
