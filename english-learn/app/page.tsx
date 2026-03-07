import Link from "next/link";
import { ArrowRight, Ear, FileText, Layers3, Mic, PenLine, Sparkles, Target } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { learnerJourney, learningModules, levelBands, platformSignals, releaseFeatures } from "@/lib/academic-ui";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionaries";

const skillIcons = {
  listening: Ear,
  speaking: Mic,
  reading: FileText,
  writing: PenLine,
} as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame locale={locale} title={t(locale, "hero_title")} description={t(locale, "hero_desc")}>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <section className="surface-panel reveal-up relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <div className="absolute -right-12 -top-12 size-40 rounded-full bg-[rgba(20,50,75,0.08)] blur-3xl" aria-hidden />
          <div className="absolute -bottom-10 left-12 size-32 rounded-full bg-[rgba(216,142,52,0.14)] blur-3xl" aria-hidden />
          <p className="section-label">
            <Sparkles className="size-3.5" /> MVP direction
          </p>
          <h2 className="font-display mt-5 max-w-4xl text-4xl leading-tight tracking-tight text-[var(--ink)] sm:text-5xl">
            A focused academic English platform built around assessment, banding, and four-skill study.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
            The first release should feel clear and credible: learners enter, complete a placement test, receive a Low / Medium /
            High recommendation, then move into academic listening, speaking, reading, and writing tasks designed for their band.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {platformSignals.map((signal) => (
              <article key={signal.label} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">{signal.label}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{signal.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/placement-test?lang=${locale}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
            >
              {t(locale, "start_test")}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={`/learn?lang=${locale}`}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.18)] bg-[rgba(255,255,255,0.72)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]"
            >
              {t(locale, "start_learning")}
            </Link>
          </div>
        </section>

        <aside className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">First release scope</p>
          <h3 className="font-display mt-4 text-3xl tracking-tight">Compact, but complete.</h3>
          <p className="mt-3 text-sm leading-7 text-[#efe5d6]/78">
            The UI should already communicate the full loop: assess, route, learn, track progress, and reassess when the learner improves.
          </p>
          <div className="mt-6 grid gap-3">
            {releaseFeatures.slice(0, 4).map((feature) => (
              <article key={feature.title} className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[#f7efe3]">{feature.title}</h4>
                  <span className="rounded-full border border-[#f2d9ae]/50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2d9ae]">
                    {feature.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#efe5d6]/72">{feature.detail}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-6 reveal-up">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">
              <Target className="size-3.5" /> Learning modules
            </p>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">The four-skill academic learning loop.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Each module needs to look connected to the same academic objective, not like four unrelated mini tools.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {learningModules.map((module) => {
            const Icon = skillIcons[module.skill];
            return (
              <article
                key={module.skill}
                className={`rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br ${module.surfaceClass} p-5 shadow-[0_18px_40px_rgba(23,32,51,0.08)]`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">{module.minutes}</p>
                    <h3 className="font-display mt-3 text-2xl tracking-tight">{module.title}</h3>
                  </div>
                  <div className={`inline-flex size-11 items-center justify-center rounded-2xl ${module.badgeClass}`}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{module.summary}</p>
                <div className="mt-5 space-y-3 text-sm text-[var(--ink)]">
                  <p>
                    <span className="font-semibold">Focus:</span> {module.focus}
                  </p>
                  <p>
                    <span className="font-semibold">Output:</span> {module.deliverable}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <Layers3 className="size-3.5" /> User flow
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">A clear learner journey from entry to progression.</h2>
          <div className="mt-6 grid gap-3">
            {learnerJourney.map((item) => (
              <div key={item.step} className="grid gap-3 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-4 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[var(--navy)] text-sm font-semibold text-[#f7efe3]">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--ink)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">Level bands</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Low, Medium, High should read as real paths.</h2>
          <div className="mt-6 space-y-4">
            {levelBands.map((band) => (
              <div key={band.name} className={`rounded-[1.5rem] border p-5 ${band.accentClass}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">{band.short}</p>
                    <h3 className="font-display mt-2 text-2xl tracking-tight">{band.name}</h3>
                  </div>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-white/70">
                    <div className={`progress-stripe h-full rounded-full ${band.barClass}`} />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6">{band.summary}</p>
                <p className="mt-3 text-sm leading-6 opacity-80">
                  <span className="font-semibold">Support:</span> {band.support}
                </p>
                <p className="mt-2 text-sm leading-6 opacity-80">
                  <span className="font-semibold">Unlocks:</span> {band.unlock}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
        <p className="section-label">Feature map</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl tracking-tight text-[var(--ink)]">MVP features the client can evaluate quickly.</h2>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            The UI now frames the product as an academic tool for progression rather than a generic English practice site.
          </p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {releaseFeatures.map((feature) => (
            <article key={feature.title} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[var(--ink)]">{feature.title}</h3>
                <span className="rounded-full bg-[rgba(20,50,75,0.08)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {feature.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{feature.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
