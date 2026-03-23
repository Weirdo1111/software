"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { useEffect, useSyncExternalStore, useState } from "react";

import { InstitutionBrand } from "@/components/institution-brand";
import { ProtectedAction } from "@/components/protected-action";
import { type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const moduleNav = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: { zh: "总览", en: "Dashboard" },
    protected: true,
  },
  {
    id: "listening",
    label: { zh: "听力", en: "Listening" },
    protected: true,
  },
  {
    id: "speaking",
    label: { zh: "口语", en: "Speaking" },
    protected: true,
  },
  {
    id: "reading",
    href: "/reading",
    label: { zh: "阅读", en: "Reading" },
    protected: true,
  },
  {
    id: "writing",
    label: { zh: "写作", en: "Writing" },
    protected: true,
  },
] as const;

const allowedLevels = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

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

function getLevelPrefix(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  return allowedLevels.has(next) ? next : "A2";
}

export function AppShell({ locale, fixed = false }: { locale: Locale; fixed?: boolean }) {
  const pathname = usePathname();
  const isLoggedIn = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [levelPrefix, setLevelPrefix] = useState("A2");

  const accountLabel = locale === "zh" ? "我的账户" : "My account";
  const loginLabel = locale === "zh" ? "登录" : "Log in";
  const logoutLabel = locale === "zh" ? "退出登录" : "Log out";
  const homeLabel = locale === "zh" ? "首页" : "Home";

  useEffect(() => {
    const refreshLevel = () => {
      setLevelPrefix(getLevelPrefix(localStorage.getItem("demo_level")));
    };

    refreshLevel();
    window.addEventListener("storage", refreshLevel);
    window.addEventListener("demo-placement-changed", refreshLevel as EventListener);

    return () => {
      window.removeEventListener("storage", refreshLevel);
      window.removeEventListener("demo-placement-changed", refreshLevel as EventListener);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("demo_logged_in");
    localStorage.removeItem("demo_user");
    window.dispatchEvent(new Event("demo-auth-changed"));
    window.location.href = "/";
  };

  const lessonHref = (skill: "listening" | "speaking" | "writing") => `/lesson/${levelPrefix}-${skill}-starter?lang=${locale}`;

  const resolveHref = (id: (typeof moduleNav)[number]["id"]) => {
    if (id === "dashboard") return `/dashboard?lang=${locale}`;
    if (id === "reading") return `/reading?lang=${locale}`;
    if (id === "listening") return lessonHref("listening");
    if (id === "speaking") return lessonHref("speaking");
    return lessonHref("writing");
  };

  const isHomeActive = pathname === "/";

  const isModuleActive = (id: (typeof moduleNav)[number]["id"]) => {
    if (id === "dashboard") return pathname?.startsWith("/dashboard");
    if (id === "listening") return pathname?.includes("/lesson/") && pathname?.includes("listening");
    if (id === "speaking") return pathname?.includes("/lesson/") && pathname?.includes("speaking");
    if (id === "writing") return pathname?.includes("/lesson/") && pathname?.includes("writing");
    if (id === "reading") return pathname?.startsWith("/reading");
    return false;
  };

  return (
    <nav
      className={cn(
        "rounded-[1.1rem] border border-[rgba(36,88,164,0.24)] bg-gradient-to-r from-[#2f64ba] via-[#3b74cc] to-[#2f64ba] p-1.5 shadow-[0_12px_26px_rgba(39,72,130,0.24)]",
        fixed
          ? "fixed left-1/2 top-4 z-[80] w-[min(1500px,calc(100%-1.75rem))] -translate-x-1/2"
          : "w-full",
      )}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <div className="inline-flex min-h-10 items-center rounded-[0.9rem] border border-white/28 bg-white/10 px-3">
          <InstitutionBrand locale={locale} embedded />
        </div>

        <div className="min-w-0 overflow-x-auto">
          <div className="flex w-max min-w-full items-center gap-1 whitespace-nowrap">
            <Link
              href={`/?lang=${locale}`}
              className={`inline-flex min-h-10 items-center rounded-[0.8rem] px-3 text-[17px] font-semibold transition ${isHomeActive ? "bg-white text-[#1d3f77]" : "text-[#edf5ff] hover:bg-white/20"}`}
            >
              {homeLabel}
            </Link>

            {moduleNav.map((item) => {
              const active = isModuleActive(item.id);
              const className = `inline-flex min-h-10 items-center rounded-[0.8rem] px-3 text-[17px] font-semibold transition ${
                active ? "bg-white text-[#1d3f77]" : "text-[#edf5ff] hover:bg-white/20"
              }`;

              return (
                <ProtectedAction
                  key={item.id}
                  href={resolveHref(item.id)}
                  locale={locale}
                  isLoggedIn={isLoggedIn}
                  className={className}
                >
                  {item.label[locale]}
                </ProtectedAction>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 pl-1">
          {isLoggedIn ? (
            <>
              <Link
                href={`/dashboard?lang=${locale}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-[0.8rem] border border-white/35 bg-white/12 px-3 text-[17px] font-semibold text-[#edf5ff] transition hover:bg-white/20"
              >
                <User className="size-4" />
                <span>{accountLabel}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-10 items-center gap-2 rounded-[0.8rem] border border-[#ffd0c5] bg-[#fff1ed] px-3 text-[17px] font-semibold text-[#b3472f] transition hover:bg-[#ffe3db]"
              >
                <LogOut className="size-4" />
                <span>{logoutLabel}</span>
              </button>
            </>
          ) : (
            <Link
              href={`/login?lang=${locale}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-[0.8rem] border border-white/35 bg-white/12 px-3 text-[17px] font-semibold text-[#edf5ff] transition hover:bg-white/20"
            >
              <LogIn className="size-4" />
              <span>{loginLabel}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
