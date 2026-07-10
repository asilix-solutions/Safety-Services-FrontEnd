"use client";

import React from "react";
import { PenLine, ImagePlus } from "lucide-react";
import { ClosureMethod } from "@/domains/closure/types";
import { useTranslation } from "@/providers/i18n-provider";
import { Button } from "@/shared/ui/button";
import { SignaturePad } from "@/shared/components/signature-pad";
import { CameraCapture } from "@/shared/components/camera-capture";

interface SignatureCaptureProps {
  value: string;
  method: ClosureMethod;
  onChange: (value: string, method: ClosureMethod) => void;
  error?: string;
}

const UPLOAD_COMPRESSION = { maxEdge: 1280, quality: 0.8 };

export function SignatureCapture({ value, method, onChange, error }: SignatureCaptureProps) {
  const { t } = useTranslation();

  const handleModeChange = (nextMethod: ClosureMethod) => {
    if (nextMethod === method) return;
    onChange("", nextMethod);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={method === "canvas" ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("canvas")}
        >
          <PenLine className="h-3.5 w-3.5 me-2" />
          {t("closure:form.methodDraw")}
        </Button>
        <Button
          type="button"
          variant={method === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("upload")}
        >
          <ImagePlus className="h-3.5 w-3.5 me-2" />
          {t("closure:form.methodUpload")}
        </Button>
      </div>

      {method === "canvas" ? (
        <SignaturePad value={value} onChange={(base64) => onChange(base64, "canvas")} />
      ) : (
        <CameraCapture
          value={value}
          onChange={(base64) => onChange(base64, "upload")}
          compress={UPLOAD_COMPRESSION}
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default SignatureCapture;
