"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, Headphones, Mic, PenTool } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";

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
  correct: number;
  completed: number;
  minutes: number;
  accuracy: number;
  lastUpdatedAt: string | null;
};

const skillLabel = {
  zh: {
    listening: "听力",
    speaking: "口语",
    reading: "阅读",
    writing: "写作",
  },
  en: {
    listening: "Listening",
    speaking: "Speaking",
    reading: "Reading",
    writing: "Writing",
  },
} as const;

const skillDescriptor = {
  zh: {
    listening: "捕捉课堂关键信息",
    speaking: "强化表达与互动回应",
    reading: "提升学术文本理解",
    writing: "打磨结构与表达准确性",
  },
  en: {
    listening: "Capture key lecture cues",
    speaking: "Strengthen response fluency",
    reading: "Build academic text clarity",
    writing: "Sharpen structure and precision",
  },
} as const;

const skillVisual = {
  listening: {
    Icon: Headphones,
    card: "bg-[linear-gradient(160deg,rgba(227,242,255,0.78),rgba(255,255,255,0.86))]",
    icon: "bg-[#2d6fbc] text-white",
    badge: "bg-[#d9ebff] text-[#1e4f8e]",
    track: "bg-[#d7e8fb]",
    from: "#2d6fbc",
    to: "#49a3ff",
    texture: "bg-[radial-gradient(circle_at_85%_12%,rgba(45,111,188,0.22),transparent_42%)]",
  },
  speaking: {
    Icon: Mic,
    card: "bg-[linear-gradient(160deg,rgba(255,239,225,0.74),rgba(255,255,255,0.86))]",
    icon: "bg-[#c76a2a] text-white",
    badge: "bg-[#ffe6d2] text-[#9e4f1f]",
    track: "bg-[#f4dfcf]",
    from: "#c76a2a",
    to: "#f29a58",
    texture: "bg-[radial-gradient(circle_at_82%_18%,rgba(199,106,42,0.2),transparent_42%)]",
  },
  reading: {
    Icon: BookOpenText,
    card: "bg-[linear-gradient(160deg,rgba(230,247,238,0.76),rgba(255,255,255,0.86))]",
    icon: "bg-[#2f7a5e] text-white",
    badge: "bg-[#dbf2e6] text-[#215845]",
    track: "bg-[#d7ecdf]",
    from: "#2f7a5e",
    to: "#4bb88c",
    texture: "bg-[radial-gradient(circle_at_82%_18%,rgba(47,122,94,0.2),transparent_42%)]",
  },
  writing: {
    Icon: PenTool,
    card: "bg-[linear-gradient(160deg,rgba(255,235,228,0.76),rgba(255,255,255,0.86))]",
    icon: "bg-[#b55547] text-white",
    badge: "bg-[#ffe0da] text-[#873b2f]",
    track: "bg-[#f3d9d4]",
    from: "#b55547",
    to: "#e68979",
    texture: "bg-[radial-gradient(circle_at_82%_18%,rgba(181,85,71,0.2),transparent_42%)]",
  },
} as const;

function normalizeLevel(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(next)) return next;
  return "A2";
}

function deriveStage(level: string) {
  if (level === "A1" || level === "A2") return "Foundation";
  if (level === "B1" || level === "B2") return "Developing";
  return "Advanced";
}

function getSkillAccuracy(correct: number, attempts: number) {
  if (attempts <= 0) return 0;
  return Math.round((correct / attempts) * 100);
}

function getSkillHref(skill: TrackedSkill, level: string, locale: Locale) {
  if (skill === "reading") return `/reading?lang=${locale}`;
  return `/lesson/${level}-${skill}-starter?lang=${locale}`;
}

