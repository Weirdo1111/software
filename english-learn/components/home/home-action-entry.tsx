"use client";

import Link from "next/link";
import { ArrowRight, Ear, FileText, Mic, PenLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { learningModules } from "@/lib/academic-ui";
import { type Locale } from "@/lib/i18n/dictionaries";
import {
  createEmptyLearningTrackerSnapshot,
  loadLearningTrackerSnapshotFromStorage,
  subscribeLearningTracker,
  type TrackedSkill,
} from "@/lib/learning-tracker";

type SkillRow = {
  skill: TrackedSkill;
  attempts: number;
  accuracy: number;
  completed: number;
  minutes: number;
};

const skillIcons = {
  listening: Ear,
  speaking: Mic,
  reading: FileText,
  writing: PenLine,
} as const;

const skillLabel = {
  en: {
    listening: "Listening",
    speaking: "Speaking",
    reading: "Reading",
    writing: "Writing",
  },
  zh: {
    listening: "听力",
    speaking: "口语",
    reading: "阅读",
    writing: "写作",
  },
} as const;

function normalizeLevel(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(next)) return next;
  return "A2";
}

function getSkillAccuracy(correct: number, attempts: number) {
  if (attempts <= 0) return 0;
  return Math.round((correct / attempts) * 100);
}

function getSkillHref(skill: TrackedSkill, level: string, locale: Locale) {
  if (skill === "reading") return `/reading?lang=${locale}`;
  if (skill === "listening") return `/listening?lang=${locale}`;
  return `/lesson/${level}-${skill}-starter?lang=${locale}`;
}

function getStage(level: string, locale: Locale) {
  const upper = level.toUpperCase();
  if (upper === "A1" || upper === "A2") return locale === "zh" ? "基础阶段" : "Foundation stage";
  if (upper === "B1" || upper === "B2") return locale === "zh" ? "进阶阶段" : "Developing stage";
  return locale === "zh" ? "提升阶段" : "Advanced stage";
}

function toDisplayName(raw: string | null) {
  const cleaned = String(raw ?? "").trim();
  if (!cleaned) return "Learner";
  if (cleaned.includes("@")) return cleaned.split("@")[0] || "Learner";
  return cleaned;
}

