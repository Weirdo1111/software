import { BarChart3, Gauge, TrendingUp } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { summary30d, summary7d } from "@/lib/mock-data";
import { getLocale } from "@/lib/i18n/get-locale";

const skillProgress = [
  { skill: "Listening", value: 68, note: "Lecture notes and evidence capture improving." },
  { skill: "Speaking", value: 54, note: "Seminar response clarity still below the other three skills." },
  { skill: "Reading", value: 79, note: "Best-performing area across source comprehension and structure mapping." },
  { skill: "Writing", value: 63, note: "Paragraph cohesion is improving but revision still needs support." },
] as const;

const weeklyMinutes = [18, 26, 14, 32, 20, 28, 22] as const;
const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Learning progress"
      description="The progress view now combines time, accuracy, skill balance, and reassessment readiness instead of showing only generic totals."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="surface-panel rounded-[1.8rem] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">Last 7 days</p>
          <p className="font-display mt-3 text-4xl tracking-tight text-[var(--ink)]">{summary7d.minutes} min</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{summary7d.lessons_completed} modules completed</p>
        </article>
        <article className="surface-panel rounded-[1.8rem] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">Last 30 days</p>
          <p className="font-display mt-3 text-4xl tracking-tight text-[var(--ink)]">{summary30d.minutes} min</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{summary30d.lessons_completed} modules completed</p>
        </article>
        <article className="surface-panel rounded-[1.8rem] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">Accuracy</p>
          <p className="font-display mt-3 text-4xl tracking-tight text-[var(--ink)]">{Math.round(summary30d.accuracy * 100)}%</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Stable enough for harder reading and writing tasks.</p>
        </article>
        <article className="surface-ink rounded-[1.8rem] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#f2d9ae]">Reassessment readiness</p>
          <p className="font-display mt-3 text-4xl tracking-tight text-[#f7efe3]">72%</p>
          <p className="mt-2 text-sm leading-6 text-[#efe5d6]/76">One stronger speaking week would justify the next test window.</p>
        </article>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <Gauge className="size-3.5" /> Skill balance
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">How each academic skill is moving.</h2>
          <div className="mt-6 grid gap-4">
            {skillProgress.map((item) => (
              <div key={item.skill} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">{item.skill}</p>
                  <p className="text-sm font-semibold text-[var(--ink-soft)]">{item.value}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(20,50,75,0.08)]">
                  <div className="h-full rounded-full bg-[var(--navy)] progress-stripe" style={{ width: `${item.value}%` }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{item.note}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-5">
          <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="section-label">
              <BarChart3 className="size-3.5" /> Weekly rhythm
            </p>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Minutes studied across the week.</h2>
            <div className="mt-6 grid grid-cols-7 items-end gap-3">
              {weeklyMinutes.map((value, index) => (
                <div key={weeklyLabels[index]} className="flex flex-col items-center gap-3">
                  <div className="flex h-44 w-full items-end rounded-full bg-[rgba(20,50,75,0.08)] p-2">
                    <div
                      className="w-full rounded-full bg-[var(--amber)] progress-stripe"
                      style={{ height: `${Math.max(22, value * 4)}px` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{weeklyLabels[index]}</p>
                    <p className="text-sm font-semibold text-[var(--ink)]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Focus next</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight">Use progress to choose the next intervention.</h2>
            <div className="mt-6 grid gap-3 text-sm leading-7 text-[#efe5d6]/78">
              <p>Weak skills this cycle: speaking fluency, sentence accuracy, and academic transition control.</p>
              <p>Strongest area: reading structure analysis. This can now feed more source-based writing tasks.</p>
              <p>Recommendation: keep one speaking task live every day until the next reassessment checkpoint.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6 surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
        <p className="section-label">
          <TrendingUp className="size-3.5" /> Growth narrative
        </p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Why the learner is still in Medium for now.</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--ink-soft)]">
          Reading and writing evidence are strong enough to suggest upward movement, but speaking output remains inconsistent. The UI now makes that reasoning explicit so reassessment feels justified rather than arbitrary.
        </p>
      </section>
    </PageFrame>
  );
}
