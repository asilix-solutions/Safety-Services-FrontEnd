import React from "react";
import { Metadata } from "next";
import { getServerTenantBranding } from "@/lib/server-tenant";
import { BrandedLoginForm } from "@/components/auth/branded-login-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول الموحد | SSLM",
  description: "الوصول إلى لوحة التحكم الخاصة بالامتثال الهندسي وإدارة التراخيص للمؤسسات.",
};

export default async function LoginPage() {
  const tenant = await getServerTenantBranding();

  return <BrandedLoginForm tenant={tenant} />;
}
