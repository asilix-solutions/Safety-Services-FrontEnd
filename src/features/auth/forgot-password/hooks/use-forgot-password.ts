"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/schemas/auth.schema";
import { useTranslation } from "@/providers/i18n-provider";
import { authApi } from "@/domains/auth";
import { alertService } from "@/services/alert-service";

export function useForgotPassword() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await authApi.forgotPassword({ email: data.email.trim() });

      if (res.isSuccess) {
        const payload = res.data as Record<string, unknown> | undefined;
        const devOtp = (payload?.devOnlyOtp as string | undefined) || res.data?.otp;
        const desc = devOtp
          ? `تم إرسال رمز التحقق OTP (${devOtp}) إلى بريدك الإلكتروني.`
          : `تم إرسال رمز التحقق OTP إلى البريد: ${data.email}`;

        alertService.success(res.message || "تم إرسال رمز التحقق بنجاح", {
          description: desc,
          duration: 8000,
        });

        // Navigate to reset password page with email and optional otp pre-filled
        const otpParam = devOtp ? `&otp=${devOtp}` : "";
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}${otpParam}`);
      } else {
        alertService.showApiResponse(res, {
          defaultError: t("validation:loginFailed") || "تعذر إرسال رمز التحقق",
        });
      }
    } catch (err: unknown) {
      alertService.showApiError(err, {
        fallbackMessage: "تعذر إرسال رمز التحقق. يرجى التأكد من صحة البريد.",
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
    t,
  };
}
