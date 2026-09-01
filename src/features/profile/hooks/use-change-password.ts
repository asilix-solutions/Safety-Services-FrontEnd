import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, ChangePasswordFormValues } from "@/schemas/profile.schema";
import { useTranslation } from "@/providers/i18n-provider";
import { toast } from "sonner";

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

  const onSubmit = async (_data: ChangePasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Simulate API call to PUT /api/v1/me/change-password
      await new Promise((res) => setTimeout(res, 800));

      toast.success("تم تحديث كلمة المرور بنجاح!", {
        description: "تم تأمين حسابك بكلمة المرور الجديدة.",
      });

      form.reset();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || "فشل تغيير كلمة المرور");
      toast.error(error.message || "فشل تغيير كلمة المرور");
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
