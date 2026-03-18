import Link from "next/link";
import { BellRing, Globe2, LockKeyhole, SlidersHorizontal } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

const toggles = [
  {
    section: "Notifications",
    icon: BellRing,
    items: [
      { label: "Daily reminder before planned study time", checked: true },
      { label: "Weekly progress digest", checked: true },
      { label: "Reassessment eligibility alert", checked: false },
    ],
  },
  {
    section: "Learning defaults",
    icon: SlidersHorizontal,
    items: [
      { label: "Prioritize speaking when skill balance drops", checked: true },
      { label: "Show bilingual support cues in low-band tasks", checked: true },
      { label: "Auto-open review before new lesson when cards are overdue", checked: false },
    ],
  },
] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const isLoggedIn = false;

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#f3efe6] px-6 py-10">
        <div className="mx-auto max-w-xl rounded-[32px] border border-white/50 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            ENGLISH LEARN
          </p>

          <h1 className="mt-4 text-3xl font-semibold text-[#22314d]">
            {locale === "zh" ? "请先登录" : "Log in required"}
          </h1>

          <p className="mt-4 leading-7 text-slate-500">
            {locale === "zh"
              ? "设置功能需要登录后才能使用。登录后你可以管理语言、提醒、学习偏好和账号安全。"
              : "Settings are available after sign-in. Log in to manage language, reminders, learning defaults, and account protection."}
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href={`/login?lang=${locale}`}
              className="rounded-full bg-[#22314d] px-5 py-3 text-sm font-semibold text-white"
            >
              {locale === "zh" ? "前往登录" : "Go to login"}
            </Link>

            <Link
              href={`/?lang=${locale}`}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-[#22314d]"
            >
              {locale === "zh" ? "返回首页" : "Back home"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <PageFrame
      locale={locale}
      title="Settings"
      description="Settings are now grouped by actual learner concerns: interface language, study defaults, notification timing, and account protection."
    >
      <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <Globe2 className="size-3.5" /> Interface and language
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            Control how the platform speaks to the learner.
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
              Interface language
              <select className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none">
                <option>中文</option>
                <option>English</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
              Native language support
              <select className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none">
                <option>Chinese</option>
                <option>Spanish</option>
                <option>Japanese</option>
                <option>English</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--ink)] sm:col-span-2">
              Default weekly study target
              <select className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none">
                <option>90 minutes</option>
                <option>120 minutes</option>
                <option>150 minutes</option>
              </select>
            </label>
          </div>
        </article>

        <article className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">
            Settings logic
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight">
            Preferences should support consistency, not distract from study.
          </h2>
          <div className="mt-6 grid gap-3 text-sm leading-7 text-[#efe5d6]/78">
            <p>
              The most useful defaults are the ones that protect weekly rhythm
              and keep the learner inside the academic path.
            </p>
            <p>
              Notification timing matters because reassessment only works if
              enough evidence has been accumulated first.
            </p>
            <p>
              Language support should reduce confusion without collapsing the
              academic challenge level.
            </p>
          </div>
        </article>
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        {toggles.map((group) => {
          const Icon = group.icon;
          return (
            <article
              key={group.section}
              className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7"
            >
              <p className="section-label">
                <Icon className="size-3.5" /> {group.section}
              </p>
              <div className="mt-6 grid gap-3">
                {group.items.map((item) => (
                  <label
                    key={item.label}
                    className="flex items-start gap-3 rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4 text-sm text-[var(--ink)]"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="mt-1"
                    />
                    <span className="leading-6">{item.label}</span>
                  </label>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-6 surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
        <p className="section-label">
          <LockKeyhole className="size-3.5" /> Account protection
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-[var(--ink)]">
              Security and data control.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
              Let the learner export progress, reset reminders, or delete the
              workspace without searching through unrelated controls.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink)]"
            >
              Export progress
            </button>
            <button
              type="button"
              className="rounded-full border border-[rgba(195,109,89,0.28)] bg-[rgba(255,244,240,0.9)] px-4 py-2 text-sm font-semibold text-[var(--coral)]"
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}