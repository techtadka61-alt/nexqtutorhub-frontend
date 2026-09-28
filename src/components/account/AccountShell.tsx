"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/api";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function navFor(role: UserRole): NavItem[] {
  const base = role === UserRole.STUDENT ? "/account/student" : "/account/tutor";
  return [
    { href: base, label: "Overview", icon: <HomeIcon /> },
    ...(role === UserRole.STUDENT ? [{ href: "/find-tutors", label: "Find tutors", icon: <SearchIcon /> }] : []),
    { href: "/account/profile", label: "My profile", icon: <UserIcon /> },
  ];
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user ? navFor(user.role) : [];
  const roleLabel = user?.role === UserRole.TUTOR ? "Tutor" : "Student";

  return (
    <div className="flex min-h-screen bg-bg">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-border bg-surface transition-transform lg:static lg:translate-x-0",
          isSidebarOpen && "translate-x-0",
        )}
      >
        <div className="flex h-20 items-center border-b border-border px-6">
          <Logo variant="horizontal" />
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-primary text-white"
                    : "text-text-secondary hover:bg-brand-secondary-light hover:text-brand-primary",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-border p-4">
          <button
            onClick={() => logout()}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-error/10"
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-border bg-surface px-5 sm:px-8">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-primary lg:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-text-primary">
              {user?.fullName ? `Welcome, ${user.fullName.split(" ")[0]}` : "Welcome"}
            </p>
            <p className="text-xs text-text-secondary">{roleLabel} account</p>
          </div>

          <div className="flex items-center gap-3">
            {!user?.isEmailVerified && (
              <span className="hidden rounded-full bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning sm:inline-block">
                Email not verified
              </span>
            )}
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 11l8-7 8 7v8a2 2 0 01-2 2h-3v-6H9v6H6a2 2 0 01-2-2v-8Z" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
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

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
