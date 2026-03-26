import { Layers3 } from "lucide-react";

import { learnerJourney, levelBands } from "@/lib/academic-ui";

export function HomeJourneyBands() {
  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
      <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
        <p className="section-label">
          <Layers3 className="size-3.5" /> User flow
        </p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">A clear learner journey from entry to progression.</h2>
        <div className="mt-6 grid gap-3">
          {learnerJourney.map((item) => (
            <div
              key={item.step}
              className="grid gap-3 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-4 sm:grid-cols-[auto_1fr] sm:items-start"
            >
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
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Easy, Medium, Difficult should read as real paths.</h2>
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
  );
}
