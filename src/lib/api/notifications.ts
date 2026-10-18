import { api } from "../api-client";
import type { AppNotification } from "@/types/api";

interface NotificationList {
  message: string;
  items: AppNotification[];
  unreadCount: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const notificationsApi = {
  list: (limit = 20) => api.get<NotificationList>(`/notifications/me?limit=${limit}`),
  unreadCount: () => api.get<{ unreadCount: number }>("/notifications/me/unread-count"),
  markRead: (id: string) => api.patch<{ unreadCount: number }>(`/notifications/me/${id}/read`),
  markAllRead: () => api.patch<{ unreadCount: number }>("/notifications/me/read-all"),
};
