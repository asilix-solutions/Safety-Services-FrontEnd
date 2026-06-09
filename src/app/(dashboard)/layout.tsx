"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { AdminLayout } from "@/shared/layouts/admin-layout";
import { OperationsLayout } from "@/shared/layouts/operations-layout";
import { ClientLayout } from "@/shared/layouts/client-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // Redirect to login if unauthenticated after loading finishes
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">{t("common:loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Resolve layouts explicitly based on user role categories
  if (user.role === "Super Admin" || user.role === "Company Admin" || user.role === "Sales Agent") {
    return <AdminLayout>{children}</AdminLayout>;
  }

  if (user.role === "Consulting Engineer" || user.role === "Operations Officer") {
    return <OperationsLayout>{children}</OperationsLayout>;
  }

  if (user.role === "Client") {
    return <ClientLayout>{children}</ClientLayout>;
  }

  // Fallback default wrapper
  return <div className="min-h-screen bg-background">{children}</div>;
}
