"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Pencil, User, Phone, Globe, CheckCircle2 } from "lucide-react";
import { authApi } from "@/domains/auth";
import { useAuth } from "@/providers/AuthProvider";
import { alertService } from "@/services/alert-service";
import { UserProfileResponseDTO } from "@/domains/users/types";

interface EditProfileDialogProps {
  profile: UserProfileResponseDTO;
  onProfileUpdated?: () => void;
}

export function EditProfileDialog({ profile, onProfileUpdated }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile.name);
  const [phoneNumber, setPhoneNumber] = useState(profile.phone || "");
  const [preferredLanguage, setPreferredLanguage] = useState<"ar" | "en">("ar");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alertService.warning("يرجى إدخال الاسم الكامل");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        preferredLanguage,
      });

      if (res.isSuccess) {
        alertService.success(res.message || "تم تحديث البيانات الشخصية بنجاح!", {
          description: "تم حفظ التغييرات ومزامنتها على الخادم المركزي.",
        });
        await refreshProfile();
        if (onProfileUpdated) onProfileUpdated();
        setOpen(false);
      } else {
        alertService.showApiResponse(res, {
          defaultError: "فشل تحديث البيانات الشخصية.",
        });
      }
    } catch (err: unknown) {
      alertService.showApiError(err, {
        fallbackMessage: "حدث خطأ أثناء حفظ التعديلات. يرجى المحاولة لاحقاً.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs font-semibold border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>تعديل البيانات الأساسية</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-border/50">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <User className="h-4.5 w-4.5 text-primary" />
            <span>تحديث البيانات الشخصية</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
              الاسم الكامل
            </Label>
            <div className="relative">
              <User className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل الاسم الثلاثي"
                className="ps-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
              رقم الجوال (السعودي)
            </Label>
            <div className="relative">
              <Phone className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="05XXXXXXXX"
                dir="ltr"
                className="ps-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <Label htmlFor="lang" className="text-xs font-semibold text-foreground">
              لغة واجهة النظام المفضلة
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreferredLanguage("ar")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  preferredLanguage === "ar"
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>العربية (افتراضي)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredLanguage("en")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  preferredLanguage === "en"
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>English</span>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/50 gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm" className="text-xs">
                إلغاء
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              className="gap-2 text-xs font-bold"
              isLoading={isSubmitting}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>حفظ التعديلات</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
