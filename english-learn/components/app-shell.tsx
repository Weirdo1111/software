"use client";

import Link from "next/link";
import {
  BookOpen,
  ChartNoAxesColumn,
  Compass,
  FileCheck2,
  House,
  Settings,
  LogIn,
  User,
  LogOut,
} from "lucide-react";
import { useSyncExternalStore } from "react";

import { ProtectedAction } from "@/components/protected-action";
import { type Locale, t } from "@/lib/i18n/dictionaries";

const nav = [
  { href: "/", key: "nav_home", icon: House, protected: false },
  {
    href: "/placement-test",
    key: "nav_assessment",
    icon: FileCheck2,
    protected: true,
  },
  { href: "/learn", key: "nav_learn", icon: Compass, protected: true },
  {
    href: "/dashboard",
    key: "nav_dashboard",
    icon: BookOpen,
    protected: true,
  },
  {
    href: "/progress",
    key: "nav_progress",
    icon: ChartNoAxesColumn,
    protected: true,
  },
  {
    href: "/settings",
    key: "nav_settings",
    icon: Settings,
    protected: true,
  },
] as const;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("demo-auth-changed", onStoreChange as EventListener);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("demo-auth-changed", onStoreChange as EventListener);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("demo_logged_in") === "true";
}

function getServerSnapshot() {
  return false;
}

export function AppShell({ locale }: { locale: Locale }) {
  const isLoggedIn = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const accountLabel = locale === "zh" ? "我的账户" : "My account";
  const loginLabel = locale === "zh" ? "登录" : "Log in";
  const logoutLabel = locale === "zh" ? "退出登录" : "Log out";

  const handleLogout = () => {
    localStorage.removeItem("demo_logged_in");
    localStorage.removeItem("demo_user");
    window.dispatchEvent(new Event("demo-auth-changed"));
    window.location.href = "/";
  };

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.88)] p-2 shadow-[0_14px_36px_rgba(23,32,51,0.08)] backdrop-blur-md">
      {nav.map((item) => {
        const Icon = item.icon;

        const content = (
          <>
            <Icon className="size-4" />
            <span>{t(locale, item.key)}</span>
          </>
        );

        if (!item.protected) {
          return (
            <Link
              key={item.href}
              href={`${item.href}?lang=${locale}`}
              className="inline-flex items-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--navy)] hover:text-[#f7efe3]"
            >
              {content}
            </Link>
          );
        }

        return (
          <ProtectedAction
            key={item.href}
            href={`${item.href}?lang=${locale}`}
            locale={locale}
            isLoggedIn={isLoggedIn}
            className="inline-flex items-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--navy)] hover:text-[#f7efe3]"
          >
            {content}
          </ProtectedAction>
        );
      })}

      <div className="mx-1 hidden h-6 w-px bg-[rgba(20,50,75,0.12)] sm:block" />

      {isLoggedIn ? (
        <>
          <Link
            href={`/dashboard?lang=${locale}`}
            className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[rgba(20,50,75,0.14)] bg-white/80 px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--navy)] hover:text-[#f7efe3]"
          >
            <User className="size-4" />
            <span>{accountLabel}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[rgba(195,109,89,0.22)] bg-[rgba(255,244,240,0.9)] px-3 py-2 text-sm font-semibold text-[var(--coral)] transition hover:bg-[rgba(255,244,240,1)]"
          >
            <LogOut className="size-4" />
            <span>{logoutLabel}</span>
          </button>
        </>
      ) : (
        <Link
          href={`/login?lang=${locale}`}
          className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[rgba(20,50,75,0.14)] bg-white/80 px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--navy)] hover:text-[#f7efe3]"
        >
          <LogIn className="size-4" />
          <span>{loginLabel}</span>
        </Link>
      )}
    </nav>
  );
}