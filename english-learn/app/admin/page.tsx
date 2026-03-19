import { BarChart4, ClipboardPenLine, Layers2, TriangleAlert } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

const stats = [
  { label: "Active learners (7d)", value: "1,284", note: "Stable across the last two weeks" },
  { label: "Placement completion", value: "61%", note: "Needs better homepage-to-test conversion" },
  { label: "Medium band share", value: "54%", note: "Confirms the main launch audience assumption" },
  { label: "AI cost / 1k MAU", value: "$480", note: "Speaking and writing still drive most usage" },
] as const;

const contentQueue = [
  { title: "Listening module: lecture note-taking", status: "Ready for QA" },
  { title: "Reading module: abstract + argument map", status: "Needs content review" },
  { title: "Writing rubric for Low band", status: "Blocked on scoring rules" },
] as const;

const clientQuestions = [
  "How long should the placement test be in the first release?",
  "How should the four skills be weighted in band assignment?",
  "Will speaking and writing be reviewed by AI only, teachers, or both?",
] as const;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Admin console"
      description="The admin UI now reflects product operations: KPI tracking, placement funnel visibility, content readiness, and unresolved client decisions."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="surface-panel rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">{item.label}</p>
            <p className="font-display mt-3 text-4xl tracking-tight text-[var(--ink)]">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.98fr_1.02fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <BarChart4 className="size-3.5" /> Placement funnel
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">How learners move through the early product flow.</h2>
          <div className="mt-6 grid gap-4">
            {[
              { label: "Homepage visits", value: 100, color: "bg-[var(--navy)]" },
              { label: "Started placement", value: 68, color: "bg-[var(--teal)]" },
              { label: "Completed placement", value: 61, color: "bg-[var(--amber)]" },
              { label: "Entered dashboard", value: 49, color: "bg-[var(--coral)]" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">{item.label}</p>
                  <p className="text-sm font-semibold text-[var(--ink-soft)]">{item.value}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(20,50,75,0.08)]">
                  <div className={`h-full rounded-full progress-stripe ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-5">
          <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="section-label">
              <ClipboardPenLine className="size-3.5" /> Content operations
            </p>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">What the team is shipping next.</h2>
            <div className="mt-6 grid gap-3">
              {contentQueue.map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-[var(--ink)]">{item.title}</h3>
                    <span className="rounded-full bg-[rgba(20,50,75,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Open questions</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight">Client decisions still blocking detail work.</h2>
            <div className="mt-6 grid gap-3">
              {clientQuestions.map((question) => (
                <div key={question} className="rounded-[1.3rem] border border-white/12 bg-white/6 p-4 text-sm leading-7 text-[#efe5d6]/78">
                  {question}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6 surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
        <p className="section-label">
          <Layers2 className="size-3.5" /> Release view
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-[var(--ink)]">The MVP is operationally understandable now.</h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--ink-soft)]">The console makes it easier to see acquisition, placement, content readiness, and unresolved product assumptions from one screen.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,244,240,0.9)] px-4 py-2 text-sm font-semibold text-[var(--coral)]">
            <TriangleAlert className="size-4" /> Speaking and writing scoring still need client confirmation
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
