import React from "react";
import { Metadata } from "next";
import { getServerTenantBranding } from "@/lib/server-tenant";
import { ForgotPasswordForm } from "@/features/auth/forgot-password";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور | SSLM",
  description: "طلب رمز التحقق OTP لإعادة تعيين كلمة المرور لمنصة خدمات السلامة.",
};

export default async function ForgotPasswordPage() {
  const tenant = await getServerTenantBranding();

  return <ForgotPasswordForm tenant={tenant} />;
}
