"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { notificationsApi } from "@/lib/api/notifications";
import { cn } from "@/lib/cn";
import { UserRole, type AppNotification, type NotificationType } from "@/types/api";

/** How often the unread badge is refreshed while the tab is visible. */
const POLL_MS = 45_000;

/**
 * Bell with an unread badge and a dropdown of recent notifications (new nearby requests for tutors, tutor
 * applications for students, …). The badge polls a cheap count endpoint; the list loads when opened.
 */
export function NotificationBell({ className }: { className?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Badge only; a failed poll just keeps the last count.
  const refreshCount = useCallback(
    () =>
      notificationsApi
        .unreadCount()
        .then((res) => setUnread(res.unreadCount))
        .catch(() => undefined),
    [],
  );

  const loadList = useCallback(
    () =>
      notificationsApi
        .list(20)
        .then((res) => {
          setError(false);
          setItems(res.items);
          setUnread(res.unreadCount);
        })
        .catch(() => {
          setError(true);
          setItems((current) => current ?? []);
        }),
    [],
  );

  useEffect(() => {
    if (!user) return;
    void refreshCount();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshCount();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && void refreshCount();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, refreshCount]);

  useEffect(() => {
    if (!isOpen) return;
    void loadList();
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, loadList]);

  if (!user) return null;

  async function open(item: AppNotification) {
    setIsOpen(false);
    if (!item.readAt) {
      setItems((list) => list?.map((n) => (n._id === item._id ? { ...n, readAt: new Date().toISOString() } : n)) ?? null);
      setUnread((n) => Math.max(0, n - 1));
      notificationsApi.markRead(item._id).catch(() => undefined);
    }
    if (item.link) router.push(item.link);
  }

  async function markAllRead() {
    setItems((list) => list?.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })) ?? null);
    setUnread(0);
    notificationsApi.markAllRead().catch(() => void refreshCount());
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-brand-secondary-light hover:text-brand-primary focus-ring"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-20 z-50 overflow-hidden rounded-2xl border border-border bg-surface shadow-lifted sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="cursor-pointer text-xs font-semibold text-brand-secondary hover:text-brand-primary"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,28rem)] overflow-y-auto">
            {items === null ? (
              <p className="px-4 py-8 text-center text-sm text-text-secondary">Loading…</p>
            ) : error && !items.length ? (
              <p className="px-4 py-8 text-center text-sm text-error">Couldn&apos;t load notifications.</p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-secondary-light text-brand-primary">
                  <BellIcon />
                </span>
                <p className="text-sm font-semibold text-text-primary">You&apos;re all caught up</p>
                <p className="text-xs text-text-secondary">{emptyHint(user.role)}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item._id}>
                    <button
                      type="button"
                      onClick={() => open(item)}
                      className={cn(
                        "flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors hover:bg-bg",
                        !item.readAt && "bg-brand-secondary-light/40",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          TYPE_STYLE[item.type].className,
                        )}
                      >
                        {TYPE_STYLE[item.type].icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className={cn("text-sm text-text-primary", !item.readAt && "font-semibold")}>
                            {item.title}
                          </span>
                          {!item.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-secondary" />}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-text-secondary">{item.body}</span>
                        <span className="mt-1 block text-[11px] text-text-secondary/80">{timeAgo(item.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function emptyHint(role: UserRole) {
  return role === UserRole.TUTOR
    ? "We'll let you know when a student near you posts a requirement."
    : "We'll let you know when a tutor near you applies, or applies to your request.";
}

function timeAgo(value: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

const TYPE_STYLE: Record<NotificationType, { icon: React.ReactNode; className: string }> = {
  "tuition_request.nearby": { icon: <PinIcon />, className: "bg-brand-secondary-light text-brand-primary" },
  "tuition_request.application": { icon: <UserPlusIcon />, className: "bg-info/10 text-info" },
  "tuition_request.accepted": { icon: <CheckIcon />, className: "bg-success/10 text-success" },
  "tutor.nearby": { icon: <PinIcon />, className: "bg-brand-secondary-light text-brand-primary" },
};

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9Z" strokeLinejoin="round" />
      <path d="M10.3 21a1.94 1.94 0 003.4 0" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="4" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6M19 8v6M16 11h6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
