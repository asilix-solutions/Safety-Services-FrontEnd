"use client";

import React from "react";
import { Building2, ShieldAlert } from "lucide-react";

interface TenantBadgeProps {
  tenantName?: string;
  subdomain?: string;
  logoUrl?: string;
}

export function TenantBadge({ tenantName, subdomain, logoUrl }: TenantBadgeProps) {
  if (!subdomain && !tenantName) {
    return (
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center mb-2 shadow-lg shadow-primary/25">
        <ShieldAlert className="h-7 w-7 text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2 mb-2">
      <div className="h-16 w-16 rounded-2xl border-2 border-primary/40 bg-card p-1.5 shadow-xl shadow-primary/10 flex items-center justify-center overflow-hidden">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={tenantName || "Company Logo"}
            className="h-full w-full object-contain rounded-xl"
          />
        ) : (
          <div className="h-full w-full rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="h-7 w-7" />
          </div>
        )}
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
        <span>{tenantName || `${subdomain}.sslm.sa`}</span>
      </div>
    </div>
  );
}
