"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { seoSettingsSchema, SeoSettingsFormValues } from "@/schemas/settings.schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Globe, Save } from "lucide-react";
import { toast } from "sonner";

export function SeoSettingsView() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<SeoSettingsFormValues>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      metaTitle: "بوابة خدمات وتراخيص السلامة الهندسية | فيرتكس",
      metaDescription: "منصة الامتثال الهندسي، مراجعة المخططات، وإصدار شهادات وتقارير السلامة المعتمدة.",
      keywords: "تراخيص سلامة, دفاع مدني, مخططات هندسية, استشارات سلامة, الرياض",
      ogTitle: "بوابة فيرتكس لخدمات السلامة الهندسية",
      ogDescription: "النظام المتكامل لإدارة التراخيص والمخططات الهندسية.",
      ogImageUrl: "https://vertex.sslm.sa/og-image.png",
      twitterCardType: "summary_large_image",
      enableSearchIndexing: true,
      customRobotsTxt: "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /company-admin/",
    },
  });

  const onSubmit = async (_data: SeoSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      toast.success("تم تحديث إعدادات محركات البحث وOpenGraph بنجاح!");
    } catch {
      toast.error("فشل حفظ إعدادات SEO.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Globe className="h-4.5 w-4.5 text-primary" />
              <span>تهيئة محركات البحث وبطاقات المشاركة (SEO & OpenGraph)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              تخصيص العناوين الوصفية، وسوم المشاركة على منصات التواصل، وقواعد الفهرسة.
            </CardDescription>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={!isDirty || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="gap-2 font-bold shadow-md shadow-primary/20"
          >
            <Save className="h-4 w-4" />
            <span>حفظ التغييرات</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">عنوان الصفحة (Meta Title)</label>
              <input
                type="text"
                {...register("metaTitle")}
                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.metaTitle && (
                <p className="text-[11px] text-destructive">{errors.metaTitle.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">عنوان المشاركة (OG Title)</label>
              <input
                type="text"
                {...register("ogTitle")}
                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.ogTitle && (
                <p className="text-[11px] text-destructive">{errors.ogTitle.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">الوصف الرئيسي (Meta Description)</label>
            <textarea
              rows={2}
              {...register("metaDescription")}
              className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.metaDescription && (
              <p className="text-[11px] text-destructive">{errors.metaDescription.message}</p>
            )}
          </div>

          {/* Keywords & OG Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">الكلمات الدلالية (Keywords)</label>
              <input
                type="text"
                placeholder="افصل بين الكلمات بفاصلة (,)"
                {...register("keywords")}
                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">رابط صورة المشاركة (OG Image URL)</label>
              <input
                type="url"
                dir="ltr"
                {...register("ogImageUrl")}
                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-start"
              />
            </div>
          </div>

          {/* Robots.txt & Indexing Toggle */}
          <div className="space-y-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enable-indexing"
                {...register("enableSearchIndexing")}
                className="rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="enable-indexing" className="text-xs text-foreground font-medium cursor-pointer select-none">
                السماح لمحركات البحث بفهرسة الصفحات العامة للبوابة
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">ملف توجيه محركات البحث (Robots.txt)</label>
              <textarea
                rows={3}
                dir="ltr"
                {...register("customRobotsTxt")}
                className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
