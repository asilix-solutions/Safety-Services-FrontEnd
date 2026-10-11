"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/schemas/auth.schema";
import { useTranslation } from "@/providers/i18n-provider";
import { authApi } from "@/domains/auth";
import { alertService } from "@/services/alert-service";

export function useResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);

  const initialEmail = searchParams.get("email") || "";
  const initialOtp = searchParams.get("otp") || "";

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      otp: initialOtp,
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (initialEmail) {
      form.setValue("email", initialEmail);
    }
    if (initialOtp) {
      form.setValue("otp", initialOtp);
    }
  }, [initialEmail, initialOtp, form]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const email = form.getValues("email");
    if (!email) return;

    try {
      const res = await authApi.forgotPassword({ email });
      if (res.isSuccess) {
        const payload = res.data as Record<string, unknown> | undefined;
        const devOtp = (payload?.devOnlyOtp as string | undefined) || res.data?.otp;
        if (devOtp) {
          form.setValue("otp", devOtp);
        }
        alertService.success("تم إعادة إرسال رمز التحقق OTP بنجاح");
        setResendCooldown(60);
      } else {
        alertService.showApiResponse(res);
      }
    } catch (err) {
      alertService.showApiError(err, { fallbackMessage: "فشل إعادة إرسال رمز التحقق" });
    }
  };

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await authApi.resetPassword({
        email: data.email.trim(),
        otp: data.otp.trim(),
        newPassword: data.newPassword,
      });

      if (res.isSuccess) {
        alertService.success(res.message || "تم تحديث كلمة المرور بنجاح!", {
          description: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
          duration: 5000,
        });

        router.push("/login?reset_success=true");
      } else {
        alertService.showApiResponse(res, {
          defaultError: "فشل تحديث كلمة المرور. يرجى التحقق من صحة الرمز.",
        });
      }
    } catch (err: unknown) {
      alertService.showApiError(err, {
        fallbackMessage: "فشل تحديث كلمة المرور. يرجى التأكد من صحة رمز التحقق والمحاولة مجدداً.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    errorMsg,
    resendCooldown,
    handleResendOtp,
    t,
  };
}
