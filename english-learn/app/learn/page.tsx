import Link from "next/link";
import { ArrowRight, Ear, FileText, Mic, PenLine, Workflow } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { learningModules, levelBands, weeklyWorkflow } from "@/lib/academic-ui";
import { getLocale } from "@/lib/i18n/get-locale";

const skillIcons = {
  listening: Ear,
  speaking: Mic,
  reading: FileText,
  writing: PenLine,
} as const;

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Learning modules for academic English"
      description="The launch UI centers on four connected modules with level-sensitive difficulty, visible outputs, and a clear loop from study to progress tracking."
    >
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-8">
          <p className="section-label">Default pathway</p>
          <h2 className="font-display mt-4 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">Medium band is the launch baseline.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
            The main target audience is intermediate university learners, so the first visible path should feel optimized for Medium while still
            showing how Low and High versions expand or simplify the same learning structure.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {levelBands.map((band) => (
              <article key={band.name} className={`rounded-[1.4rem] border p-4 ${band.accentClass}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{band.short}</p>
                <h3 className="font-display mt-2 text-2xl tracking-tight">{band.name}</h3>
                <p className="mt-3 text-sm leading-6 opacity-80">{band.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Learning logic</p>
          <h3 className="font-display mt-4 text-3xl tracking-tight">One loop, four skills.</h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[#efe5d6]/78">
            <p>Every module should end with evidence the learner produced, not just a completion tick.</p>
            <p>Listening and reading feed input quality; speaking and writing show productive control.</p>
            <p>Progress data should be visible enough to justify reassessment later.</p>
          </div>
          <Link
            href={`/dashboard?lang=${locale}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-[#f7efe3] transition hover:bg-white/14"
          >
            Open learner dashboard
            <ArrowRight className="size-4" />
          </Link>
        </aside>
      </div>

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

      <section className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <Workflow className="size-3.5" /> Weekly study loop
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">A reusable structure for every lesson.</h2>
          <div className="mt-6 space-y-3">
            {weeklyWorkflow.map((item, index) => (
              <div key={item.title} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--navy)] text-sm font-semibold text-[#f7efe3]">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-semibold text-[var(--ink)]">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">Module architecture</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">What the learning page needs to signal at a glance.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Band fit</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                Learners should always understand whether a task is foundational, balanced, or stretch-level.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Task evidence</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                Every lesson card now shows the output learners are expected to produce at the end.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Workload clarity</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                Minutes are explicit so the platform feels manageable for weekly academic study habits.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Progress relevance</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                Readiness and completion indicators connect directly to reassessment and harder content unlocks.
              </p>
            </div>
          </div>
        </article>
      </section>
    </PageFrame>
  );
}
