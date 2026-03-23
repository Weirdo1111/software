"use client";

import Link from "next/link";
import { ArrowRight, Globe, Music } from "lucide-react";
import { useEffect, useState } from "react";

import { type Locale } from "@/lib/i18n/dictionaries";

function useLevel() {
  const [level, setLevel] = useState("B1");
  useEffect(() => {
    const raw = localStorage.getItem("demo_level");
    const val = String(raw ?? "B1").toUpperCase();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe: must read localStorage after hydration
    if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(val)) setLevel(val);
  }, []);
  return level;
}

export function ListeningHub({ locale }: { locale: Locale }) {
  const level = useLevel();
  const copy =
    locale === "zh"
      ? {
          title: "听力练习",
          subtitle: "选择一种练习方式开始",
          practiceTitle: "听力训练",
          practiceBody: "选择你的专业话题，边听边看原文、调整语速、做笔记，轻松提升听力。",
          practiceCta: "开始听力训练",
          tedTitle: "TED 听力",
          tedBody: "用与你专业相关的 TED 演讲练习真实听力，提升对自然语速的适应。",
          tedCta: "进入 TED 听力",
        }
      : {
          title: "Listening",
          subtitle: "Choose a practice mode to begin",
          practiceTitle: "Listening Practice",
          practiceBody: "Pick a topic from your major, listen at your own pace with transcript and speed control, and take notes.",
          practiceCta: "Start practice",
          tedTitle: "TED Listening",
          tedBody: "Practice with real TED talks matched to your major, building comfort with natural pace and authentic delivery.",
          tedCta: "Start TED listening",
        };

  return (
    <section className="mx-auto max-w-3xl space-y-5 reveal-up">
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <h2 className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">{copy.title}</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.subtitle}</p>
      </article>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Listening Practice */}
        <Link
          href={`/listening/accent?lang=${locale}`}
          className="group surface-panel rounded-[1.8rem] p-5 sm:p-6 transition hover:translate-y-[-2px] hover:shadow-[0_20px_50px_rgba(28,78,149,0.14)]"
        >
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--navy)] text-white shadow-[0_8px_20px_rgba(28,78,149,0.25)]">
            <Music className="size-5" />
          </div>
          <h3 className="font-display mt-4 text-xl tracking-tight text-[var(--ink)]">{copy.practiceTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{copy.practiceBody}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] transition group-hover:gap-2.5">
            {copy.practiceCta}
            <ArrowRight className="size-4" />
          </span>
        </Link>

        {/* TED Listening */}
        <Link
          href={`/lesson/${level}-listening-starter?lang=${locale}`}
          className="group surface-panel rounded-[1.8rem] p-5 sm:p-6 transition hover:translate-y-[-2px] hover:shadow-[0_20px_50px_rgba(28,78,149,0.14)]"
        >
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--coral)] text-white shadow-[0_8px_20px_rgba(195,109,89,0.25)]">
            <Globe className="size-5" />
          </div>
          <h3 className="font-display mt-4 text-xl tracking-tight text-[var(--ink)]">{copy.tedTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{copy.tedBody}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--coral)] transition group-hover:gap-2.5">
            {copy.tedCta}
            <ArrowRight className="size-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}
