import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Globe, Music } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale } from "@/lib/i18n/dictionaries";

export function ListeningHub({ locale }: { locale: Locale }) {
  const copy =
    locale === "zh"
      ? {
          title: "听力练习",
          subtitle: "选择一种练习方式开始",
          practiceTitle: "听力训练",
          practiceBody: "选择你的专业话题，边听边看原文、调整语速、做笔记，轻松提升听力。",
          practiceCta: "开始听力训练",
          tedTitle: "学术听力库",
          tedBody: "浏览 TED 听力材料，按专业和口音做题训练，保证站内可用体验。",
          tedCta: "进入听力资源库",
        }
      : {
          title: "Listening",
          subtitle: "Choose a practice mode to begin",
          practiceTitle: "Listening Practice",
          practiceBody: "Pick a topic from your major, listen at your own pace with transcript and speed control, and take notes.",
          practiceCta: "Start practice",
          tedTitle: "TED Listening Library",
          tedBody: "Browse TED listening materials by major and accent with a stable in-app experience.",
          tedCta: "Open listening library",
        };

  return (
    <section className="space-y-5 reveal-up">
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">{copy.title}</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.subtitle}</p>
          </div>
          <Suspense fallback={<div className="h-9 w-28 rounded-full bg-black/10" />}>
            <LanguageSwitcher locale={locale} />
          </Suspense>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Listening Practice */}
        <Link
          href={`/listening/practice?lang=${locale}`}
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

        {/* Academic Listening Library */}
        <Link
          href={`/listening?lang=${locale}`}
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
