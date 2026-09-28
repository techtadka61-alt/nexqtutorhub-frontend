"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { roleHomePath, useAuth } from "@/context/auth-context";
import { cn } from "@/lib/cn";
import { UserRole } from "@/types/api";

const ROLE_LABEL: Partial<Record<UserRole, string>> = {
  [UserRole.STUDENT]: "Student",
  [UserRole.TUTOR]: "Tutor",
};

/**
 * Avatar + name + chevron that opens an account dropdown (Dashboard, My profile, Logout). Shared by the
 * marketing navbar and the account dashboard header. Closes on outside click, Escape, or choosing an item.
 */
export function UserMenu({ showName = true, className }: { showName?: boolean; className?: string }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  if (!user) return null;

  const firstName = user.fullName.trim().split(" ")[0] || "Account";
  const close = () => setIsOpen(false);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2.5 transition-colors hover:border-border hover:bg-bg focus-ring"
      >
        <Avatar name={user.fullName} />
        {showName && <span className="hidden text-sm font-semibold text-text-primary sm:inline">{firstName}</span>}
        <ChevronIcon className={cn("text-text-secondary transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface shadow-lifted"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
            <Avatar name={user.fullName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{user.fullName}</p>
              <p className="truncate text-xs text-text-secondary">{user.email}</p>
              {ROLE_LABEL[user.role] && (
                <span className="mt-1 inline-block rounded-full bg-brand-secondary-light px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                  {ROLE_LABEL[user.role]} account
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col p-1.5">
            <MenuLink href={roleHomePath(user.role)} icon={<GridIcon />} onSelect={close}>
              Dashboard
            </MenuLink>
            <MenuLink href="/account/profile" icon={<UserIcon />} onSelect={close}>
              My profile
            </MenuLink>
          </div>

          <div className="border-t border-border p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                void logout();
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  onSelect,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-brand-secondary-light hover:text-brand-primary"
    >
      <span className="text-text-secondary">{icon}</span>
      {children}
    </Link>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-secondary-light text-sm font-bold text-brand-primary">
      {name.trim()[0]?.toUpperCase() ?? "U"}
    </span>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
