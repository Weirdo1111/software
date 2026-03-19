import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { levelBands } from "@/lib/academic-ui";
import { type Locale } from "@/lib/i18n/dictionaries";

export function LearnHero({ locale }: { locale: Locale }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
      <section className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-8">
        <p className="section-label">Default pathway</p>
        <h2 className="font-display mt-4 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">Medium band is the launch baseline.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
          The main target audience is intermediate university learners, so the first visible path should feel optimized for Medium while still
          showing how Low and High versions expand or simplify the same learning structure.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {levelBands.map((band) => (
            <article key={band.name} className={`rounded-[1.4rem] border p-4 ${band.accentClass}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{band.short}</p>
              <h3 className="font-display mt-2 text-2xl tracking-tight">{band.name}</h3>
              <p className="mt-3 text-sm leading-6 opacity-80">{band.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Learning logic</p>
        <h3 className="font-display mt-4 text-3xl tracking-tight">One loop, four skills.</h3>
        <div className="mt-5 space-y-4 text-sm leading-7 text-[#efe5d6]/78">
          <p>Every module should end with evidence the learner produced, not just a completion tick.</p>
          <p>Listening and reading feed input quality; speaking and writing show productive control.</p>
          <p>Progress data should be visible enough to justify reassessment later.</p>
        </div>
        <Link
          href={`/dashboard?lang=${locale}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-[#f7efe3] transition hover:bg-white/14"
        >
          Open learner dashboard
          <ArrowRight className="size-4" />
        </Link>
      </aside>
    </div>
  );
}
