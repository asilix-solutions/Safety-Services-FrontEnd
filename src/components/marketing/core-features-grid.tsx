"use client";

import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import {
  Globe2,
  FileCheck,
  Receipt,
  MapPin,
  GitFork,
  Users2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function CoreFeaturesGrid() {
  const { t } = useTranslation();

  const features = [
    {
      id: "tenancy",
      icon: Globe2,
      title: t("marketing:feat_tenancy_title"),
      desc: t("marketing:feat_tenancy_desc"),
      tag: "Multi-Tenancy",
      color: "from-blue-500/20 to-indigo-500/10",
      textColor: "text-blue-500",
    },
    {
      id: "blueprint",
      icon: FileCheck,
      title: t("marketing:feat_blueprint_title"),
      desc: t("marketing:feat_blueprint_desc"),
      tag: "SBC 801 Code",
      color: "from-amber-500/20 to-orange-500/10",
      textColor: "text-amber-500",
    },
    {
      id: "zatca",
      icon: Receipt,
      title: t("marketing:feat_zatca_title"),
      desc: t("marketing:feat_zatca_desc"),
      tag: "ZATCA 15%",
      color: "from-emerald-500/20 to-teal-500/10",
      textColor: "text-emerald-500",
    },
    {
      id: "gps",
      icon: MapPin,
      title: t("marketing:feat_gps_title"),
      desc: t("marketing:feat_gps_desc"),
      tag: "GPS Governance",
      color: "from-rose-500/20 to-pink-500/10",
      textColor: "text-rose-500",
    },
    {
      id: "workflow",
      icon: GitFork,
      title: t("marketing:feat_workflow_title"),
      desc: t("marketing:feat_workflow_desc"),
      tag: "11-Stage Workflow",
      color: "from-purple-500/20 to-indigo-500/10",
      textColor: "text-purple-500",
    },
    {
      id: "rbac",
      icon: Users2,
      title: t("marketing:feat_rbac_title"),
      desc: t("marketing:feat_rbac_desc"),
      tag: "Enterprise RBAC",
      color: "from-sky-500/20 to-cyan-500/10",
      textColor: "text-sky-500",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative bg-secondary/15 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("marketing:features_badge")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            {t("marketing:features_title")}
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground font-normal">
            {t("marketing:features_subtitle")}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="border-border/60 bg-card/75 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`h-6 w-6 ${item.textColor}`} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-secondary/80 text-muted-foreground border border-border/40">
                      {item.tag}
                    </span>
                  </div>

                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
