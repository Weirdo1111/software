import { Compass, FileCheck2, Sparkles } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { AuthForm } from "@/components/forms/auth-form";
import { getLocale } from "@/lib/i18n/get-locale";

const signInSignals = [
  {
    title: "Resume assessment history",
    detail: "Learners return to their Low / Medium / High recommendation and prior band evidence.",
  },
  {
    title: "Continue four-skill study",
    detail: "Listening, speaking, reading, and writing progress stays tied to the same workspace.",
  },
  {
    title: "Keep AI feedback records",
    detail: "Writing and speaking reviews remain available as improvement evidence before reassessment.",
  },
] as const;

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Sign in to the academic English workspace"
      description="Account access is positioned as the doorway back to assessment history, skill modules, and progress evidence rather than a generic login screen."
    >
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <AuthForm mode="sign-in" locale={locale} />

        <aside className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Why sign in</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight">Pick up the same learning path where you left it.</h2>
          <div className="mt-6 grid gap-3">
            {signInSignals.map((item) => (
              <article key={item.title} className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4">
                <h3 className="text-sm font-semibold text-[#f7efe3]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#efe5d6]/76">{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <FileCheck2 className="size-4 text-[#f2d9ae]" />
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f2d9ae]">Assessment</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <Compass className="size-4 text-[#f2d9ae]" />
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f2d9ae]">Modules</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <Sparkles className="size-4 text-[#f2d9ae]" />
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f2d9ae]">Feedback</p>
            </div>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}
