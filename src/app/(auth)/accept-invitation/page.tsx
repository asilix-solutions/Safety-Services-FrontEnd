import React, { Suspense } from "react";
import { Metadata } from "next";
import { getServerTenantBranding } from "@/lib/server-tenant";
import { AcceptInvitationForm } from "@/features/auth/accept-invitation";

export const metadata: Metadata = {
  title: "قبول دعوة الانضمام | بوابة السلامة",
  description: "قبول دعوة الانضمام وتعيين كلمة المرور لمنصة خدمات السلامة.",
};

export default async function AcceptInvitationPage() {
  const tenant = await getServerTenantBranding();

  return (
    <Suspense
      fallback={
        <div className="text-center text-xs text-muted-foreground py-10">
          جاري تحميل بيانات الدعوة...
        </div>
      }
    >
      <AcceptInvitationForm tenant={tenant} />
    </Suspense>
  );
}
