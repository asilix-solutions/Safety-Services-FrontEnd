"use client";

import React, { useEffect, useState } from "react";
import { Crosshair, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useTranslation } from "@/providers/i18n-provider";

const GEOLOCATION_TIMEOUT_MS = 8000;
/** Six decimals is roughly 0.1 m — more than a facility pin needs. */
const COORDINATE_PRECISION = 6;

interface GeoCoordinatesFieldProps {
  /** The stored `"lat, lng"` string. Empty when nothing has been captured yet. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

function parseCoordinates(value: string): { lat: string; lng: string } {
  const [lat = "", lng = ""] = (value || "").split(",");
  return { lat: lat.trim(), lng: lng.trim() };
}

function composeCoordinates(lat: string, lng: string): string {
  if (!lat.trim() && !lng.trim()) return "";
  return `${lat.trim()}, ${lng.trim()}`;
}

function isCompleteCoordinate(lat: string, lng: string): boolean {
  return lat.trim() !== "" && lng.trim() !== "" && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));
}

/**
 * Captures a facility pin as latitude/longitude without an embedded map.
 * FR-INT-01 asks for a coordinate pair; the interactive Google Maps pin it
 * names belongs to the integration layer, which the MVP does not ship (it
 * needs an API key and a backend). Until then this collects the same output
 * the pin would have produced, and links out for visual confirmation.
 */
export function GeoCoordinatesField({ value, onChange, label, required }: GeoCoordinatesFieldProps) {
  const { t } = useTranslation();
  const [locating, setLocating] = useState(false);
  const [lat, setLat] = useState(() => parseCoordinates(value).lat);
  const [lng, setLng] = useState(() => parseCoordinates(value).lng);

  // Adopt writes that did not come from these two inputs — the locate button
  // and the restored draft both set the form value directly.
  useEffect(() => {
    const parsed = parseCoordinates(value);
    if (parsed.lat !== lat || parsed.lng !== lng) {
      setLat(parsed.lat);
      setLng(parsed.lng);
    }
  }, [value]);

  const commit = (nextLat: string, nextLng: string) => {
    setLat(nextLat);
    setLng(nextLng);
    onChange(composeCoordinates(nextLat, nextLng));
  };

  const handleLocate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error(t("requests:wizard.serviceDetails.geolocationUnsupported"));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        commit(
          position.coords.latitude.toFixed(COORDINATE_PRECISION),
          position.coords.longitude.toFixed(COORDINATE_PRECISION)
        );
        toast.success(t("requests:wizard.serviceDetails.geolocationCaptured"));
      },
      () => {
        setLocating(false);
        toast.error(t("requests:wizard.serviceDetails.geolocationDenied"));
      },
      { timeout: GEOLOCATION_TIMEOUT_MS, enableHighAccuracy: true }
    );
  };

  const complete = isCompleteCoordinate(lat, lng);
  const mapsUrl = complete
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat.trim()},${lng.trim()}`)}`
    : null;

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-foreground/80">
        {label}
        {required && <span className="text-destructive ms-0.5">*</span>}
      </Label>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="geo-latitude" className="text-[10px] font-medium text-muted-foreground">
            {t("requests:wizard.serviceDetails.latitude")}
          </Label>
          <Input
            id="geo-latitude"
            dir="ltr"
            inputMode="decimal"
            className="font-mono text-xs"
            placeholder="24.713600"
            value={lat}
            onChange={(event) => commit(event.target.value, lng)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="geo-longitude" className="text-[10px] font-medium text-muted-foreground">
            {t("requests:wizard.serviceDetails.longitude")}
          </Label>
          <Input
            id="geo-longitude"
            dir="ltr"
            inputMode="decimal"
            className="font-mono text-xs"
            placeholder="46.675300"
            value={lng}
            onChange={(event) => commit(lat, event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleLocate}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          {locating
            ? t("requests:wizard.serviceDetails.geolocationLocating")
            : t("requests:wizard.serviceDetails.useMyLocation")}
        </Button>

        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              {t("requests:wizard.serviceDetails.openInMaps")}
            </Button>
          </a>
        )}
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        {t("requests:wizard.serviceDetails.geolocationHint")}
      </p>
    </div>
  );
}

export default GeoCoordinatesField;