function formatRecentTime(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatLastTask(value: string | null, locale: Locale) {
  if (!value) return locale === "zh" ? "无" : "none";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return locale === "zh" ? "无" : "none";

  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return locale === "zh" ? "今天" : "today";
  if (diffDays === 1) return locale === "zh" ? "1 天前" : "1 day ago";
  return locale === "zh" ? `${diffDays} 天前` : `${diffDays} days ago`;
}

function getSkillState(accuracy: number, attempts: number, locale: Locale) {
  if (attempts === 0) return locale === "zh" ? "起步阶段" : "Starter";
  if (accuracy < 60) return locale === "zh" ? "需加强" : "Needs support";
  if (accuracy < 80) return locale === "zh" ? "提升中" : "Building";
  return locale === "zh" ? "状态稳定" : "Strong";
}

export function DashboardOverview({ locale }: { locale: Locale }) {
  const [levelPrefix, setLevelPrefix] = useState("A2");
  const [snapshot, setSnapshot] = useState(() => createEmptyLearningTrackerSnapshot());

  const copy =
    locale === "zh"
      ? {
          topTitle: "概览",
          currentStage: "Current stage",
          overallAccuracy: "Overall accuracy",
          completedTasks: "Completed tasks",
          reassessmentStatus: "Reassessment status",
          secondTitle: "技能状态",
          secondSubtitle: "跟踪听、说、读、写四项能力的平衡进展。",
          thirdTitle: "推荐任务",
          nextTask: "Next recommended task",
          reason: "Reason",
          openModule: "Open module",
          fourthTitle: "最近活动",
          lastTask: "Last completed task",
          recentScore: "Recent score",
          studyTime: "Study time",
          statusReady: "Ready",
          statusInProgress: "In progress",
          statusNotReady: "Not ready",
          reasonUntouched: "This skill has no attempts yet. Start here first.",
          reasonWeak: "This skill has the lowest accuracy and needs reinforcement.",
          reasonKeep: "Keep this skill active to maintain four-skill balance.",
          noActivity: "No recent activity yet",
          completed: "已完成",
          attempts: "尝试次数",
          lastActivity: "最近活动",
          lastTaskAt: "最近任务",
          lastScore: "最近得分",
          active: "活跃",
          none: "无",
        }
      : {
          topTitle: "Overview",
          currentStage: "Current stage",
          overallAccuracy: "Overall accuracy",
          completedTasks: "Completed tasks",
          reassessmentStatus: "Reassessment status",
          secondTitle: "Skill Status",
          secondSubtitle: "Track balance across listening, speaking, reading, and writing.",
          thirdTitle: "Recommendation",
          nextTask: "Next recommended task",
          reason: "Reason",
          openModule: "Open module",
          fourthTitle: "Recent Activity",
          lastTask: "Last completed task",
          recentScore: "Recent score",
          studyTime: "Study time",
          statusReady: "Ready",
          statusInProgress: "In progress",
          statusNotReady: "Not ready",
          reasonUntouched: "This skill has no attempts yet. Start here first.",
          reasonWeak: "This skill has the lowest accuracy and needs reinforcement.",
          reasonKeep: "Keep this skill active to maintain four-skill balance.",
          noActivity: "No recent activity yet",
          completed: "completed",
          attempts: "attempts",
          lastActivity: "Last activity",
          lastTaskAt: "Last task",
          lastScore: "Last score",
          active: "active",
          none: "none",
        };

  useEffect(() => {
    const refresh = () => {
      setLevelPrefix(normalizeLevel(window.localStorage.getItem("demo_level")));
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
    };

    refresh();
    const unsubscribe = subscribeLearningTracker(refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("demo-placement-changed", refresh as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", refresh);
      window.removeEventListener("demo-placement-changed", refresh as EventListener);
    };
  }, []);

  const computed = useMemo(() => {
    const skills: TrackedSkill[] = ["listening", "speaking", "reading", "writing"];

    const rows: SkillRow[] = skills.map((skill) => {
      const row = snapshot.skills[skill];
      return {
        skill,
        attempts: row.attempts,
        correct: row.correct,
        completed: row.completed,
        minutes: row.minutes,
        accuracy: getSkillAccuracy(row.correct, row.attempts),
        lastUpdatedAt: row.lastUpdatedAt,
      };
    });

    const totalAttempts = rows.reduce((sum, row) => sum + row.attempts, 0);
    const totalCorrect = rows.reduce((sum, row) => sum + row.correct, 0);
    const totalCompleted = rows.reduce((sum, row) => sum + row.completed, 0);
    const totalMinutes = Number(rows.reduce((sum, row) => sum + row.minutes, 0).toFixed(1));
    const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    const untouched = rows.filter((row) => row.attempts === 0);
    const attempted = rows.filter((row) => row.attempts > 0).sort((a, b) => a.accuracy - b.accuracy);
    const recommended = untouched[0] ?? attempted[0] ?? rows[0];

    const reason =
      recommended.attempts === 0
        ? copy.reasonUntouched
        : recommended.accuracy < 70
          ? copy.reasonWeak
          : copy.reasonKeep;

    const reassessmentStatus =
      totalAttempts >= 12 && overallAccuracy >= 70
        ? copy.statusReady
        : totalAttempts >= 6
          ? copy.statusInProgress
          : copy.statusNotReady;

    const latest = rows
      .filter((row) => row.lastUpdatedAt)
      .sort((a, b) => new Date(b.lastUpdatedAt ?? 0).getTime() - new Date(a.lastUpdatedAt ?? 0).getTime())[0];

    return {
      rows,
      overallAccuracy,
      totalCompleted,
      totalMinutes,
      reassessmentStatus,
      recommended,
      reason,
      latest,
    };
  }, [snapshot, copy.reasonKeep, copy.reasonUntouched, copy.reasonWeak, copy.statusInProgress, copy.statusNotReady, copy.statusReady]);

  const stage = deriveStage(levelPrefix);
  const recommendedHref = getSkillHref(computed.recommended.skill, levelPrefix, locale);

  return (
    <section className="space-y-5">
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6 reveal-up">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-label">{copy.topTitle}</h2>
          <LanguageSwitcher locale={locale} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_10px_20px_rgba(20,50,75,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.currentStage}</p>
            <p className="mt-2 text-xl font-semibold text-[var(--ink)]">{stage} ({levelPrefix})</p>
          </div>
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_10px_20px_rgba(20,50,75,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.overallAccuracy}</p>
            <p className="mt-2 text-xl font-semibold text-[var(--ink)]">{computed.overallAccuracy}%</p>
          </div>
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_10px_20px_rgba(20,50,75,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.completedTasks}</p>
            <p className="mt-2 text-xl font-semibold text-[var(--ink)]">{computed.totalCompleted}</p>
          </div>
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_10px_20px_rgba(20,50,75,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.reassessmentStatus}</p>
            <p className="mt-2 text-xl font-semibold text-[var(--ink)]">{computed.reassessmentStatus}</p>
          </div>
        </div>
      </article>

      <article className="surface-panel rounded-[1.8rem] border-[rgba(20,50,75,0.08)] shadow-[0_14px_30px_rgba(20,50,75,0.05)] p-5 sm:p-6 reveal-up">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-label">{copy.secondTitle}</h2>
          <p className="text-sm text-[var(--ink-soft)]">{copy.secondSubtitle}</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {computed.rows.map((row) => {
            const visual = skillVisual[row.skill];
            const Icon = visual.Icon;
            const stateLabel = getSkillState(row.accuracy, row.attempts, locale);

            return (
              <div
                key={row.skill}
                className={`relative overflow-hidden rounded-[1.2rem] border border-[rgba(20,50,75,0.18)] p-4 shadow-[0_18px_34px_rgba(20,50,75,0.14)] transition duration-300 hover:translate-y-[-2px] hover:shadow-[0_22px_40px_rgba(20,50,75,0.18)] ${visual.card}`}
              >
                <div className={`pointer-events-none absolute inset-0 opacity-55 ${visual.texture}`} />
                <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-white/55 bg-white/25" />
                <div className="pointer-events-none absolute -left-8 bottom-[-2.2rem] h-20 w-24 rotate-[-18deg] rounded-3xl border border-white/45 bg-white/18" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2">
                      <span className={`inline-flex size-9 items-center justify-center rounded-xl shadow-[0_8px_16px_rgba(20,50,75,0.18)] ${visual.icon}`}>
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-[var(--ink)]">{skillLabel[locale][row.skill]}</p>
                        <p className="text-xs text-[var(--ink-soft)]">{skillDescriptor[locale][row.skill]}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[var(--ink-soft)]">{row.accuracy}%</p>
                  </div>

                  <div className={`relative mt-3 h-2.5 overflow-hidden rounded-full ${visual.track}`}>
                    <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(90deg, ${visual.from}, ${visual.to})` }} />
                    <div
                      className="h-full rounded-full progress-stripe"
                      style={{ width: `${row.accuracy}%`, background: `linear-gradient(90deg, ${visual.from}, ${visual.to})` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center rounded-full border border-white/55 bg-white/58 px-2.5 py-1 text-[var(--ink-soft)]">
                      {row.completed} {copy.completed}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/55 bg-white/58 px-2.5 py-1 text-[var(--ink-soft)]">
                      {row.attempts} {copy.attempts}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${visual.badge}`}>{stateLabel}</span>
                  </div>

                  <div className="mt-3 border-t border-white/55 pt-3 text-xs text-[var(--ink-soft)]">
                    <p>
                      <span className="font-semibold text-[var(--ink)]">{copy.lastActivity}: </span>
                      {row.lastUpdatedAt ? copy.active : copy.none}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-[var(--ink)]">{copy.lastTaskAt}: </span>
                      {formatLastTask(row.lastUpdatedAt, locale)}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-[var(--ink)]">{copy.lastScore}: </span>
                      {row.attempts > 0 ? `${row.accuracy}%` : copy.none}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </article>

      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6 reveal-up">
        <h2 className="section-label">{copy.thirdTitle}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative overflow-hidden rounded-[1.2rem] border border-[rgba(28,78,149,0.26)] bg-[linear-gradient(140deg,rgba(235,244,255,0.92),rgba(255,248,236,0.9))] p-4 shadow-[0_18px_34px_rgba(28,78,149,0.14)]">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[linear-gradient(180deg,#2d6fbc,#49a3ff)]" />
            <p className="pl-2 text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.nextTask}</p>
            <p className="mt-2 pl-2 text-xl font-semibold text-[var(--ink)]">{skillLabel[locale][computed.recommended.skill]}</p>
            <p className="mt-3 pl-2 text-sm leading-7 text-[var(--ink-soft)]">
              <span className="font-semibold text-[var(--ink)]">{copy.reason}: </span>
              {computed.reason}
            </p>
          </div>
          <Link
            href={recommendedHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#1c4e95,#2d6fbc)] px-5 py-3 text-sm font-semibold text-[#f7efe3] shadow-[0_12px_24px_rgba(28,78,149,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_30px_rgba(28,78,149,0.34)]"
          >
            {copy.openModule}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>

      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6 reveal-up">
        <h2 className="section-label">{copy.fourthTitle}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.lastTask}</p>
            <p className="mt-2 text-base font-semibold text-[var(--ink)]">
              {computed.latest ? `${skillLabel[locale][computed.latest.skill]} module task` : copy.noActivity}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{computed.latest ? formatRecentTime(computed.latest.lastUpdatedAt) : "-"}</p>
          </div>
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.recentScore}</p>
            <p className="mt-2 text-base font-semibold text-[var(--ink)]">{computed.latest ? `${computed.latest.accuracy}%` : "-"}</p>
          </div>
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.studyTime}</p>
            <p className="mt-2 text-base font-semibold text-[var(--ink)]">{computed.totalMinutes} min</p>
          </div>
        </div>
      </article>
    </section>
  );
}













