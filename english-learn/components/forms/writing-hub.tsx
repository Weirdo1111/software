"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, FilePenLine } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale } from "@/lib/i18n/dictionaries";
import type { WritingModuleId } from "@/lib/writing-modules";

const moduleIcons: Record<WritingModuleId, typeof BookOpenText> = {
  "language-lab": BookOpenText,
  studio: FilePenLine,
};

export function WritingHub({
  locale,
  lessonId,
}: {
  locale: Locale;
  lessonId: string;
}) {
  const copy =
    locale === "zh"
      ? {
          title: "写作练习",
          subtitle: "先选择一种练习方式，再进入对应模块。",
          modules: {
            "language-lab": {
              title: "词汇与句型学习",
              body: "先学习当前写作题目的关键词和示例句，再进入正式写作会更容易组织思路。",
              cta: "进入词句学习",
            },
            studio: {
              title: "写作评分",
              body: "进入当前写作页面，写一段短文并获取 AI 反馈、修改建议和改写示例。",
              cta: "进入写作评分",
            },
          },
        }
      : {
          title: "Writing",
          subtitle: "Choose one practice mode first, then enter that workspace.",
          modules: {
            "language-lab": {
              title: "Vocabulary and sentence lab",
              body: "Study key expressions and model sentences from the current writing task before drafting.",
              cta: "Open language lab",
            },
            studio: {
              title: "Writing feedback studio",
              body: "Enter the existing writing page to draft a paragraph and receive AI feedback and revision guidance.",
              cta: "Open writing studio",
            },
          },
        };

  function buildHref(moduleId: WritingModuleId) {
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
        {(["language-lab", "studio"] as WritingModuleId[]).map((moduleId) => {
          const Icon = moduleIcons[moduleId];
          const moduleCopy = copy.modules[moduleId];

          return (
            <Link
              key={moduleId}
              href={buildHref(moduleId)}
              className="group surface-panel rounded-[1.8rem] p-5 sm:p-6 transition hover:translate-y-[-2px] hover:shadow-[0_20px_50px_rgba(28,78,149,0.14)]"
            >
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--navy)] text-white shadow-[0_8px_20px_rgba(28,78,149,0.25)]">
                <Icon className="size-5" />
              </div>
              <h3 className="font-display mt-4 text-xl tracking-tight text-[var(--ink)]">{moduleCopy.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{moduleCopy.body}</p>
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
