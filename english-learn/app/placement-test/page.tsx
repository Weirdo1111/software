import { CheckCircle2, ClipboardCheck, RefreshCcw } from "lucide-react";

import { PlacementForm } from "@/components/forms/placement-form";
import { PageFrame } from "@/components/page-frame";
import { assessmentFacts, levelBands } from "@/lib/academic-ui";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function PlacementTestPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Placement test and level routing"
      description="The first learner action in the agreed product flow: estimate current academic readiness, assign a band, and unlock the right content path."
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-8">
          <p className="section-label">
            <ClipboardCheck className="size-3.5" /> Assessment overview
          </p>
          <h2 className="font-display mt-4 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">A short test that drives the whole learning plan.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
            The UI now treats placement as the gateway to personalization. Learners should understand why they are taking it, what it measures,
            and how the result affects the next modules they see.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {assessmentFacts.map((fact) => (
              <article key={fact} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
                <p className="text-sm leading-7 text-[var(--ink)]">{fact}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">After the test</p>
          <h3 className="font-display mt-4 text-3xl tracking-tight">Results must feel actionable.</h3>
          <div className="mt-5 space-y-3 text-sm leading-7 text-[#efe5d6]/78">
            <p>The result should explain the assigned band, not only show a raw score.</p>
            <p>The dashboard and learning page should immediately reflect the recommendation.</p>
            <p>Reassessment stays visible so the learner sees a path upward.</p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-[#f2d9ae]" />
                <p className="text-sm font-semibold text-[#f7efe3]">Low / Medium / High routing</p>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4">
              <div className="flex items-center gap-3">
                <RefreshCcw className="size-4 text-[#f2d9ae]" />
                <p className="text-sm font-semibold text-[#f7efe3]">Retake when performance improves</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-5 sm:p-6">
          <PlacementForm />
        </article>

        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">Band criteria</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">What the learner bands mean.</h2>
          <div className="mt-6 space-y-4">
            {levelBands.map((band) => (
              <div key={band.name} className={`rounded-[1.5rem] border p-5 ${band.accentClass}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{band.short}</p>
                <h3 className="font-display mt-2 text-2xl tracking-tight">{band.name}</h3>
                <p className="mt-4 text-sm leading-6">{band.summary}</p>
                <p className="mt-3 text-sm leading-6 opacity-80">
                  <span className="font-semibold">Support:</span> {band.support}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageFrame>
  );
}
