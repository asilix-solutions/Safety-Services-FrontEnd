"use client";

import React, { Suspense } from "react";
import { OnboardingWizard } from "@/features/onboarding";

export default function RegisterCompanyPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-28 pb-20 text-center text-xs text-muted-foreground">
          جاري تحميل معالج تسجيل الشركة...
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
