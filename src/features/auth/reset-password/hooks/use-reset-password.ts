"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/schemas/auth.schema";
import { useTranslation } from "@/providers/i18n-provider";
import { toast } from "sonner";

export function useResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);

  const initialEmail = searchParams.get("email") || "";

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (initialEmail) {
      form.setValue("email", initialEmail);
    }
  }, [initialEmail, form]);

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
      toast.info("تم إعادة إرسال رمز التحقق OTP بنجاح");
      setResendCooldown(60);
    } catch {
      toast.error("فشل إعادة إرسال رمز التحقق");
    }
  };

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Simulate API call to POST /api/v1/auth/reset-password
      await new Promise((res) => setTimeout(res, 1000));

      toast.success("تم تحديث كلمة المرور بنجاح!", {
        description: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
      });

      router.push("/login?reset_success=true");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || "فشل تحديث كلمة المرور.");
      toast.error(error.message || "فشل تحديث كلمة المرور.");
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
