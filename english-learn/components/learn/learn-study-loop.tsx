import { Workflow } from "lucide-react";

import { weeklyWorkflow } from "@/lib/academic-ui";

const architectureSignals = [
  {
    label: "Band fit",
    detail: "Learners should always understand whether a task is foundational, balanced, or stretch-level.",
  },
  {
    label: "Task evidence",
    detail: "Every lesson card now shows the output learners are expected to produce at the end.",
  },
  {
    label: "Workload clarity",
    detail: "Minutes are explicit so the platform feels manageable for weekly academic study habits.",
  },
  {
    label: "Progress relevance",
    detail: "Readiness and completion indicators connect directly to reassessment and harder content unlocks.",
  },
] as const;

export function LearnStudyLoop() {
  return (
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
          {architectureSignals.map((signal) => (
            <div key={signal.label} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{signal.label}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{signal.detail}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
