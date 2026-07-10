"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";

const PAD_WIDTH = 600;
const PAD_HEIGHT = 200;

interface SignaturePadProps {
  value: string;
  onChange: (base64: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Reusable HTML5 canvas signature pad (draw + clear, exports a base64 PNG data URI).
 * Shared by the Completion/Closure sub-feature (src/shared/components per CLAUDE.md).
 */
export function SignaturePad({ value, onChange, error, disabled }: SignaturePadProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || isDirtyRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!value) return;

    const img = new window.Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = value;
  }, [value]);

  const getPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = getPoint(event);
    if (!canvas || !ctx || !point) return;

    canvas.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    isDirtyRef.current = true;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "currentColor";
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const point = getPoint(event);
    if (!ctx || !point) return;
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isDirtyRef.current = false;
    onChange("");
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={PAD_WIDTH}
        height={PAD_HEIGHT}
        className="w-full max-w-md rounded-lg border border-border bg-card text-foreground touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={!value}>
          <Eraser className="h-3.5 w-3.5 me-2" />
          {t("common:signaturePad.clear")}
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default SignaturePad;
