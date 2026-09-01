"use client";

import React from "react";
import { UserAuditMetadataDTO } from "@/domains/users/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { History, Laptop, Key, ShieldCheck } from "lucide-react";

interface AuditTrailCardProps {
  audit: UserAuditMetadataDTO;
}

export function AuditTrailCard({ audit }: AuditTrailCardProps) {
  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
          <History className="h-4 w-4 text-primary" />
          <span>سجل أمان الجلسة والنشاط (Security Audit Trail)</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-3 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Laptop className="h-4 w-4 text-primary" />
            <span>آخر تسجيل دخول وعنوان IP:</span>
          </div>
          <span className="font-mono text-foreground font-semibold">{audit.lastLoginIp}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-4 w-4 text-primary" />
            <span>آخر تغيير لكلمة المرور:</span>
          </div>
          <span className="text-foreground font-medium">
            {new Date(audit.passwordChangedAt).toLocaleDateString("ar-SA")}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>معرف الجلسة النشطة:</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">{audit.currentSessionId}</span>
        </div>
      </CardContent>
    </Card>
  );
}
