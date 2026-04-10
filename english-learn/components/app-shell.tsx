"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useMemo, useSyncExternalStore, useState } from "react";

import { InstitutionBrand } from "@/components/institution-brand";
import { ProtectedAction } from "@/components/protected-action";
import { getFunctionZoneLinks, type FunctionZoneId } from "@/lib/function-zones";
import { type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

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

function getStoredAuthRole() {
  if (typeof window === "undefined") return "user";
  return localStorage.getItem("demo_auth_role") === "manager" ? "manager" : "user";
}

function getLevelPrefix(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  return allowedLevels.has(next) ? next : "A2";
}

export function AppShell({ locale, fixed = false }: { locale: Locale; fixed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [levelPrefix, setLevelPrefix] = useState("A2");
  const [authRole, setAuthRole] = useState<"user" | "manager">("user");

  const accountLabel = locale === "zh" ? "个人主页" : "Profile";
  const moderationLabel = locale === "zh" ? "审核页" : "Moderation";
  const loginLabel = locale === "zh" ? "登录" : "Log in";
  const logoutLabel = locale === "zh" ? "退出" : "Log out";
  const homeLabel = locale === "zh" ? "首页" : "Home";
  const buddyLabel = locale === "zh" ? "邓迪国际学院学术英语平台" : "DIICSU Academic English Hub";
  const partnershipLabel =
    locale === "zh" ? "中南大学 × 邓迪大学" : "Central South University × Dundee";
  const primaryNav = useMemo(
    () =>
      getFunctionZoneLinks({
        locale,
        levelPrefix,
      }),
    [levelPrefix, locale],
  );

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
    const refreshRole = () => {
      setAuthRole(getStoredAuthRole());
    };

    refreshRole();
    window.addEventListener("storage", refreshRole);
    window.addEventListener("demo-auth-changed", refreshRole as EventListener);

    return () => {
      window.removeEventListener("storage", refreshRole);
      window.removeEventListener("demo-auth-changed", refreshRole as EventListener);
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
          user?: { username?: string; email?: string; role?: string } | null;
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
        localStorage.setItem("demo_auth_role", payload.user?.role === "manager" ? "manager" : "user");
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

  useEffect(() => {
    if (!isLoggedIn || authRole !== "manager") {
      return;
    }

    if (pathname === "/manager") {
      return;
    }

    router.replace(`/manager?lang=${locale}`);
  }, [authRole, isLoggedIn, locale, pathname, router]);

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
    localStorage.removeItem("demo_auth_role");
    window.dispatchEvent(new Event("demo-auth-changed"));
    window.location.href = "/";
  };

  const isHomeActive = pathname === "/";
  const isManagerPortal = authRole === "manager";
  const managerHref = `/manager?lang=${locale}`;

  const isPrimaryActive = (id: FunctionZoneId) => {
    if (id === "challenge") {
      return (
        pathname?.startsWith("/challenge") ||
        pathname?.startsWith("/listening/test") ||
        pathname?.startsWith("/speaking/test")
      );
    }
    if (id === "tasks") return pathname?.startsWith("/schedule");
    if (id === "listening") return pathname?.startsWith("/listening") && !pathname?.startsWith("/listening/test");
    if (id === "speaking") return pathname?.includes("/lesson/") && pathname?.includes("speaking");
    if (id === "reading") return pathname?.startsWith("/reading");
    if (id === "writing") {
      return pathname?.startsWith("/writing") || (pathname?.includes("/lesson/") && pathname?.includes("writing"));
    }
    if (id === "ai-coach") return pathname?.startsWith("/discussion/roleplay");
    if (id === "seminars") {
      return pathname?.startsWith("/discussion/seminars") || pathname?.startsWith("/forum/seminars");
    }
    if (id === "discussion") {
      const inDiscussion = pathname?.startsWith("/discussion");
      const inSeminar = pathname?.startsWith("/discussion/seminars") || pathname?.startsWith("/forum/seminars");
      const inRoleplay = pathname?.startsWith("/discussion/roleplay");
      if (inDiscussion && !inSeminar && !inRoleplay) return true;
      return pathname?.startsWith("/posts") || pathname?.startsWith("/activity");
    }
    return pathname?.startsWith("/games");
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
      <div className="grid gap-2 xl:grid-cols-[minmax(15rem,18rem)_1fr_auto] xl:items-center">
        <div className="diicsu-nav-brand">
          <InstitutionBrand locale={locale} embedded compact className="w-full justify-center" />
          <div className="diicsu-nav-badge">
            <span className="diicsu-nav-eyebrow">{partnershipLabel}</span>
            <span className="diicsu-nav-title">
              <Sparkles className="size-3.5" />
              {buddyLabel}
            </span>
          </div>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <div className="party-nav-track flex w-max min-w-full items-center gap-1.5 p-1.5 whitespace-nowrap">
            {isManagerPortal ? (
              <Link href={managerHref} className="party-tab party-tab-active">
                <ShieldCheck className="size-4" />
                {moderationLabel}
              </Link>
            ) : (
              <>
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

                  if (item.protected === false) {
                    return (
                      <Link key={item.id} href={item.href} className={className}>
                        <item.Icon className="size-4" />
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <ProtectedAction
                      key={item.id}
                      href={item.href}
                      locale={locale}
                      isLoggedIn={isLoggedIn}
                      className={className}
                    >
                      <item.Icon className="size-4" />
                      {item.label}
                    </ProtectedAction>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {isLoggedIn ? (
            <>
              {isManagerPortal ? null : (
                <Link
                  href={`/dashboard?lang=${locale}`}
                  className="party-button-ghost"
                >
                  <User className="size-4" />
                  {accountLabel}
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--diicsu-maroon),#b84b6b)] px-4 text-[15px] font-semibold text-white shadow-[0_9px_0_rgba(107,18,49,0.24),0_18px_26px_rgba(146,16,65,0.18)] transition hover:translate-y-[-1px]"
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
