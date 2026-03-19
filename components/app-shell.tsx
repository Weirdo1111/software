import Link from "next/link";
import { BookOpen, ChartNoAxesColumn, Compass, FileCheck2, House, Settings } from "lucide-react";

import { type Locale, t } from "@/lib/i18n/dictionaries";

const nav = [
  { href: "/", key: "nav_home", icon: House },
  { href: "/placement-test", key: "nav_assessment", icon: FileCheck2 },
  { href: "/learn", key: "nav_learn", icon: Compass },
  { href: "/dashboard", key: "nav_dashboard", icon: BookOpen },
  { href: "/progress", key: "nav_progress", icon: ChartNoAxesColumn },
  { href: "/settings", key: "nav_settings", icon: Settings },
] as const;

export function AppShell({ locale }: { locale: Locale }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.88)] p-2 shadow-[0_14px_36px_rgba(23,32,51,0.08)] backdrop-blur-md">
      {nav.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={`${item.href}?lang=${locale}`}
            className="inline-flex items-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--navy)] hover:text-[#f7efe3]"
          >
            <Icon className="size-4" />
            <span>{t(locale, item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
