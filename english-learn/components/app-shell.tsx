"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Gamepad2,
  LibraryBig,
  LogIn,
  LogOut,
  MessageSquareMore,
  Sparkles,
  Trophy,
  User,
  WandSparkles,
} from "lucide-react";
import { useEffect, useSyncExternalStore, useState } from "react";

import { InstitutionBrand } from "@/components/institution-brand";
import { ProtectedAction } from "@/components/protected-action";
import { type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const primaryNav = [
  {
    id: "quests",
    label: { zh: "任务地图", en: "Quests" },
    Icon: Compass,
  },
  {
    id: "library",
    label: { zh: "资源库", en: "Library" },
    Icon: LibraryBig,
  },
  {
    id: "scenes",
    label: { zh: "场景口语", en: "Scenes" },
    Icon: WandSparkles,
  },
  {
    id: "square",
    label: { zh: "学伴广场", en: "Buddy Square" },
    Icon: MessageSquareMore,
  },
  {
    id: "rewards",
    label: { zh: "成长奖励", en: "Rewards" },
    Icon: Trophy,
  },
  {
    id: "games",
    label: { zh: "游戏中心", en: "Games" },
    Icon: Gamepad2,
    protected: false,
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

  const accountLabel = locale === "zh" ? "个人主页" : "Profile";
  const loginLabel = locale === "zh" ? "登录" : "Log in";
  const logoutLabel = locale === "zh" ? "退出" : "Log out";
  const homeLabel = locale === "zh" ? "首页" : "Home";
  const buddyLabel = locale === "zh" ? "DIICSU Buddy Campus" : "DIICSU Buddy Campus";

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

  useEffect(() => {
    if (isLoggedIn) return;

    let cancelled = false;

    const syncSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          authenticated?: boolean;
          user?: { username?: string; email?: string } | null;
          auth_provider?: string;
          auth_user_id?: string;
        };

        if (!payload.authenticated || cancelled) return;

        localStorage.setItem("demo_logged_in", "true");
        localStorage.setItem(
          "demo_user",
          payload.user?.username || payload.user?.email || "Learner",
        );
        if (payload.auth_user_id) {
          localStorage.setItem("demo_auth_user_id", payload.auth_user_id);
        }
        if (payload.auth_provider) {
          localStorage.setItem("demo_auth_provider", payload.auth_provider);
        }
        window.dispatchEvent(new Event("demo-auth-changed"));
      } catch {
        // Ignore silent session sync failures on the nav shell.
      }
    };

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
      });
    } catch {
      // Ignore sign-out network errors and still clear local client state.
    }

    localStorage.removeItem("demo_logged_in");
    localStorage.removeItem("demo_user");
    localStorage.removeItem("demo_auth_provider");
    localStorage.removeItem("demo_auth_user_id");
    window.dispatchEvent(new Event("demo-auth-changed"));
    window.location.href = "/";
  };

  const speakingHref = `/lesson/${levelPrefix}-speaking-starter?lang=${locale}`;

  const resolveHref = (id: (typeof primaryNav)[number]["id"]) => {
    if (id === "quests") return `/schedule?lang=${locale}`;
    if (id === "library") return `/listening?lang=${locale}`;
    if (id === "scenes") return speakingHref;
    if (id === "square") return `/discussion?lang=${locale}`;
    if (id === "games") return `/games?lang=${locale}`;
    return `/progress?lang=${locale}`;
  };

  const isHomeActive = pathname === "/";

  const isPrimaryActive = (id: (typeof primaryNav)[number]["id"]) => {
    if (id === "quests") return pathname?.startsWith("/schedule");
    if (id === "library") return pathname?.startsWith("/listening");
    if (id === "scenes") return pathname?.includes("/lesson/") && pathname?.includes("speaking");
    if (id === "square") return pathname?.startsWith("/discussion");
    if (id === "games") return pathname?.startsWith("/games");
    return pathname?.startsWith("/progress");
  };

  return (
    <nav
      className={cn(
        "party-nav-shell p-2.5",
        fixed
          ? "fixed left-1/2 top-4 z-[80] w-[min(1500px,calc(100%-1.75rem))] -translate-x-1/2"
          : "w-full",
      )}
    >
      <div className="grid gap-2 xl:grid-cols-[minmax(12rem,13.5rem)_1fr_auto] xl:items-center">
        <div className="flex flex-col items-start gap-2 rounded-[1.55rem] border-2 border-white/85 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,247,255,0.9))] px-3 py-2.5 shadow-[0_10px_0_rgba(255,201,225,0.24),0_18px_28px_rgba(90,123,255,0.1)]">
          <InstitutionBrand locale={locale} embedded compact className="w-full justify-center" />
          <span className="inline-flex items-center gap-1 self-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,rgba(255,242,165,0.95),rgba(255,212,231,0.9))] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--navy)] shadow-[0_8px_0_rgba(255,201,225,0.25),0_14px_22px_rgba(90,123,255,0.12)]">
            <Sparkles className="size-3.5" />
            {buddyLabel}
          </span>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <div className="party-nav-track flex w-max min-w-full items-center gap-1.5 p-1.5 whitespace-nowrap">
            <Link
              href={`/?lang=${locale}`}
              className={`party-tab ${isHomeActive ? "party-tab-active" : ""}`}
            >
              <Sparkles className="size-4" />
              {homeLabel}
            </Link>

            {primaryNav.map((item) => {
              const active = isPrimaryActive(item.id);
              const className = `party-tab ${active ? "party-tab-active" : ""}`;

              if ("protected" in item && item.protected === false) {
                return (
                  <Link key={item.id} href={resolveHref(item.id)} className={className}>
                    <item.Icon className="size-4" />
                    {item.label[locale]}
                  </Link>
                );
              }

              return (
                <ProtectedAction
                  key={item.id}
                  href={resolveHref(item.id)}
                  locale={locale}
                  isLoggedIn={isLoggedIn}
                  className={className}
                >
                  <item.Icon className="size-4" />
                  {item.label[locale]}
                </ProtectedAction>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href={`/dashboard?lang=${locale}`}
                className="party-button-ghost"
              >
                <User className="size-4" />
                {accountLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,#ffac9a,#ff8ac8)] px-4 text-[15px] font-semibold text-white shadow-[0_9px_0_rgba(230,107,133,0.28),0_18px_26px_rgba(255,138,200,0.18)] transition hover:translate-y-[-1px]"
              >
                <LogOut className="size-4" />
                {logoutLabel}
              </button>
            </>
          ) : (
            <Link
              href={`/login?lang=${locale}`}
              className="party-button"
            >
              <LogIn className="size-4" />
              {loginLabel}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
