"use client";

import React from "react";
import { UserProfileResponseDTO } from "@/domains/users/types";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Mail, Phone, Building, ShieldCheck, Calendar } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderCardProps {
  profile: UserProfileResponseDTO;
}

export function ProfileHeaderCard({ profile }: ProfileHeaderCardProps) {
  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-xl overflow-hidden relative">
      <div className="h-28 bg-gradient-to-r from-primary/30 via-primary/15 to-accent/20 w-full" />
      
      <CardContent className="pt-0 pb-6 px-6 sm:px-8 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-14 mb-4 text-center sm:text-start">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-4 border-background shadow-xl overflow-hidden bg-secondary">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-primary/20 text-primary">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            {profile.active && (
              <span
                className="absolute bottom-1 end-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full"
                title="Active"
              />
            )}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-foreground">{profile.name}</h2>
              <Badge variant="default" className="font-bold">
                {profile.role}
              </Badge>
              {profile.tenantId && (
                <Badge variant="outline" className="text-[11px] font-medium border-primary/30 bg-primary/5">
                  {profile.tenantName || profile.tenantId}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">{profile.jobTitle}</p>
          </div>
        </div>

        {/* Contact Info Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary shrink-0" />
            <span dir="ltr">{profile.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>عضو منذ {new Date(profile.auditTrail.createdAt).toLocaleDateString("ar-SA")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
