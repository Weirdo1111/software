import { ClipboardCheck, Compass, Route, Sparkles } from "lucide-react";

import { PlacementForm } from "@/components/forms/placement-form";
import { PageFrame } from "@/components/page-frame";
import { levelBands } from "@/lib/academic-ui";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function PlacementTestPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Placement test and level routing"
      description="The first learner action in the agreed product flow: estimate current academic readiness, assign a band, and unlock the right content path."
    >
      <section className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-8">
        <p className="section-label">
          <ClipboardCheck className="size-3.5" /> Placement workflow
        </p>
        <h2 className="font-display mt-4 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">One clear page, one practical result.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
          Finish the four-skill test, review the recommendation, and move directly into the next learning step without switching layouts.
        </p>

        <div className="mt-6 grid gap-3">
          <article className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
            <div className="flex items-center gap-3">
              <Compass className="size-4 text-[var(--navy)]" />
              <p className="text-sm font-semibold text-[var(--ink)]">Use the quick actions inside the test to jump to any unanswered section.</p>
            </div>
          </article>
          <article className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="size-4 text-[var(--navy)]" />
              <p className="text-sm font-semibold text-[var(--ink)]">The result now explains strongest skill, recommended focus, and the four-skill breakdown.</p>
            </div>
          </article>
          <article className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
            <div className="flex items-center gap-3">
              <Route className="size-4 text-[var(--navy)]" />
              <p className="text-sm font-semibold text-[var(--ink)]">After submission, use the action buttons to go straight to the dashboard or learning hub.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6">
        <article className="surface-panel reveal-up rounded-[2rem] p-5 sm:p-6">
          <PlacementForm locale={locale} />
        </article>
      </section>

      <section className="mt-6 surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
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
      </section>
    </PageFrame>
  );
}
