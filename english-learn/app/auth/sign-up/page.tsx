import { CheckCircle2, LibraryBig, UserRoundPlus } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { AuthForm } from "@/components/forms/auth-form";
import { getLocale } from "@/lib/i18n/get-locale";

const signUpFlow = [
  {
    step: "01",
    title: "Create freshman access",
    detail: "Open one DIICSU learner space that will hold placement results, buddy progress, and feedback records.",
  },
  {
    step: "02",
    title: "Set your weekly rhythm",
    detail: "Start with a realistic study pattern for lectures, coursework writing, and seminar preparation.",
  },
  {
    step: "03",
    title: "Enter the four-skill hub",
    detail: "Move into listening, reading, speaking, and writing practice built for English-medium university study.",
  },
] as const;

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Create your DIICSU freshman English account"
      description="Open one newcomer workspace for EMI study, coursework support, seminar preparation, and visible progress tracking."
    >
      <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <AuthForm mode="sign-up" locale={locale} />

        <aside className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <UserRoundPlus className="size-3.5" /> Setup flow
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">What your DIICSU account sets up.</h2>
          <div className="mt-6 grid gap-3">
            {signUpFlow.map((item) => (
              <article key={item.step} className="grid gap-3 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-4 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--navy)] text-sm font-semibold text-[#f7efe3]">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--ink)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-4">
              <LibraryBig className="size-4 text-[var(--navy)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--ink)]">EMI support</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Content is framed around lectures, coursework, seminar speaking, and academic progression.</p>
            </div>
            <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-4">
              <CheckCircle2 className="size-4 text-[var(--navy)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--ink)]">Trackable growth</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">The platform keeps enough study evidence, buddy progress, and review history to show real development over time.</p>
            </div>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}
