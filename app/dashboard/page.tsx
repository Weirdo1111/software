import Link from "next/link";
import { ArrowRight, Ear, FileText, Mic, PenLine, TrendingUp } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { dashboardFocus, learningModules, levelBands } from "@/lib/academic-ui";
import { getLocale } from "@/lib/i18n/get-locale";

const skillIcons = {
  listening: Ear,
  speaking: Mic,
  reading: FileText,
  writing: PenLine,
} as const;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);
  const activeBand = levelBands.find((band) => band.name === "Medium") ?? levelBands[1];

  return (
    <PageFrame
      locale={locale}
      title="Learner dashboard"
      description="A single view for band placement, four-skill balance, weekly study targets, and the next reassessment checkpoint."
    >
      <div className="grid gap-5 xl:grid-cols-[1.28fr_0.92fr]">
        <section className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-label">Profile snapshot</p>
              <h2 className="font-display mt-4 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">Medium-band learner view.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
                This dashboard is now aligned to the agreed product logic: it shows current band, the state of each academic skill, and a clear
                path toward reassessment rather than generic streak gamification alone.
              </p>
            </div>
            <div className={`rounded-[1.5rem] border px-5 py-4 ${activeBand.accentClass}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Current placement</p>
              <h3 className="font-display mt-2 text-3xl tracking-tight">{activeBand.name}</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 opacity-80">{activeBand.summary}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {dashboardFocus.map((item) => (
              <article key={item.label} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">{item.label}</p>
                <p className="font-display mt-3 text-3xl tracking-tight text-[var(--ink)]">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Today’s operating view</p>
          <h3 className="font-display mt-4 text-3xl tracking-tight">Keep all four skills active.</h3>
          <div className="mt-5 space-y-3">
            <div className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f2d9ae]">Priority</p>
              <p className="mt-2 text-sm leading-7 text-[#efe5d6]/78">Finish one input task and one output task today so progress data stays balanced.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f2d9ae]">Watch item</p>
              <p className="mt-2 text-sm leading-7 text-[#efe5d6]/78">Speaking is lagging behind reading; the next recommendation should push a seminar-response task.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f2d9ae]">Reassessment rule</p>
              <p className="mt-2 text-sm leading-7 text-[#efe5d6]/78">Unlock the next test window only after visible consistency, not after one strong session.</p>
            </div>
          </div>
          <Link
            href={`/placement-test?lang=${locale}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-[#f7efe3] transition hover:bg-white/14"
          >
            Open reassessment page
            <ArrowRight className="size-4" />
          </Link>
        </aside>
      </div>

      <section className="mt-6 reveal-up">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">
              <TrendingUp className="size-3.5" /> Skill performance
            </p>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">Progress that actually supports band decisions.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Each block below shows a meaningful learning metric, not just a lesson count.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {learningModules.map((module) => {
            const Icon = skillIcons[module.skill];
            return (
              <article key={module.skill} className="surface-panel rounded-[1.8rem] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{module.skill}</p>
                    <h3 className="font-display mt-2 text-2xl tracking-tight text-[var(--ink)]">{module.progress}%</h3>
                  </div>
                  <div className={`inline-flex size-11 items-center justify-center rounded-2xl ${module.badgeClass}`}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--ink)]">{module.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{module.focus}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(20,50,75,0.08)]">
                  <div className={`h-full rounded-full progress-stripe ${module.progressClass}`} style={{ width: `${module.progress}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">Next actions</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Recommended work for this week.</h2>
          <div className="mt-6 grid gap-3">
            {learningModules.map((module) => (
              <div key={module.skill} className="grid gap-3 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{module.minutes}</p>
                  <h3 className="mt-2 text-base font-semibold text-[var(--ink)]">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Deliverable: {module.deliverable}</p>
                </div>
                <Link
                  href={`${module.href}?lang=${locale}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]"
                >
                  Start
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">Band readiness</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">What progression looks like in the UI.</h2>
          <div className="mt-6 space-y-4">
            {levelBands.map((band) => {
              const isActive = band.name === activeBand.name;
              return (
                <div key={band.name} className={`rounded-[1.5rem] border p-5 ${band.accentClass} ${isActive ? "ring-2 ring-[rgba(20,50,75,0.18)]" : ""}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">{band.short}</p>
                      <h3 className="font-display mt-2 text-2xl tracking-tight">{band.name}</h3>
                    </div>
                    {isActive ? <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">Current</span> : null}
                  </div>
                  <p className="mt-4 text-sm leading-6">{band.summary}</p>
                  <p className="mt-3 text-sm leading-6 opacity-80">
                    <span className="font-semibold">Unlocks:</span> {band.unlock}
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </PageFrame>
  );
}
