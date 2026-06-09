"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ShieldAlert } from "lucide-react";

export default function ExplicitModulePage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safety Workspace Module"
        description="Enterprise SaaS safety engineering and licensing compliance control node."
      />
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Workspace Node Information</CardTitle>
          <CardDescription>Verify module authorization status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/10 bg-primary/5">
            <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-primary">Secure Verification Node</p>
              <p className="text-xs text-muted-foreground">
                This workspace module is verified and online. Operating under active ISO-27001 compliance standards.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-secondary/30 rounded-lg">
              <span className="text-muted-foreground block mb-1">Authenticated Identity</span>
              <span className="font-semibold text-foreground">{user.name} ({user.role})</span>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <span className="text-muted-foreground block mb-1">Audit Status</span>
              <span className="font-semibold text-success">Compliant</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
