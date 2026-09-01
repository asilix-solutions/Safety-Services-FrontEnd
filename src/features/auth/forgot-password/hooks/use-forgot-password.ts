"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/schemas/auth.schema";
import { useTranslation } from "@/providers/i18n-provider";
import { toast } from "sonner";
import { apiClient } from "@/services/api-client";

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
      // Simulate/Attempt dispatching OTP to API
      await new Promise((res) => setTimeout(res, 800));

      toast.success(t("auth:sendOtpBtn"), {
        description: `تم إرسال رمز التحقق OTP إلى البريد الإلكتروني: ${data.email}`,
      });

      // Navigate to reset password page with email in querystring
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || t("validation:loginFailed"));
      toast.error(error.message || t("validation:loginFailed"));
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
