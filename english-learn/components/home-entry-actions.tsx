"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LoginRequiredModal } from "@/components/login-required-modal";
import { startNavigationLoading } from "@/lib/navigation-loading";

type HomeEntryActionsProps = {
  locale: string;
  isLoggedIn?: boolean;
  startTestLabel: string;
  startLearningLabel: string;
};

export function HomeEntryActions({
  locale,
  isLoggedIn = false,
  startTestLabel,
  startLearningLabel,
}: HomeEntryActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const goLogin = () => {
    const href = `/login?lang=${locale}`;
    startNavigationLoading(href);
    router.push(href);
  };

  const goDashboard = () => {
    const href = `/dashboard?lang=${locale}`;
    startNavigationLoading(href);
    router.push(href);
  };

  const handleProtectedClick = (href: string) => {
    if (isLoggedIn) {
      startNavigationLoading(href);
      router.push(href);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <div className="relative z-10 mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={isLoggedIn ? goDashboard : goLogin}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.18)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.06)]"
        >
          {isLoggedIn
            ? locale === "zh"
              ? "我的学习"
              : "Dashboard"
            : locale === "zh"
            ? "登录"
            : "Log in"}
        </button>

        <button
          type="button"
          onClick={() => handleProtectedClick(`/placement-test?lang=${locale}`)}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
        >
          {startTestLabel}
          <ArrowRight className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => handleProtectedClick(`/learn?lang=${locale}`)}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.18)] bg-[rgba(255,255,255,0.72)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]"
        >
          {startLearningLabel}
        </button>
      </div>

      <LoginRequiredModal
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
      />
    </>
  );
}
