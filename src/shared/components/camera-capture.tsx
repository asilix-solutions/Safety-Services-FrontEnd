"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCcw, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";

interface CompressOptions {
  /** Longest edge (px) the captured/uploaded image is downscaled to. */
  maxEdge: number;
  /** JPEG quality (0-1) applied on re-encode. */
  quality: number;
}

interface CameraCaptureProps {
  value: string;
  onChange: (base64: string) => void;
  error?: string;
  disabled?: boolean;
  /** Optional client-side compression (canvas downscale + JPEG re-encode). Off by default. */
  compress?: CompressOptions;
}

function computeScaledSize(width: number, height: number, maxEdge: number) {
  const largestEdge = Math.max(width, height);
  if (largestEdge <= maxEdge) return { width, height };
  const scale = maxEdge / largestEdge;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Reusable browser-camera capture widget (getUserMedia, with a file-input fallback
 * that prefers the live camera via capture="environment" per FR-OPS-05).
 * Shared by the Procurement and Photos sub-features (src/shared/components per CLAUDE.md).
 */
export function CameraCapture({ value, onChange, error, disabled, compress }: CameraCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError(t("common:camera.cameraUnavailable"));
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const { width, height } = compress
      ? computeScaledSize(video.videoWidth, video.videoHeight, compress.maxEdge)
      : { width: video.videoWidth, height: video.videoHeight };
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", compress?.quality ?? 0.85);
    onChange(dataUrl);
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!compress) {
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const { width, height } = computeScaledSize(img.naturalWidth, img.naturalHeight, compress.maxEdge);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        onChange(canvas.toDataURL("image/jpeg", compress.quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearImage = () => onChange("");

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={t("common:camera.previewAlt")} className="w-full h-auto object-cover" />
          {!disabled && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 end-2 rounded-full bg-background/90 p-1 text-foreground shadow-sm cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {!disabled && (
          <Button type="button" variant="outline" size="sm" onClick={clearImage}>
            <RefreshCcw className="h-3.5 w-3.5 me-2" />
            {t("common:camera.retake")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isCameraActive ? (
        <div className="space-y-2">
          <video
            ref={videoRef}
            className="w-full max-w-xs rounded-lg border border-border bg-card"
            muted
            playsInline
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={capturePhoto}>
              <Camera className="h-3.5 w-3.5 me-2" />
              {t("common:camera.capture")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={stopCamera}>
              {t("common:camera.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={startCamera} disabled={disabled}>
            <Camera className="h-3.5 w-3.5 me-2" />
            {t("common:camera.openCamera")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <ImagePlus className="h-3.5 w-3.5 me-2" />
            {t("common:camera.chooseFile")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
      {cameraError && <p className="text-xs text-destructive">{cameraError}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default CameraCapture;
