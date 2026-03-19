import { releaseFeatures } from "@/lib/academic-ui";

export function HomeFeatureMap() {
  return (
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
  );
}
