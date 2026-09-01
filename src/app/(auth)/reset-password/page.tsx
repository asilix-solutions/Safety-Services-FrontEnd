import React, { Suspense } from "react";
import { Metadata } from "next";
import { getServerTenantBranding } from "@/lib/server-tenant";
import { ResetPasswordForm } from "@/features/auth/reset-password";

export const metadata: Metadata = {
  title: "تعيين كلمة مرور جديدة | SSLM",
  description: "إدخال رمز التحقق وتحديث كلمة المرور لحساب منصة خدمات السلامة.",
};

export default async function ResetPasswordPage() {
  const tenant = await getServerTenantBranding();

  return (
    <Suspense fallback={<div className="text-center text-xs text-muted-foreground p-8">جاري التحميل...</div>}>
      <ResetPasswordForm tenant={tenant} />
    </Suspense>
  );
}
