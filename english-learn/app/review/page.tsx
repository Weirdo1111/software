import { AlertTriangle, BookMarked, BrainCircuit, CalendarClock } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

const dueCards = [
  {
    front: "synthesize evidence",
    back: "整合论据 / 证据",
    due: "Today",
    interval: "2 days",
    tag: "Writing",
  },
  {
    front: "counterargument",
    back: "反方论点",
    due: "Today",
    interval: "4 days",
    tag: "Reading",
  },
  {
    front: "signpost phrase",
    back: "提示结构的表达",
    due: "Tomorrow",
    interval: "6 days",
    tag: "Listening",
  },
] as const;

const mistakeNotebook = [
  "Repeated issue: weak contrast linking in analytical paragraphs.",
  "Listening notes often miss examples that support the main claim.",
  "Speaking responses lose clarity near sentence endings when pace speeds up.",
] as const;

const reviewBuckets = [
  { label: "Due today", value: "24", note: "Priority review before new tasks" },
  { label: "Mature cards", value: "83", note: "Stable academic vocabulary" },
  { label: "At-risk items", value: "9", note: "High lapse count this week" },
  { label: "Notebook entries", value: "12", note: "Recurring patterns to revisit" },
] as const;

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Review center"
      description="The review UI now reads as an academic retention workspace: spaced repetition, error patterns, and recovery priorities all in one place."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reviewBuckets.map((item, index) => (
          <article key={item.label} className={index === 0 ? "surface-ink rounded-[1.8rem] p-5" : "surface-panel rounded-[1.8rem] p-5"}>
            <p className={index === 0 ? "text-xs uppercase tracking-[0.22em] text-[#f2d9ae]" : "text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]"}>
              {item.label}
            </p>
            <p className={index === 0 ? "font-display mt-3 text-4xl tracking-tight text-[#f7efe3]" : "font-display mt-3 text-4xl tracking-tight text-[var(--ink)]"}>
              {item.value}
            </p>
            <p className={index === 0 ? "mt-2 text-sm leading-6 text-[#efe5d6]/76" : "mt-2 text-sm leading-6 text-[var(--ink-soft)]"}>{item.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <BookMarked className="size-3.5" /> Due deck
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Cards ready for review now.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dueCards.map((card) => (
              <article key={card.front} className="rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_18px_30px_rgba(23,32,51,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{card.tag}</p>
                <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{card.front}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{card.back}</p>
                <div className="mt-5 grid gap-2 text-sm text-[var(--ink)]">
                  <p>
                    <span className="font-semibold">Due:</span> {card.due}
                  </p>
                  <p>
                    <span className="font-semibold">Current interval:</span> {card.interval}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </article>

        <div className="grid gap-5">
          <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="section-label">
              <AlertTriangle className="size-3.5" /> Mistake notebook
            </p>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Patterns that keep returning.</h2>
            <div className="mt-6 grid gap-3">
              {mistakeNotebook.map((item) => (
                <div key={item} className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Review logic</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight">Retention should support reassessment later.</h2>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.3rem] border border-white/12 bg-white/6 p-4">
                <div className="flex items-center gap-3 text-[#f7efe3]">
                  <BrainCircuit className="size-4 text-[#f2d9ae]" />
                  <p className="text-sm font-semibold">SRS keeps academic language active</p>
                </div>
              </div>
              <div className="rounded-[1.3rem] border border-white/12 bg-white/6 p-4">
                <div className="flex items-center gap-3 text-[#f7efe3]">
                  <CalendarClock className="size-4 text-[#f2d9ae]" />
                  <p className="text-sm font-semibold">Due timing helps avoid overload before new lessons</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PageFrame>
  );
}
