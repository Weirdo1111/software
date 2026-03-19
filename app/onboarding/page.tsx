import Link from "next/link";
import { ArrowRight, ClipboardList, Target, TimerReset } from "lucide-react";

import { OnboardingForm } from "@/components/forms/onboarding-form";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

const onboardingSignals = [
  {
    title: "Primary objective",
    detail: "Clarify whether this learner needs support for coursework, research reading, or seminar speaking.",
  },
  {
    title: "Study load",
    detail: "Use the daily time budget to shape realistic plans rather than aspirational ones that break quickly.",
  },
  {
    title: "Interface fit",
    detail: "Choose the language environment that helps the learner understand instructions without reducing academic challenge.",
  },
] as const;

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Learner onboarding"
      description="The onboarding flow now prepares a credible academic study profile before the learner enters placement and the four-skill pathway."
    >
      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <OnboardingForm />

        <aside className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">What onboarding decides</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight">Profile first, then placement is more useful.</h2>
          <div className="mt-6 grid gap-3">
            {onboardingSignals.map((item) => (
              <article key={item.title} className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4">
                <h3 className="text-sm font-semibold text-[#f7efe3]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#efe5d6]/76">{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <ClipboardList className="size-4 text-[#f2d9ae]" />
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f2d9ae]">Context</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <Target className="size-4 text-[#f2d9ae]" />
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f2d9ae]">Focus</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <TimerReset className="size-4 text-[#f2d9ae]" />
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f2d9ae]">Pacing</p>
            </div>
          </div>
          <Link
            href={`/placement-test?lang=${locale}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-[#f7efe3] transition hover:bg-white/14"
          >
            Continue to placement
            <ArrowRight className="size-4" />
          </Link>
        </aside>
      </div>
    </PageFrame>
  );
}
