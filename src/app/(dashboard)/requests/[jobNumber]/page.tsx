"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_REQUESTS } from "@/mock/requests";
import { LicensingRequest, RequestType } from "@/domains/requests/types";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { MapPin, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/providers/i18n-provider";

export default function RequestDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const { t } = useTranslation();
  const [request, setRequest] = useState<LicensingRequest | null>(null);

  const jobNumber = params?.jobNumber as string;

  useEffect(() => {
    if (jobNumber) {
      // Find request from localStorage or mock data
      let localList: LicensingRequest[] = [];
      try {
        const local = localStorage.getItem("SSLM_CLIENT_REQUESTS");
        if (local) {
          localList = JSON.parse(local);
        }
      } catch (err) {
        console.error("Failed to read requests", err);
      }

      const merged = [...localList, ...MOCK_REQUESTS];
      const found = merged.find((r) => r.jobNumber === jobNumber);
      if (found) {
        setRequest(found);
      }
    }
  }, [jobNumber]);

  if (!user) return null;

  if (!request) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <p>Request with reference {jobNumber} not found.</p>
        <Link href="/requests">
          <Button variant="outline" size="sm">Back to Requests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/requests">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <PageHeader
          title={`${t("dashboard:request_details_title")}: ${request.jobNumber}`}
          description={t("dashboard:track_progress_desc")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Detail Specifications */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">{t("dashboard:facility_location_metadata")}</CardTitle>
                <CardDescription className="text-muted-foreground">{t("dashboard:verified_municipal_desc")}</CardDescription>
              </div>
              <Badge variant="warning" className="capitalize">
                {request.status.replace("_", " ")}
              </Badge>
            </CardHeader>
            <CardContent className="divide-y divide-border text-xs space-y-1">
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:facility_name")}</span>
                <span className="col-span-2 font-semibold text-foreground">{request.facilityName}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:commercial_cr")}</span>
                <span className="col-span-2 font-mono font-semibold text-foreground">{request.crNumber}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:safety_activity_isic")}</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {request.activityName} ({request.isicCode})
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:facility_area")}</span>
                <span className="col-span-2 font-semibold text-foreground">{request.area} m²</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:location_address")}</span>
                <span className="col-span-2 font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {request.city}, {request.district} - {request.addressDescription}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:contact_representative")}</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {request.contactName} ({request.contactPhone})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents checklist */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">{t("dashboard:uploaded_compliance_files")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("dashboard:submitted_certificates_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {request.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border bg-secondary/15 rounded-lg">
                  <div>
                    <span className="font-semibold block text-foreground">{doc.name}</span>
                    <span className="text-[10px] text-muted-foreground">Formats: {doc.type.toUpperCase()}</span>
                  </div>
                  {doc.uploaded ? (
                    <div className="text-end">
                      <span className="text-emerald-500 font-bold block text-[10px]">✓ {t("dashboard:uploaded_label")}</span>
                      <span className="text-[9px] text-muted-foreground font-mono truncate max-w-xs block">
                        {doc.fileName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-amber-500 font-medium">{t("dashboard:pending_document")}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right side tracking timeline */}
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">{t("dashboard:workflow_tracking")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("dashboard:safety_evaluation_timeline_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative border-s border-border ps-4 ms-2 space-y-6">
                {request.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-background" />
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground capitalize">{event.status.replace("_", " ")}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{event.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* V2 Expand message */}
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 text-xs flex gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">{t("dashboard:mvp_placeholder_node")}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                {t("dashboard:mvp_placeholder_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
