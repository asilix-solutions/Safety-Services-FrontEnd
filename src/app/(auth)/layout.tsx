import React from "react";
import { getServerTenantBranding } from "@/lib/server-tenant";
import { TenantThemeInjector } from "@/components/theming/tenant-theme-injector";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getServerTenantBranding();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      <TenantThemeInjector branding={tenant} />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] start-[-10%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] end-[-10%] w-[500px] h-[500px] bg-accent/10 dark:bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      {children}
    </div>
  );
}
