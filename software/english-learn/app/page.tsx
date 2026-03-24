import { Ear, FileText, Layers3, Mic, PenLine, Sparkles, Target } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { ProtectedAction } from "@/components/protected-action";
import {
  learnerJourney,
  learningModules,
  levelBands,
  platformSignals,
  releaseFeatures,
} from "@/lib/academic-ui";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionaries";

const skillIcons = {
  listening: Ear,
  speaking: Mic,
  reading: FileText,
  writing: PenLine,
} as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const isLoggedIn = false;
  const homeCopy =
    locale === "zh"
      ? {
          heroLabel: "DIICSU Focus",
          heroHeading: "面向 DIICSU 本科生的学术英语支持，不该像通用英语产品。",
          heroBody:
            "这版首页围绕全英文课程、seminar 发言、reading list、presentation 与 coursework 写作来组织体验，让学生更容易感到这套系统就是为他们的学习周而设计。",
          guideWords: [
            "Lecture preview",
            "Seminar turn",
            "Reading list",
            "Coursework draft",
            "Presentation rehearsal",
          ],
          scopeLabel: "A week in DIICSU",
          scopeHeading: "不是泛泛练英语，而是更像真实的一周学习节奏。",
          scopeBody:
            "首页右侧不再只讲产品范围，而是把 lecture、tutorial、reading、report 与 short presentation 这些本科生日常场景直接说出来。",
          modulesHeading: "四项能力对应 DIICSU 学生真正会遇到的学习节奏。",
          modulesBody:
            "每个模块都更靠近 lecture、seminar、reading list 和 coursework，而不是四个割裂的小工具。",
          flowHeading: "这条学习路径更像 DIICSU 学生从适应到进步的过程。",
          bandsHeading: "Low、Medium、High 应该被理解成真实支持路径，而不是抽象分层。",
          featureLabel: "DIICSU fit",
          featureHeading: "让页面从通用 EdTech 感，变成更明确的学院定向界面。",
          featureBody:
            "顶部品牌条、首页语境和模块说明现在都更靠近 DIICSU 本科生的课程与作业日常。",
        }
      : {
          heroLabel: "DIICSU Focus",
          heroHeading: "Academic English support for DIICSU undergraduates should not feel generic.",
          heroBody:
            "This version frames the experience around English-medium modules, seminar turns, reading lists, presentations, and coursework so the platform feels closer to a real DIICSU study week.",
          guideWords: [
            "Lecture preview",
            "Seminar turn",
            "Reading list",
            "Coursework draft",
            "Presentation rehearsal",
          ],
          scopeLabel: "A week in DIICSU",
          scopeHeading: "Not generic English practice. A more believable study rhythm.",
          scopeBody:
            "The right-hand panel now names the situations DIICSU undergraduates actually face: lectures, tutorials, reading lists, reports, and short presentations.",
          modulesHeading:
            "Four skills aligned to the study rhythm DIICSU students actually live through.",
          modulesBody:
            "Each module now points more clearly to lecture prep, seminar participation, reading lists, and coursework delivery instead of four unrelated mini tools.",
          flowHeading:
            "A learner journey that feels closer to DIICSU adaptation and progression.",
          bandsHeading:
            "Low, Medium, High should feel like real support paths for undergraduate study.",
          featureLabel: "DIICSU fit",
          featureHeading:
            "Make the interface read more like a DIICSU-facing academic tool than generic EdTech.",
          featureBody:
            "The home experience now leans into DIICSU study context, English-medium teaching, and assignment-driven progression.",
        };

  return (
    <PageFrame
      locale={locale}
      title={t(locale, "hero_title")}
      description={t(locale, "hero_desc")}
    >
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <section className="surface-panel hero-campus reveal-up relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[rgba(20,50,75,0.08)] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-10 left-12 size-32 rounded-full bg-[rgba(216,142,52,0.14)] blur-3xl"
            aria-hidden
          />

          <p className="section-label">
            <Sparkles className="size-3.5" /> {homeCopy.heroLabel}
          </p>

          <h2 className="font-display mt-5 max-w-4xl text-4xl leading-tight tracking-tight text-[var(--ink)] sm:text-5xl">
            {homeCopy.heroHeading}
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
            {homeCopy.heroBody}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {homeCopy.guideWords.map((word) => (
              <span key={word} className="signal-pill">
                {word}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {platformSignals.map((signal) => (
              <article
                key={signal.label}
                className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                  {signal.label}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink)]">
                  {signal.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        <aside className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">
            {homeCopy.scopeLabel}
          </p>

          <h3 className="font-display mt-4 text-3xl tracking-tight">
            {homeCopy.scopeHeading}
          </h3>

          <p className="mt-3 text-sm leading-7 text-[#efe5d6]/78">
            {homeCopy.scopeBody}
          </p>

          <div className="mt-6 grid gap-3">
            {releaseFeatures.slice(0, 4).map((feature) => (
              <ProtectedAction
                key={feature.title}
                href={`/login?lang=${locale}`}
                locale={locale}
                isLoggedIn={isLoggedIn}
                className="block w-full rounded-[1.4rem] border border-white/12 bg-white/6 p-4 text-left transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[#f7efe3]">
                    {feature.title}
                  </h4>
                  <span className="rounded-full border border-[#f2d9ae]/50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2d9ae]">
                    {feature.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#efe5d6]/72">
                  {feature.detail}
                </p>
              </ProtectedAction>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-6 reveal-up">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">
              <Target className="size-3.5" /> Learning modules
            </p>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              {homeCopy.modulesHeading}
            </h2>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            {homeCopy.modulesBody}
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {learningModules.map((module) => {
            const Icon = skillIcons[module.skill];

            return (
              <ProtectedAction
                key={module.skill}
                href={`/learn?lang=${locale}`}
                locale={locale}
                isLoggedIn={isLoggedIn}
                className={`block w-full rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br ${module.surfaceClass} p-5 text-left shadow-[0_18px_40px_rgba(23,32,51,0.08)] transition hover:translate-y-[-2px]`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                      {module.minutes}
                    </p>
                    <h3 className="font-display mt-3 text-2xl tracking-tight">
                      {module.title}
                    </h3>
                  </div>

                  <div
                    className={`inline-flex size-11 items-center justify-center rounded-2xl ${module.badgeClass}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                  {module.summary}
                </p>

                <div className="mt-5 space-y-3 text-sm text-[var(--ink)]">
                  <p>
                    <span className="font-semibold">Focus:</span> {module.focus}
                  </p>
                  <p>
                    <span className="font-semibold">Output:</span>{" "}
                    {module.deliverable}
                  </p>
                </div>
              </ProtectedAction>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <Layers3 className="size-3.5" /> User flow
          </p>

          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            {homeCopy.flowHeading}
          </h2>

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
                  <h3 className="text-base font-semibold text-[var(--ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">Level bands</p>

          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            {homeCopy.bandsHeading}
          </h2>

          <div className="mt-6 space-y-4">
            {levelBands.map((band) => (
              <div
                key={band.name}
                className={`rounded-[1.5rem] border p-5 ${band.accentClass}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">
                      {band.short}
                    </p>
                    <h3 className="font-display mt-2 text-2xl tracking-tight">
                      {band.name}
                    </h3>
                  </div>

                  <div className="h-2 w-24 overflow-hidden rounded-full bg-white/70">
                    <div
                      className={`progress-stripe h-full rounded-full ${band.barClass}`}
                    />
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

      <section className="mt-6 surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
        <p className="section-label">{homeCopy.featureLabel}</p>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl tracking-tight text-[var(--ink)]">
            {homeCopy.featureHeading}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            {homeCopy.featureBody}
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {releaseFeatures.map((feature) => (
            <ProtectedAction
              key={feature.title}
              href={`/login?lang=${locale}`}
              locale={locale}
              isLoggedIn={isLoggedIn}
              className="block w-full rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4 text-left transition hover:bg-[rgba(255,255,255,0.92)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[var(--ink)]">
                  {feature.title}
                </h3>
                <span className="rounded-full bg-[rgba(20,50,75,0.08)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {feature.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                {feature.detail}
              </p>
            </ProtectedAction>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
