import { Notification } from "@/types/notification";

/**
 * Seed notifications. Every `actionUrl` must resolve to a real route under
 * `app/(dashboard)`, and every referenced entity must exist in the other mocks
 * (`mock/requests.ts`, `mock/projects.ts`, `domains/invoices/storage.ts`).
 * Entries without `clientId` are system-wide.
 */
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "فاتورة بانتظار السداد",
    message: "الفاتورة INV-2026-001 الخاصة بالطلب SSLM-2026-000001 مستحقة السداد بتاريخ 28 يوليو 2026.",
    type: "warning",
    read: false,
    actionUrl: "/invoices",
    clientId: "c-102",
    createdAt: "2026-06-25T08:00:00Z",
  },
  {
    id: "notif-2",
    title: "الطلب قيد المراجعة",
    message: "تم استلام الطلب SSLM-2026-000001 لمنشأة Skyline Tower Floor 12 وهو الآن قيد المراجعة الفنية.",
    type: "info",
    read: false,
    actionUrl: "/requests/SSLM-2026-000001",
    clientId: "c-102",
    createdAt: "2026-06-01T08:30:00Z",
  },
  {
    id: "notif-3",
    title: "تقدّم في تنفيذ المشروع",
    message: "اكتمل اختبار ضغط المياه في مشروع Skyline Tower Fire Certification.",
    type: "success",
    read: true,
    actionUrl: "/projects/PROJ-8821",
    clientId: "c-102",
    createdAt: "2026-05-20T14:30:00Z",
  },
  {
    id: "notif-4",
    title: "صيانة دورية متأخرة",
    message: "توجد أعمال صيانة وقائية متأخرة عن موعدها المجدول وتحتاج إلى متابعة.",
    type: "error",
    read: false,
    actionUrl: "/maintenance",
    createdAt: "2026-06-05T08:00:00Z",
  },
];
