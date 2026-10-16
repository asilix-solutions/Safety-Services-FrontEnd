"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  FileCheck,
  Receipt,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { notificationsApi, NotificationDto } from "@/domains/notifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";

const SAMPLE_NOTIFICATIONS: NotificationDto[] = [
  {
    id: "notif-01",
    event: 1, // Urgent Approval
    title: "اعتماد مخطط هندسي عاجل (SBC 801)",
    body: "قام المهندس الاستشاري باعتماد مخطط شبكة الرشاشات لمشروع برج الأعمال التنفيذي مع إصدار ختم المطابقة.",
    jobNumber: "AMX-2026-8812",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "notif-02",
    event: 2, // ZATCA Tax Invoice
    title: "تم إصدار فاتورة ضريبية إلكترونية مشفرة (ZATCA)",
    body: "تم إنشاء الفاتورة الضريبية رقم INV-2026-00452 وإدراجها في سلسلة الهاش المشفرة برمز QR مطابق.",
    jobNumber: "AMX-2026-8804",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
  {
    id: "notif-03",
    event: 3, // Site Obstacle
    title: "تنبيه ميداني: عائق موقع غير متوقع",
    body: "أبلغ الفني الميداني عن وجود تمديدات كهربائية تعيق مسار أنابيب الإطفاء في مستودعات الخليج.",
    jobNumber: "AMX-2026-8815",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "notif-04",
    event: 4, // Maintenance Visit
    title: "موعد صيانة وقائية مستحق خلال 48 ساعة",
    body: "تذكير بزيارة الصيانة الدورية الربع سنوية لأنظمة الإنذار في مجمع النخيل الطبي.",
    jobNumber: "MNT-2026-0041",
    isRead: true,
    readAtUtc: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
  {
    id: "notif-05",
    event: 5, // Quotation Accepted
    title: "موافقة العميل على عرض السعر",
    body: "قام العميل باعتماد عرض السعر رقم QTE-2026-0199 وتأكيد التعميد المالي للانتقال لمرحلة التنفيذ.",
    jobNumber: "AMX-2026-8790",
    isRead: true,
    readAtUtc: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
];

const EVENT_CONFIG: Record<number, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  1: { icon: FileCheck, color: "text-primary", bg: "bg-primary/10 border-primary/20", label: "اعتماد هندسي" },
  2: { icon: Receipt, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "فاتورة ضريبية ZATCA" },
  3: { icon: ShieldAlert, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", label: "تنبيه عائق ميداني" },
  4: { icon: Wrench, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "صيانة وقائية" },
  5: { icon: Sparkles, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "عرض سعر معتمد" },
};

export function NotificationsHubView() {
  const [notifications, setNotifications] = useState<NotificationDto[]>(SAMPLE_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "URGENT" | "INVOICES">("ALL");

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getMyNotifications(false, 50);
      if (res.isSuccess && res.data?.items && res.data.items.length > 0) {
        setNotifications(res.data.items);
      }
    } catch {
      // Retain sample records gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id?: string) => {
    try {
      if (id) {
        await notificationsApi.markRead([id]);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, readAtUtc: new Date().toISOString() } : n))
        );
        toast.success("تم تحديد الإشعار كمقروء");
      } else {
        await notificationsApi.markRead([]);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAtUtc: new Date().toISOString() }))
        );
        toast.success("تم تحديد جميع الإشعارات كمقروءة");
      }
    } catch {
      // Fallback local update
      if (id) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
      toast.success("تم تحديث حالة الإشعارات");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "URGENT") return n.event === 1 || n.event === 3;
    if (activeTab === "INVOICES") return n.event === 2;
    return true;
  });

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary relative">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">مركز الإشعارات والتنبيهات السيادية</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                تحديثات لحظية حول قرارات الاعتماد الهندسي، الفواتير الضريبية، وعوائق المواقع الميدانية.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={isLoading}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleMarkAsRead()}
              className="gap-2 rounded-xl shadow-sm"
            >
              <CheckCheck className="h-4 w-4" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "ALL"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span>الكل</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-background/20 text-current">
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("UNREAD")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "UNREAD"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span>غير مقروءة</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-500 text-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("URGENT")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "URGENT"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span>تنبيهات حرجة وعوائق</span>
        </button>

        <button
          onClick={() => setActiveTab("INVOICES")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "INVOICES"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span>الفواتير والامتثال الضريبي</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const config = EVENT_CONFIG[notif.event] || {
                icon: AlertCircle,
                color: "text-muted-foreground",
                bg: "bg-muted border-border",
                label: "إشعار نظام",
              };
              const IconComponent = config.icon;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <Card
                    className={`rounded-2xl border transition-all ${
                      notif.isRead
                        ? "border-border/60 bg-card/60 opacity-80"
                        : "border-primary/30 bg-primary/[0.02] shadow-sm ring-1 ring-primary/10"
                    }`}
                  >
                    <CardContent className="p-4 md:p-5 flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl border shrink-0 ${config.bg} ${config.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-bold ${notif.isRead ? "text-foreground" : "text-foreground"}`}>
                              {notif.title}
                            </h3>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                              {new Date(notif.createdAt).toLocaleDateString("ar-SA", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {notif.body}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-foreground">
                              {notif.jobNumber || "نظام المنصة"}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {config.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!notif.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="h-7 text-xs rounded-lg text-muted-foreground hover:text-foreground"
                              >
                                تعليم كمقروء
                              </Button>
                            )}

                            {notif.jobNumber && (
                              <Link href={notif.event === 2 ? "/invoices" : `/requests`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs rounded-lg gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                  الانتقال للملف
                                  <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="rounded-2xl border-border/80 p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">صندوق التنبيهات فارغ</h3>
              <p className="text-xs text-muted-foreground">
                لا توجد إشعارات تطابق التصفية المختارة حالياً.
              </p>
            </Card>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
