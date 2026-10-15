"use client";

import React, { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { CheckCircle2, AlertTriangle, HelpCircle, MapPin, Clock, Smartphone, ShieldCheck } from "lucide-react";
import { alertService } from "@/services/alert-service";
import { fieldOpsApi } from "@/domains/field-ops/api";
import { cn } from "@/lib/utils";

export type PhotoOutcome = 1 | 2 | 3; // 1: Verified, 2: Flagged, 3: MetadataStripped

export interface PhotoVerificationData {
  photoId: string;
  outcome: PhotoOutcome;
  latitude?: number | null;
  longitude?: number | null;
  siteLatitude?: number | null;
  siteLongitude?: number | null;
  distanceMeters?: number | null;
  captureTimestampUtc?: string | null;
  deviceModel?: string | null;
  justificationReason?: string | null;
  isJustified?: boolean;
}

interface PhotoVerificationBadgeProps {
  data: PhotoVerificationData;
  onJustified?: () => void;
  canJustify?: boolean;
  className?: string;
}

export function PhotoVerificationBadge({
  data,
  onJustified,
  canJustify = false,
  className,
}: PhotoVerificationBadgeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [justificationText, setJustificationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusConfig = () => {
    if (data.isJustified) {
      return {
        label: "تم التبرير إدارياً",
        variant: "secondary" as const,
        icon: ShieldCheck,
        colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      };
    }

    switch (data.outcome) {
      case 1:
        return {
          label: "موثق جغرافياً (EXIF)",
          variant: "default" as const,
          icon: CheckCircle2,
          colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
      case 2:
        return {
          label: "مشبوه / خارج الموقع",
          variant: "destructive" as const,
          icon: AlertTriangle,
          colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      case 3:
      default:
        return {
          label: "البيانات مجردة",
          variant: "outline" as const,
          icon: HelpCircle,
          colorClass: "bg-destructive/10 text-destructive border-destructive/20",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const handleJustifySubmit = async () => {
    if (!justificationText.trim()) {
      alertService.error("يرجى إدخال سبب التبرير الإداري");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fieldOpsApi.justifyPhoto(data.photoId, justificationText);
      if (res.isSuccess) {
        alertService.success("تم تسجيل التبرير الإداري بنجاح");
        setDialogOpen(false);
        if (onJustified) onJustified();
      } else {
        alertService.error(res.message || "فشل تسجيل التبرير");
      }
    } catch (err: any) {
      alertService.showApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors hover:opacity-80 cursor-pointer",
          config.colorClass,
          className
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{config.label}</span>
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Icon className="h-5 w-5" />
              تفاصيل التدقيق الجغرافي وبصمة الصورة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            {/* Coordinates & Geofence Distance */}
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <span className="font-semibold text-foreground">الموقع الجغرافي المسجل:</span>
                {data.latitude && data.longitude ? (
                  <div className="text-muted-foreground font-mono text-[11px]">
                    Lat: {data.latitude.toFixed(6)}, Lon: {data.longitude.toFixed(6)}
                    {data.distanceMeters !== undefined && data.distanceMeters !== null && (
                      <div className="mt-1 font-sans text-xs text-foreground">
                        المسافة عن موقع المشروع:{" "}
                        <span
                          className={cn(
                            "font-bold",
                            data.distanceMeters > 500 ? "text-amber-600" : "text-emerald-600"
                          )}
                        >
                          {data.distanceMeters} متر
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا تتوفر إحداثيات GPS في رأس الصورة.</p>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <span className="font-semibold text-foreground">وقت الالتقاط الفعلي (EXIF):</span>
                <p className="text-muted-foreground">
                  {data.captureTimestampUtc
                    ? new Date(data.captureTimestampUtc).toLocaleString("ar-SA")
                    : "غير محدد"}
                </p>
              </div>
            </div>

            {/* Device Info */}
            {data.deviceModel && (
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                <Smartphone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <span className="font-semibold text-foreground">جهاز الالتقاط:</span>
                  <p className="text-muted-foreground">{data.deviceModel}</p>
                </div>
              </div>
            )}

            {/* Admin Justification Section */}
            {data.justificationReason && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-blue-900 dark:text-blue-200">
                <span className="font-bold block mb-1">مبرر إداري مسجل:</span>
                <p>{data.justificationReason}</p>
              </div>
            )}

            {canJustify && !data.isJustified && data.outcome !== 1 && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="font-semibold text-foreground block">
                  تسجيل تبرير إداري للصورة:
                </label>
                <Textarea
                  rows={2}
                  placeholder="مثال: تعذر التقاط إشارة GPS داخل القبو الخرساني..."
                  value={justificationText}
                  onChange={(e) => setJustificationText(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              إغلاق
            </Button>
            {canJustify && !data.isJustified && data.outcome !== 1 && (
              <Button size="sm" disabled={isSubmitting} onClick={handleJustifySubmit}>
                {isSubmitting ? "جاري الحفظ..." : "اعتماد التبرير"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
