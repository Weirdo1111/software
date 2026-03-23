"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type ExperienceGateProps = {
  locale: "zh" | "en";
};

function isPathPublic(pathname: string) {
  return pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/auth/");
}

export function ExperienceGate({ locale }: ExperienceGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isPlacementPage = pathname.startsWith("/placement-test");

  const [introOpen, setIntroOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const isLoggedIn = localStorage.getItem("demo_logged_in") === "true";
    const placementDone = localStorage.getItem("demo_placement_done") === "true";
    const seenIntro = localStorage.getItem("demo_intro_seen") === "true";
    return isLoggedIn && placementDone && !isPlacementPage && !seenIntro;
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("demo_logged_in") === "true";
    if (!isLoggedIn && !isPathPublic(pathname)) {
      router.replace(`/login?lang=${locale}`);
    }
  }, [locale, pathname, router]);

  const copy = useMemo(
    () =>
      locale === "zh"
        ? {
            badge: "WELCOME",
            title: "欢迎使用 DIICSU English Learn",
            body: "本平台面向 DIICSU 大一新生：完成分级后可进入听说读写模块，也可以直接通过顶部导航切换到任意模块练习。",
            points: [
              "Listening: 先听后答，强化课堂听辨与关键信息捕捉。",
              "Speaking: 面向 seminar 互动，提升表达组织与流利度。",
              "Reading: 训练学术阅读中的 claim-evidence 理解。",
              "Writing: 聚焦 coursework 写作结构与表达清晰度。",
            ],
            cta: "开始学习",
          }
        : {
            badge: "WELCOME",
            title: "Welcome to DIICSU English Learn",
            body: "This platform is built for DIICSU first-year students: after placement, you can use the top navigation to switch directly across listening, speaking, reading, and writing modules.",
            points: [
              "Listening: hear first, then answer for lecture-style comprehension.",
              "Speaking: build seminar response structure and fluency.",
              "Reading: train claim-evidence understanding in academic texts.",
              "Writing: improve coursework structure and clarity.",
            ],
            cta: "Start learning",
          },
    [locale],
  );

  if (!introOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(10,16,28,0.5)] px-4">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[rgba(255,255,255,0.4)] bg-[#f8f5ef] p-6 shadow-[0_30px_90px_rgba(12,18,29,0.36)] sm:p-8">
        <p className="section-label">{copy.badge}</p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">{copy.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{copy.body}</p>

        <div className="mt-5 grid gap-2">
          {copy.points.map((point) => (
            <div key={point} className="rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-white/80 px-4 py-3 text-sm text-[var(--ink)]">
              {point}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem("demo_intro_seen", "true");
              setIntroOpen(false);
            }}
            className="inline-flex items-center justify-center rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-[#f7efe3]"
          >
            {copy.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

