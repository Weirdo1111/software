import Link from "next/link";
import { ArrowRight, Ear, FileText, Mic, PenLine } from "lucide-react";

import { learningModules } from "@/lib/academic-ui";
import { type Locale } from "@/lib/i18n/dictionaries";

const skillIcons = {
  listening: Ear,
  speaking: Mic,
  reading: FileText,
  writing: PenLine,
} as const;

export function LearnModuleGrid({ locale }: { locale: Locale }) {
  return (
    <section className="mt-6 reveal-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label">Skill modules</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">Four modules, one academic outcome.</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          These cards are now framed as academic tasks with explicit focus, outputs, and expected study time.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {learningModules.map((module) => {
          const Icon = skillIcons[module.skill];

          return (
            <article
              key={module.skill}
              className={`rounded-[1.9rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br ${module.surfaceClass} p-5 shadow-[0_18px_40px_rgba(23,32,51,0.08)]`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">{module.minutes}</p>
                  <h3 className="font-display mt-3 text-3xl tracking-tight text-[var(--ink)]">{module.title}</h3>
                </div>
                <div className={`inline-flex size-12 items-center justify-center rounded-2xl ${module.badgeClass}`}>
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{module.summary}</p>
              <div className="mt-5 grid gap-3 text-sm text-[var(--ink)] sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-white/55 bg-white/55 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Focus</p>
                  <p className="mt-2 leading-6">{module.focus}</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/55 bg-white/55 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Output</p>
                  <p className="mt-2 leading-6">{module.deliverable}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    <span>Readiness</span>
                    <span>{module.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
                    <div className={`h-full rounded-full progress-stripe ${module.progressClass}`} style={{ width: `${module.progress}%` }} />
                  </div>
                </div>
                <Link
                  href={`${module.href}?lang=${locale}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.18)] bg-white/75 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]"
                >
                  Open module
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
