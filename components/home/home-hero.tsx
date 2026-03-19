import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { platformSignals, releaseFeatures } from "@/lib/academic-ui";
import { type Locale, t } from "@/lib/i18n/dictionaries";

export function HomeHero({ locale }: { locale: Locale }) {
  return (
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
          The first release should feel clear and credible: learners enter, complete a placement test, receive a Low / Medium / High
          recommendation, then move into academic listening, speaking, reading, and writing tasks designed for their band.
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
  );
}