export function HomeActionEntry({ locale }: { locale: Locale }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("Learner");
  const [levelPrefix, setLevelPrefix] = useState("A2");
  const [snapshot, setSnapshot] = useState(() => createEmptyLearningTrackerSnapshot());

  const copy =
    locale === "zh"
      ? {
          welcome: "欢迎回来",
          startLine: "Start today's academic English practice",
          loginTitle: "请先登录",
          loginBody: "登录后会显示推荐学习入口、今日概览和模块快捷入口。",
          loginCta: "去登录",
          registerCta: "注册",
          continueTitle: "Continue learning",
          continueBody: "系统推荐你先完成这个模块。",
          atGlanceTitle: "Today at a glance",
          todayTasks: "今日任务数",
          doneTasks: "已完成任务",
          currentStage: "当前阶段",
          todayPlanTitle: "Today's plan",
          todayPlanBody: "只保留 3 个优先任务，按顺序完成即可。",
          duration: "建议时长",
          action: "任务说明",
          openTask: "开始任务",
          quickEntryTitle: "Quick module entry",
          quickEntryBody: "如果你想自由选择，也可以直接进入任意模块。",
          openModule: "进入",
          reasons: {
            notTried: "先完成 1 个入门任务，建立模块熟悉度。",
            lowAccuracy: "该模块正确率偏低，建议优先补强。",
            keepWarm: "保持练习节奏，巩固已有能力。",
          },
        }
      : {
          welcome: "Welcome back",
          startLine: "Start today's academic English practice",
          loginTitle: "Please sign in first",
          loginBody: "After sign-in, you'll see recommendation, today at a glance, and quick module entry.",
          loginCta: "Go to login",
          registerCta: "Register",
          continueTitle: "Continue learning",
          continueBody: "This is the best next module for you right now.",
          atGlanceTitle: "Today at a glance",
          todayTasks: "Today's tasks",
          doneTasks: "Completed",
          currentStage: "Current stage",
          todayPlanTitle: "Today's plan",
          todayPlanBody: "Keep only 3 priority tasks and complete them in order.",
          duration: "Suggested duration",
          action: "Task focus",
          openTask: "Start task",
          quickEntryTitle: "Quick module entry",
          quickEntryBody: "Prefer your own route? Enter any module directly.",
          openModule: "Open",
          reasons: {
            notTried: "Start with one entry task to build familiarity.",
            lowAccuracy: "Accuracy is lower here, so this should be your first focus.",
            keepWarm: "Keep this module active to consolidate your progress.",
          },
        };

  useEffect(() => {
    const refresh = () => {
      setIsLoggedIn(window.localStorage.getItem("demo_logged_in") === "true");
      setDisplayName(toDisplayName(window.localStorage.getItem("demo_user")));
      setLevelPrefix(normalizeLevel(window.localStorage.getItem("demo_level")));
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
    };

    refresh();
    const unsubscribe = subscribeLearningTracker(refresh);

    window.addEventListener("storage", refresh);
    window.addEventListener("demo-auth-changed", refresh as EventListener);
    window.addEventListener("demo-placement-changed", refresh as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", refresh);
      window.removeEventListener("demo-auth-changed", refresh as EventListener);
      window.removeEventListener("demo-placement-changed", refresh as EventListener);
    };
  }, []);

  const metrics = useMemo(() => {
    const skills: TrackedSkill[] = ["listening", "speaking", "reading", "writing"];

    const rows: SkillRow[] = skills.map((skill) => {
      const data = snapshot.skills[skill];
      return {
        skill,
        attempts: data.attempts,
        accuracy: getSkillAccuracy(data.correct, data.attempts),
        completed: data.completed,
        minutes: data.minutes,
      };
    });

    const totalCompleted = rows.reduce((sum, row) => sum + row.completed, 0);
    const untouched = rows.filter((row) => row.attempts === 0);
    const weakFirst = rows.filter((row) => row.attempts > 0).sort((a, b) => a.accuracy - b.accuracy);
    const ordered = [...untouched, ...weakFirst];
    const recommended = ordered[0] ?? rows[0];

    return {
      rows,
      recommended,
      totalCompleted,
      plan: ordered.slice(0, 3),
    };
  }, [snapshot]);

  const skillMeta = useMemo(() => {
    return Object.fromEntries(learningModules.map((module) => [module.skill, module])) as Record<TrackedSkill, (typeof learningModules)[number]>;
  }, []);

  const recommendedHref = getSkillHref(metrics.recommended.skill, levelPrefix, locale);

  const reasonFor = (row: SkillRow) => {
    if (row.attempts === 0) return copy.reasons.notTried;
    if (row.accuracy < 70) return copy.reasons.lowAccuracy;
    return copy.reasons.keepWarm;
  };

  if (!isLoggedIn) {
    return (
      <section className="mt-6 surface-panel reveal-up rounded-[2rem] p-6 sm:p-8">
        <h2 className="font-display mt-1 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">{copy.loginTitle}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">{copy.loginBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/login?lang=${locale}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]">
            {copy.loginCta}
            <ArrowRight className="size-4" />
          </Link>
          <Link href={`/register?lang=${locale}`} className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]">
            {copy.registerCta}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-5 reveal-up">
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              {copy.welcome}, {displayName}
            </h2>          </div>
          <LanguageSwitcher locale={locale} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{copy.continueTitle}</p>
            <p className="mt-2 text-xl font-semibold text-[var(--ink)]">{skillLabel[locale][metrics.recommended.skill]}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{copy.continueBody}</p>
            <Link href={recommendedHref} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]">
              {copy.openTask}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{copy.atGlanceTitle}</p>
            <div className="mt-3 grid gap-2">
              <p className="text-sm text-[var(--ink-soft)]">{copy.todayTasks}: <span className="font-semibold text-[var(--ink)]">3</span></p>
              <p className="text-sm text-[var(--ink-soft)]">{copy.doneTasks}: <span className="font-semibold text-[var(--ink)]">{metrics.totalCompleted}</span></p>
              <p className="text-sm text-[var(--ink-soft)]">{copy.currentStage}: <span className="font-semibold text-[var(--ink)]">{getStage(levelPrefix, locale)} ({levelPrefix})</span></p>
            </div>
            <Link href={`/schedule?lang=${locale}`} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]">
              Schedule
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </article>

      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <h3 className="font-display text-3xl tracking-tight text-[var(--ink)]">{copy.todayPlanTitle}</h3>
        <div className="mt-4 grid gap-3">
          {metrics.plan.map((row) => {
            const href = getSkillHref(row.skill, levelPrefix, locale);
            const skillModule = skillMeta[row.skill];
            return (
              <div key={row.skill} className="grid gap-3 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{skillLabel[locale][row.skill]}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.duration}: {skillModule.minutes}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.action}: {reasonFor(row)}</p>
                </div>
                <Link href={href} className="inline-flex items-center justify-center rounded-full border border-[rgba(20,50,75,0.16)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]">
                  {copy.openTask}
                </Link>
              </div>
            );
          })}
        </div>
      </article>

      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <h3 className="font-display text-3xl tracking-tight text-[var(--ink)]">{copy.quickEntryTitle}</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.rows.map((row) => {
            const Icon = skillIcons[row.skill];
            const href = getSkillHref(row.skill, levelPrefix, locale);
            return (
              <Link
                key={row.skill}
                href={href}
                className="inline-flex items-center justify-between rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="size-4" />
                  {skillLabel[locale][row.skill]}
                </span>
                <span>{copy.openModule}</span>
              </Link>
            );
          })}
        </div>
      </article>
    </section>
  );
}
