import React from "react";
import { Metadata } from "next";
import { getServerTenantBranding } from "@/lib/server-tenant";
import { RegisterClientForm } from "@/features/auth/register-client";

export const metadata: Metadata = {
  title: "إنشاء حساب عميل | بوابة السلامة",
  description: "تسجيل حساب عميل جديد للاستفادة من خدمات تراخيص واعتمادات الدفاع المدني.",
};

export default async function RegisterClientPage() {
  const tenant = await getServerTenantBranding();

  return <RegisterClientForm tenant={tenant} />;
}
