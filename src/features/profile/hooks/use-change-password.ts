"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, ChangePasswordFormValues } from "@/schemas/profile.schema";
import { useTranslation } from "@/providers/i18n-provider";
import { authApi } from "@/domains/auth";
import { alertService } from "@/services/alert-service";

export function useChangePassword() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (res.isSuccess) {
        alertService.success(res.message || "تم تحديث كلمة المرور بنجاح!", {
          description: "تم تأمين حسابك بكلمة المرور الجديدة.",
        });
        form.reset();
      } else {
        alertService.showApiResponse(res, {
          defaultError: "فشل تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية.",
        });
      }
    } catch (err: unknown) {
      alertService.showApiError(err, {
        fallbackMessage: "فشل تغيير كلمة المرور. تأكد من صحة كلمة المرور الحالية.",
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
