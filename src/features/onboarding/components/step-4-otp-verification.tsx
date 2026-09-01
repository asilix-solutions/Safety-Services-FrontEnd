"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { OtpInputGroup } from "@/features/auth/reset-password";
import { toast } from "sonner";

interface Step4OtpVerificationProps {
  email: string;
  subdomain: string;
  onVerify: (otp: string) => Promise<void>;
  onPrev: () => void;
  isSubmitting?: boolean;
}

export function Step4OtpVerification({
  email,
  subdomain,
  onVerify,
  onPrev,
  isSubmitting = false,
}: Step4OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0) return;
    toast.info("تم إعادة إرسال رمز التحقق OTP بنجاح");
    setCooldown(60);
  };

  const handleComplete = async () => {
    if (otp.length === 6) {
      await onVerify(otp);
    }
  };

  return (
    <>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <CardTitle className="text-xl font-bold text-foreground">
          التحقق من الهوية وتفعيل المنشأة
        </CardTitle>
        <CardDescription className="max-w-md mx-auto">
          تم إرسال رمز تحقق OTP مكون من 6 أرقام إلى البريد الإلكتروني:{" "}
          <span className="font-bold text-foreground font-mono">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-muted-foreground">أدخل رمز التحقق:</span>
            <button
              type="button"
              disabled={cooldown > 0}
              onClick={handleResend}
              className="text-primary hover:underline disabled:text-muted-foreground cursor-pointer disabled:cursor-not-allowed font-medium"
            >
              {cooldown > 0 ? `إعادة الإرسال خلال (${cooldown}s)` : "إعادة إرسال الرمز"}
            </button>
          </div>

          <OtpInputGroup value={otp} onChange={setOtp} disabled={isSubmitting} />
        </div>

        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">معلومات البوابة الجاهزة للإطلاق:</p>
          <p>
            رابط مساحة العمل:{" "}
            <span className="font-bold text-primary font-mono" dir="ltr">
              https://{subdomain || "company"}.sslm.sa
            </span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border/40 pt-4">
        <Button variant="ghost" size="sm" onClick={onPrev} disabled={isSubmitting} className="gap-1.5">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>تعديل البيانات</span>
        </Button>

        <Button
          size="sm"
          className="gap-2 font-bold shadow-lg shadow-primary/25"
          disabled={otp.length !== 6 || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleComplete}
        >
          <span>تأكيد وتفعيل البوابة</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </CardFooter>
    </>
  );
}
