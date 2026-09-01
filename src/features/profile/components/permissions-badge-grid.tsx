"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Shield, CheckCircle2 } from "lucide-react";

interface PermissionsBadgeGridProps {
  permissions: string[];
}

export function PermissionsBadgeGrid({ permissions }: PermissionsBadgeGridProps) {
  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Shield className="h-4.5 w-4.5 text-primary" />
              <span>مصفوفة الصلاحيات المفعلة (RBAC Permissions)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              الصلاحيات الممنوحة لحسابك بناءً على الدور المعتمد في المنشأة.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-bold text-xs">
            {permissions.length} صلاحية
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {permissions.map((perm) => (
            <div
              key={perm}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 bg-secondary/30 text-xs text-foreground"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="font-medium font-mono text-[11px] truncate" title={perm}>
                {perm}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
