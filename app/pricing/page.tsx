import { CheckCircle2, CircleAlert, Crown, School } from "lucide-react";

import { CheckoutButton } from "@/components/forms/checkout-button";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

const planCards = [
  {
    name: "Starter",
    price: "$0",
    audience: "Individual learners exploring the platform",
    features: ["Placement test", "Core dashboard", "Limited speaking + writing feedback"],
    tone: "surface-panel",
    cta: null,
  },
  {
    name: "Pro Monthly",
    price: "$9.99 / mo",
    audience: "Learners who want continuous AI feedback and progress support",
    features: ["Unlimited AI feedback", "Advanced academic modules", "Monthly diagnostic summary"],
    tone: "surface-ink",
    cta: { priceId: "monthly", label: "Start monthly" },
  },
  {
    name: "Pro Yearly",
    price: "$89 / yr",
    audience: "Committed learners who plan to stay through several study cycles",
    features: ["Everything in Pro Monthly", "Lower annual cost", "Priority access to new academic content"],
    tone: "surface-panel",
    cta: { priceId: "yearly", label: "Start yearly" },
  },
] as const;

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; success?: string; canceled?: string; mockCheckout?: string; price?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params);
  const mockPrice = params.price === "yearly" ? "yearly" : "monthly";

  return (
    <PageFrame
      locale={locale}
      title="Pricing"
      description="Pricing is now presented as a clear product decision: what the free learner gets, what continuous AI support costs, and how billing relates to academic progress."
    >
      {params.success ? (
        <div className="mb-5 rounded-[1.5rem] border border-[rgba(42,105,88,0.16)] bg-[rgba(237,246,241,0.9)] px-5 py-4 text-sm font-medium text-[var(--teal)]">
          <CheckCircle2 className="mr-2 inline size-4" /> Subscription flow completed successfully.
        </div>
      ) : null}
      {params.canceled ? (
        <div className="mb-5 rounded-[1.5rem] border border-[rgba(195,109,89,0.24)] bg-[rgba(255,244,240,0.9)] px-5 py-4 text-sm font-medium text-[var(--coral)]">
          <CircleAlert className="mr-2 inline size-4" /> Checkout was canceled before completion.
        </div>
      ) : null}
      {params.mockCheckout ? (
        <div className="mb-5 rounded-[1.5rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(255,255,255,0.8)] px-5 py-4 text-sm font-medium text-[var(--ink-soft)]">
          Mock checkout redirected back with the <span className="font-semibold text-[var(--ink)]">{mockPrice}</span> plan selected.
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-3">
        {planCards.map((plan, index) => (
          <article key={plan.name} className={`${plan.tone} reveal-up rounded-[2rem] p-6 sm:p-7`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={index === 1 ? "text-xs uppercase tracking-[0.22em] text-[#f2d9ae]" : "text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]"}>{plan.name}</p>
                <h2 className={index === 1 ? "font-display mt-4 text-4xl tracking-tight text-[#f7efe3]" : "font-display mt-4 text-4xl tracking-tight text-[var(--ink)]"}>{plan.price}</h2>
              </div>
              {index === 1 ? <Crown className="size-5 text-[#f2d9ae]" /> : <School className="size-5 text-[var(--navy)]" />}
            </div>
            <p className={index === 1 ? "mt-4 text-sm leading-7 text-[#efe5d6]/76" : "mt-4 text-sm leading-7 text-[var(--ink-soft)]"}>{plan.audience}</p>
            <div className="mt-6 grid gap-3">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className={index === 1 ? "rounded-[1.2rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-[#f7efe3]" : "rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] px-4 py-3 text-sm text-[var(--ink)]"}
                >
                  {feature}
                </div>
              ))}
            </div>
            {plan.cta ? (
              <div className="mt-6">
                <CheckoutButton priceId={plan.cta.priceId} label={plan.cta.label} tone={index === 1 ? "light" : "dark"} />
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">What changes with Pro</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">The paid tier should justify itself through better feedback loops.</h2>
          <div className="mt-6 grid gap-3">
            {[
              "Speaking and writing analysis can be used repeatedly during the same study week.",
              "Learners get more advanced academic modules beyond the base path.",
              "Progress reporting is deeper, so reassessment timing is easier to justify.",
            ].map((item) => (
              <div key={item} className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Billing note</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight">Subscription design should stay secondary to learning value.</h2>
          <div className="mt-6 grid gap-3 text-sm leading-7 text-[#efe5d6]/78">
            <p>The free plan is enough to show product direction.</p>
            <p>Pro exists to increase feedback volume and long-term academic progression.</p>
            <p>For team or school deployment, an admin-facing contract plan can come later.</p>
          </div>
        </article>
      </section>
    </PageFrame>
  );
}
