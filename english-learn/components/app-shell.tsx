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
} from "lucide-react";

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

export function AppShell({ locale }: { locale: Locale }) {
  const isLoggedIn = false;

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
        <Link
          href={`/dashboard?lang=${locale}`}
          className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[rgba(20,50,75,0.14)] bg-white/80 px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--navy)] hover:text-[#f7efe3]"
        >
          <User className="size-4" />
          <span>{locale === "zh" ? "我的账户" : "My account"}</span>
        </Link>
      ) : (
        <Link
          href={`/login?lang=${locale}`}
          className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[rgba(20,50,75,0.14)] bg-white/80 px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--navy)] hover:text-[#f7efe3]"
        >
          <LogIn className="size-4" />
          <span>{locale === "zh" ? "登录" : "Log in"}</span>
        </Link>
      )}
    </nav>
  );
}