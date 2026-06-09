import { Notification } from "@/types/notification";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Critical Overdue Maintenance",
    message: "The sewage lift station inspection in Line 4 Tunnel segment is 7 days overdue.",
    type: "error",
    read: false,
    actionUrl: "/maintenance",
    createdAt: "2026-06-05T08:00:00Z",
  },
  {
    id: "notif-2",
    title: "Permit Application In Review",
    message: "Gulf Annex Hazardous Materials Permit is now under review by Dubai Civil Defence.",
    type: "info",
    read: false,
    actionUrl: "/licenses",
    createdAt: "2026-06-03T11:20:00Z",
  },
  {
    id: "notif-3",
    title: "Fire Safety Certificate Approved",
    message: "Skyline Tower Fire Certificate has been successfully issued.",
    type: "success",
    read: true,
    actionUrl: "/licenses",
    createdAt: "2026-06-01T14:30:00Z",
  },
  {
    id: "notif-4",
    title: "Action Required on Project Plan",
    message: "Metro Line 4 Ventilation Plan requires air flow adjustments from consulting engineer.",
    type: "warning",
    read: false,
    actionUrl: "/projects",
    createdAt: "2026-05-15T10:45:00Z",
  },
];
