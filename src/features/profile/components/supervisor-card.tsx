"use client";

import React from "react";
import { SupervisorDTO } from "@/domains/users/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { UserCheck, Mail } from "lucide-react";
import Image from "next/image";

interface SupervisorCardProps {
  supervisor?: SupervisorDTO | null;
}

export function SupervisorCard({ supervisor }: SupervisorCardProps) {
  if (!supervisor) return null;

  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
          <UserCheck className="h-4 w-4 text-primary" />
          <span>المسؤول المباشر (Direct Supervisor)</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-secondary border border-border shrink-0">
            {supervisor.avatarUrl ? (
              <Image
                src={supervisor.avatarUrl}
                alt={supervisor.name}
                width={44}
                height={44}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                {supervisor.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground">{supervisor.name}</h4>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3 text-primary" />
              <span>{supervisor.email}</span>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-semibold">
          {supervisor.role}
        </Badge>
      </CardContent>
    </Card>
  );
}
