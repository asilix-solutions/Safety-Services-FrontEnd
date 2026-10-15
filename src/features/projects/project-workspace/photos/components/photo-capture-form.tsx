"use client";

import React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, MapPin } from "lucide-react";
import { photoSchema, PhotoFormValues } from "@/schemas/photo.schema";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { CameraCapture } from "@/shared/components/camera-capture";
import type { ExifMetadata } from "@/lib/exif-extractor";
import { SILO_TAG_OPTIONS, siloLabelKey } from "../helpers/helpers";

interface PhotoCaptureFormProps {
  onSubmit: (values: PhotoFormValues) => Promise<unknown>;
  isSaving: boolean;
}

/** FR-OPS-05: downscale to a ~1280px max edge and re-encode at 0.7 JPEG quality before storing. */
const PHOTO_COMPRESSION = { maxEdge: 1280, quality: 0.7 };

const DEFAULT_VALUES: PhotoFormValues = {
  siloTag: "alarm",
  caption: "",
  image: "",
  latitude: null,
  longitude: null,
  captureTimestampUtc: null,
  deviceModel: null,
};

export function PhotoCaptureForm({ onSubmit, isSaving }: PhotoCaptureFormProps) {
  const { t } = useTranslation();

  const form = useForm<PhotoFormValues, unknown, PhotoFormValues>({
    resolver: zodResolver(photoSchema) as Resolver<PhotoFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  const image = form.watch("image");
  const lat = form.watch("latitude");
  const lng = form.watch("longitude");

  const handleExif = (meta: ExifMetadata) => {
    form.setValue("latitude", meta.latitude);
    form.setValue("longitude", meta.longitude);
    form.setValue("captureTimestampUtc", meta.captureTimestampUtc);
    form.setValue("deviceModel", meta.deviceModel || meta.deviceMake);
  };

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset(DEFAULT_VALUES);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          {t("photos:form.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="photo-silo">{t("photos:form.silo")}</Label>
              <Select id="photo-silo" {...form.register("siloTag")}>
                {SILO_TAG_OPTIONS.map((silo) => (
                  <option key={silo} value={silo}>
                    {t(siloLabelKey(silo))}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="photo-caption">{t("photos:form.caption")}</Label>
              <Input
                id="photo-caption"
                placeholder={t("photos:form.captionPlaceholder")}
                {...form.register("caption")}
              />
              {form.formState.errors.caption && (
                <p className="text-xs text-destructive">{t(form.formState.errors.caption.message as string)}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>{t("photos:form.photo")}</Label>
              {lat && lng && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <MapPin className="h-3 w-3" />
                  GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              )}
            </div>
            <CameraCapture
              value={image}
              onChange={(base64) => form.setValue("image", base64, { shouldValidate: true })}
              onExifExtracted={handleExif}
              compress={PHOTO_COMPRESSION}
              error={form.formState.errors.image ? t(form.formState.errors.image.message as string) : undefined}
            />
          </div>

          <Button type="submit" disabled={isSaving || !image} isLoading={isSaving}>
            {t("photos:form.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default PhotoCaptureForm;
