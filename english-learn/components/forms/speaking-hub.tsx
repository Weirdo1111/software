"use client";

import Link from "next/link";
import { ArrowRight, Mic, Waves } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

import type { SpeakingModuleId } from "@/components/forms/speaking/types";
import { type Locale } from "@/lib/i18n/dictionaries";
import { speakingModuleCopy } from "@/lib/speaking-modules";

const moduleIcons: Record<SpeakingModuleId, typeof Mic> = {
  studio: Mic,
  rehearsal: Waves,
};

const moduleOrder: SpeakingModuleId[] = ["studio", "rehearsal"];

// Date: 2026/3/18
// Author: Tianbo Cao
// Added a dedicated speaking hub so each practice mode opens as its own route, matching the listening workflow.
export function SpeakingHub({
  locale,
  lessonId,
}: {
  locale: Locale;
  lessonId: string;
}) {
  const copy =
    locale === "zh"
      ? {
          title: "口语练习",
          subtitle: "先进入主练习或预演实验室，再完成当前口语任务。",
        }
      : {
          title: "Speaking",
          subtitle: "Open either the main studio or the rehearsal lab for the current speaking task.",
        };

  function buildHref(moduleId: SpeakingModuleId) {
    return `/lesson/${lessonId}?lang=${locale}&module=${moduleId}`;
  }

  return (
    <section className="space-y-5 reveal-up">
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">{copy.title}</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.subtitle}</p>
          </div>
          <LanguageSwitcher locale={locale} />
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2">
        {moduleOrder.map((moduleId) => {
          const moduleCopy = speakingModuleCopy[moduleId];
          const Icon = moduleIcons[moduleId];

          return (
            <Link
              key={moduleId}
              href={buildHref(moduleId)}
              className="group surface-panel rounded-[1.8rem] p-5 sm:p-6 transition hover:translate-y-[-2px] hover:shadow-[0_20px_50px_rgba(28,78,149,0.14)]"
            >
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--navy)] text-white shadow-[0_8px_20px_rgba(28,78,149,0.25)]">
                <Icon className="size-5" />
              </div>
              <h3 className="font-display mt-4 text-xl tracking-tight text-[var(--ink)]">{moduleCopy.label}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{moduleCopy.hubDescription}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] transition group-hover:gap-2.5">
                {moduleCopy.cta}
                <ArrowRight className="size-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
