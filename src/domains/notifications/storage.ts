import { Notification } from "@/types/notification";
import { MOCK_NOTIFICATIONS } from "@/mock/notifications";

const STORAGE_KEY = "SSLM_NOTIFICATIONS";

function readAll(): Notification[] {
  if (typeof window === "undefined") return MOCK_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
  } catch (err) {
    console.error("Failed to load notifications from storage", err);
  }
  return MOCK_NOTIFICATIONS;
}

function writeAll(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error("Failed to save notifications to storage", err);
  }
}

/**
 * Notifications visible to the given client company, newest first. Entries
 * without a `clientId` are system-wide and always included. Passing no
 * companyId returns everything (internal roles).
 */
export function getNotifications(companyId?: string): Notification[] {
  const scoped = companyId
    ? readAll().filter((n) => !n.clientId || n.clientId === companyId)
    : readAll();

  return [...scoped].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUnreadCount(companyId?: string): number {
  return getNotifications(companyId).filter((n) => !n.read).length;
}

export function markAsRead(id: string): void {
  const all = readAll();
  const index = all.findIndex((n) => n.id === id);
  if (index === -1 || all[index].read) return;
  all[index] = { ...all[index], read: true };
  writeAll(all);
}

/** Marks every notification the given company can see as read. */
export function markAllAsRead(companyId?: string): void {
  const visible = new Set(getNotifications(companyId).map((n) => n.id));
  writeAll(readAll().map((n) => (visible.has(n.id) ? { ...n, read: true } : n)));
}
