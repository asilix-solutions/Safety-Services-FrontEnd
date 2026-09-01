"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Building2, ShieldCheck, FileCheck, Phone, Mail, MapPin, Globe, Award } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function CompanyOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="الملف المؤسسي والاعتمادات الرسمية (Company Overview)"
        description="بيانات السجل التجاري، ترخيص الدفاع المدني، ونطاق الاعتماد الهندسي للمنشأة."
      />

      {/* Main Profile Banner */}
      <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/25 via-primary/10 to-accent/15" />
        <CardContent className="p-6 pt-0 -mt-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center p-3 text-primary">
                <Building2 className="w-10 h-10" />
              </div>
              <div className="space-y-1 text-center sm:text-start">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-foreground">
                    شركة فيرتكس لاستشارات السلامة الهندسية
                  </h2>
                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    معتمد رسمياً ✓
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Vertex Industrial Safety Solutions Co. Ltd</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs py-1 px-3 border-primary/30 bg-primary/5">
                {user?.tenantId || "COMP-001"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials & Legal Licensing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Licensing Details */}
        <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4.5 w-4.5 text-primary" />
              <span>بيانات التراخيص الحكومية والاعتمادات</span>
            </CardTitle>
            <CardDescription className="text-xs">
              تراخيص الدفاع المدني ووزارة التجارة سارية المفعول.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground">رقم السجل التجاري (CR):</span>
              <span className="font-mono font-bold text-foreground">1010998822</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground">الرقم الموحد (700):</span>
              <span className="font-mono font-bold text-foreground">7001889922</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground">ترخيص المديرية العامة للدفاع المدني:</span>
              <span className="font-mono font-bold text-primary">CD-REG-88221</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground">الرقم الضريبي ZATCA VAT:</span>
              <span className="font-mono font-bold text-foreground">300998822100003</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground">تصنيف المكتب الهندسي:</span>
              <Badge variant="secondary" className="text-[11px] font-bold">
                فئة أ - استشارات هندسية شاملة
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details & Addresses */}
        <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              <span>معلومات الاتصال والموقع الجغرافي</span>
            </CardTitle>
            <CardDescription className="text-xs">
              العنوان الوطني المسجل وقنوات الدعم المباشر.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>العنوان الوطني:</span>
              </div>
              <span className="text-foreground font-medium">طريق الملك فهد، حي العليا، الرياض</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>البريد الإلكتروني الرسمي:</span>
              </div>
              <span className="font-mono text-foreground">info@vertexindustrial.com</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>هاتف الاتصال والدعم:</span>
              </div>
              <span className="font-mono text-foreground" dir="ltr">+966 11 4455667</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4 text-primary" />
                <span>بوابة مساحة العمل المستقلة:</span>
              </div>
              <span className="font-mono text-primary font-semibold" dir="ltr">
                https://vertex.sslm.sa
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
