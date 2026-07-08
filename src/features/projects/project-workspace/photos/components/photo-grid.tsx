"use client";

import React from "react";
import { Images, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { PhotosViewModel } from "../view-models/photos.viewmodel";
import { siloLabelKey } from "../helpers/helpers";

interface PhotoGridProps {
  viewModel: PhotosViewModel;
  isLoading: boolean;
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 flex flex-col gap-1 ${
        accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

export function PhotoGrid({ viewModel, isLoading }: PhotoGridProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat label={t("photos:summary.total")} value={String(viewModel.summary.total)} accent />
        <SummaryStat label={t(siloLabelKey("alarm"))} value={String(viewModel.summary.bySilo.alarm)} />
        <SummaryStat label={t(siloLabelKey("suppression"))} value={String(viewModel.summary.bySilo.suppression)} />
        <SummaryStat label={t(siloLabelKey("ventilation"))} value={String(viewModel.summary.bySilo.ventilation)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Images className="h-4 w-4 text-primary" />
            {t("photos:grid.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">{t("common:loading")}</p>
          ) : viewModel.rows.length === 0 ? (
            <EmptyState
              icon={<Camera className="h-8 w-8 text-muted-foreground" />}
              title={t("photos:title")}
              description={t("photos:empty")}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {viewModel.rows.map((row) => (
                <div key={row.id} className="space-y-1.5 rounded-lg border border-border bg-card p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.image}
                    alt={row.caption || t(row.siloLabelKey)}
                    className="w-full aspect-square rounded-md object-cover border border-border"
                  />
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {t(row.siloLabelKey)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{row.createdAtLabel}</span>
                  </div>
                  {row.caption && <p className="text-xs text-foreground text-start line-clamp-2">{row.caption}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PhotoGrid;
