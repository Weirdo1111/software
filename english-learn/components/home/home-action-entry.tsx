"use client";

import Link from "next/link";
import { ArrowRight, Settings, X, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale } from "@/lib/i18n/dictionaries";
import {
  createEmptyLearningTrackerSnapshot,
  loadLearningTrackerSnapshotFromStorage,
  subscribeLearningTracker,
} from "@/lib/learning-tracker";
import {
  generateWeeklySchedule,
  loadSchedulePreferencesFromStorage,
  saveSchedulePreferencesToStorage,
  subscribeSchedulePreferences,
  type ScheduleGoal,
  type ScheduleMode,
  type StudyWindow,
} from "@/lib/schedule";

function normalizeLevel(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(next)) return next;
  return "A2";
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

function pressureColor(pressure: number) {
  if (pressure <= 35) return "bg-emerald-400/80";
  if (pressure <= 55) return "bg-amber-400/80";
  if (pressure <= 72) return "bg-orange-400/80";
  return "bg-red-400/80";
}

function pressureBorder(pressure: number) {
  if (pressure <= 35) return "border-emerald-300/60";
  if (pressure <= 55) return "border-amber-300/60";
  if (pressure <= 72) return "border-orange-300/60";
  return "border-red-300/60";
}

const blockTypeBadge = {
  anchor: "bg-[rgba(20,50,75,0.10)] text-[var(--ink)]",
  support: "bg-[rgba(20,50,75,0.06)] text-[var(--ink-soft)]",
  memory: "bg-violet-50 text-violet-700",
} as const;

const skillLabelMap: Record<string, { en: string; zh: string }> = {
  listening: { en: "Listening", zh: "听力" },
  speaking: { en: "Speaking", zh: "口语" },
  reading: { en: "Reading", zh: "阅读" },
  writing: { en: "Writing", zh: "写作" },
  review: { en: "Review", zh: "复习" },
};

const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_ZH = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export function HomeActionEntry({ locale }: { locale: Locale }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("Learner");
  const [levelPrefix, setLevelPrefix] = useState("A2");
  const [snapshot, setSnapshot] = useState(() => createEmptyLearningTrackerSnapshot());
  const [preferences, setPreferences] = useState(() => loadSchedulePreferencesFromStorage(locale));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const copy =
    locale === "zh"
      ? {
          welcome: "欢迎回来",
          loginTitle: "请先登录",
          loginBody: "登录后会显示每日学习计划、本周日历和设置入口。",
          loginCta: "去登录",
          registerCta: "注册",
          currentStage: "当前阶段",
          todayPlanTitle: "Today's plan",
          settingsTitle: "计划设置",
          settingsClose: "关闭",
          goalLabel: "学习目标",
          goals: { coursework: "课程作业", research: "学术研究", seminar: "研讨课" },
          minutesLabel: "每日时长",
          minutesSuffix: "分钟",
          modeLabel: "学习强度",
          modes: { light: "轻松", standard: "标准", intensive: "强化" },
          windowLabel: "学习时段",
          windows: { early: "早晨", midday: "中午", evening: "晚上" },
          fullSchedule: "查看完整计划",
          blockType: { anchor: "核心", support: "辅助", memory: "复习" },
          startTask: "开始",
          weekTitle: "本周安排",
          noBlocks: "今日无任务",
          deadlineLabel: "截止",
          minuteShort: "分",
          atGlanceCompleted: "已完成",
        }
      : {
          welcome: "Welcome back",
          loginTitle: "Please sign in first",
          loginBody: "After sign-in you'll see your daily plan, this-week calendar, and schedule settings.",
          loginCta: "Go to login",
          registerCta: "Register",
          currentStage: "Current stage",
          todayPlanTitle: "Today's plan",
          settingsTitle: "Schedule settings",
          settingsClose: "Close",
          goalLabel: "Learning goal",
          goals: { coursework: "Coursework", research: "Research", seminar: "Seminar" },
          minutesLabel: "Daily time",
          minutesSuffix: "min",
          modeLabel: "Intensity",
          modes: { light: "Light", standard: "Standard", intensive: "Intensive" },
          windowLabel: "Study window",
          windows: { early: "Morning", midday: "Midday", evening: "Evening" },
          fullSchedule: "Full schedule",
          blockType: { anchor: "Anchor", support: "Support", memory: "Memory" },
          startTask: "Start",
          weekTitle: "This week",
          noBlocks: "No tasks today",
          deadlineLabel: "Due",
          minuteShort: "min",
          atGlanceCompleted: "Completed",
        };

  useEffect(() => {
    const refresh = () => {
      setIsLoggedIn(window.localStorage.getItem("demo_logged_in") === "true");
      setDisplayName(toDisplayName(window.localStorage.getItem("demo_user")));
      setLevelPrefix(normalizeLevel(window.localStorage.getItem("demo_level")));
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
      setPreferences(loadSchedulePreferencesFromStorage(locale));
    };

    refresh();
    const unsubTracker = subscribeLearningTracker(refresh);
    const unsubPrefs = subscribeSchedulePreferences(refresh);

    window.addEventListener("storage", refresh);
    window.addEventListener("demo-auth-changed", refresh as EventListener);
    window.addEventListener("demo-placement-changed", refresh as EventListener);

    return () => {
      unsubTracker();
      unsubPrefs();
      window.removeEventListener("storage", refresh);
      window.removeEventListener("demo-auth-changed", refresh as EventListener);
      window.removeEventListener("demo-placement-changed", refresh as EventListener);
    };
  }, [locale]);

  const weeklySchedule = useMemo(() => {
    return generateWeeklySchedule({
      preferences,
      snapshot,
      reviewDue: 0,
      locale,
      level: levelPrefix,
    });
  }, [preferences, snapshot, locale, levelPrefix]);

  const todayPlan = weeklySchedule.days.find((d) => d.isToday) ?? weeklySchedule.days[0];

  const updatePrefs = (partial: Partial<typeof preferences>) => {
    const updated = saveSchedulePreferencesToStorage({ ...preferences, ...partial });
    setPreferences(updated);
  };

  const totalCompleted = useMemo(() => {
    return Object.values(snapshot.skills).reduce((sum, s) => sum + s.completed, 0);
  }, [snapshot]);

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
      {/* Welcome strip */}
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              {copy.welcome}, {displayName}
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {getStage(levelPrefix, locale)} · {levelPrefix} · {copy.atGlanceCompleted}: {totalCompleted}
            </p>
          </div>
          <LanguageSwitcher locale={locale} />
        </div>
      </article>

      {/* Today's Plan */}
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-3xl tracking-tight text-[var(--ink)]">{copy.todayPlanTitle}</h3>
          <div className="flex items-center gap-2">
            <Link
              href={`/schedule?lang=${locale}`}
              className="text-xs font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
            >
              {copy.fullSchedule} →
            </Link>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="flex size-8 items-center justify-center rounded-full border border-[rgba(20,50,75,0.14)] bg-white/80 text-[var(--ink-soft)] transition hover:bg-[rgba(20,50,75,0.08)] hover:text-[var(--ink)]"
              aria-label={copy.settingsTitle}
            >
              {settingsOpen ? <X className="size-4" /> : <Settings className="size-4" />}
            </button>
          </div>
        </div>

        {/* Settings drawer */}
        {settingsOpen && (
          <div className="mt-4 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.92)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.settingsTitle}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Goal */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-[var(--ink-soft)]">{copy.goalLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["coursework", "research", "seminar"] as ScheduleGoal[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => updatePrefs({ goal: g })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        preferences.goal === g
                          ? "bg-[var(--navy)] text-[#f7efe3]"
                          : "border border-[rgba(20,50,75,0.14)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.08)]"
                      }`}
                    >
                      {copy.goals[g]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily minutes */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-[var(--ink-soft)]">{copy.minutesLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  {([20, 35, 50] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => updatePrefs({ dailyMinutes: m })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        preferences.dailyMinutes === m
                          ? "bg-[var(--navy)] text-[#f7efe3]"
                          : "border border-[rgba(20,50,75,0.14)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.08)]"
                      }`}
                    >
                      {m} {copy.minutesSuffix}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-[var(--ink-soft)]">{copy.modeLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["light", "standard", "intensive"] as ScheduleMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => updatePrefs({ mode: m })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        preferences.mode === m
                          ? "bg-[var(--navy)] text-[#f7efe3]"
                          : "border border-[rgba(20,50,75,0.14)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.08)]"
                      }`}
                    >
                      {copy.modes[m]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study window */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-[var(--ink-soft)]">{copy.windowLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["early", "midday", "evening"] as StudyWindow[]).map((w) => (
                    <button
                      key={w}
                      onClick={() => updatePrefs({ studyWindow: w })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        preferences.studyWindow === w
                          ? "bg-[var(--navy)] text-[#f7efe3]"
                          : "border border-[rgba(20,50,75,0.14)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.08)]"
                      }`}
                    >
                      {copy.windows[w]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Link to full schedule setup */}
            <div className="mt-4 border-t border-[rgba(20,50,75,0.08)] pt-4">
              <Link
                href={`/schedule?lang=${locale}`}
                className="inline-flex w-full items-center justify-between rounded-[0.9rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(20,50,75,0.04)] px-4 py-3 text-sm font-semibold text-(--ink) transition hover:bg-[rgba(20,50,75,0.09)]"
              >
                <span>{locale === "zh" ? "📅 完善课程表 & 截止任务" : "📅 Set up classes & deadlines"}</span>
                <ArrowRight className="size-4 text-(--ink-soft)" />
              </Link>
              <p className="mt-1.5 text-[11px] text-[var(--ink-soft)]">
                {locale === "zh"
                  ? "录入你的课程安排和截止任务，计划会更精准。"
                  : "Add your classes and deadlines for a more accurate plan."}
              </p>
            </div>
          </div>
        )}

        {/* Today's blocks */}
        <div className="mt-4 grid gap-3">
          {todayPlan.blocks.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">{copy.noBlocks}</p>
          ) : (
            todayPlan.blocks.map((block) => (
              <div
                key={block.id}
                className="grid gap-3 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${blockTypeBadge[block.type]}`}>
                      {copy.blockType[block.type]}
                    </span>
                    <p className="text-sm font-semibold text-[var(--ink)]">{block.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
                    {skillLabelMap[block.skill]?.[locale] ?? block.skill} · {block.minutes} {copy.minuteShort} · {block.timeLabel.split("/")[0]?.trim()}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{block.reason}</p>
                </div>
                {block.skill !== "review" && (
                  <Link
                    href={block.href}
                    className="inline-flex items-center justify-center gap-1 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/90 px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]"
                  >
                    {copy.startTask}
                    <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </article>

      {/* This Week calendar strip */}
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <h3 className="font-display text-3xl tracking-tight text-[var(--ink)]">{copy.weekTitle}</h3>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {weeklySchedule.days.map((day) => {
            const dayNames = locale === "zh" ? DAY_NAMES_ZH : DAY_NAMES_EN;
            const label = dayNames[day.day];
            const isExpanded = expandedDay === day.dateISO;
            const isToday = day.isToday;
            const hasDeadline = day.deadlines.length > 0;

            return (
              <div key={day.dateISO} className="flex flex-col gap-1">
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day.dateISO)}
                  className={`relative flex flex-col items-center rounded-[0.8rem] border px-1 py-2 transition ${
                    isToday
                      ? "border-[var(--navy)] bg-[rgba(20,50,75,0.08)]"
                      : `border-[rgba(20,50,75,0.10)] bg-white/70 hover:bg-[rgba(20,50,75,0.05)]`
                  }`}
                >
                  <span className={`text-[10px] font-semibold ${isToday ? "text-[var(--navy)]" : "text-[var(--ink-soft)]"}`}>
                    {label}
                  </span>
                  <span
                    className={`mt-1.5 flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${pressureColor(day.pressure)}`}
                    title={`Pressure: ${day.pressure}`}
                  />
                  {hasDeadline && (
                    <span className="absolute right-1 top-1 size-1.5 rounded-full bg-red-500" title={copy.deadlineLabel} />
                  )}
                  <span className="mt-1 text-[9px] text-[var(--ink-soft)]">{day.targetMinutes}{copy.minuteShort}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Expanded day blocks */}
        {expandedDay && (() => {
          const day = weeklySchedule.days.find((d) => d.dateISO === expandedDay);
          if (!day) return null;
          const dayNames = locale === "zh" ? DAY_NAMES_ZH : DAY_NAMES_EN;
          return (
            <div className="mt-4 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.88)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {dayNames[day.day]} · {day.dateISO}
                </p>
                {day.deadlines.length > 0 && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                    {copy.deadlineLabel}: {day.deadlines.map((d) => d.title).join(", ")}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                {day.blocks.map((block) => (
                  <div key={block.id} className="flex items-center gap-3">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${blockTypeBadge[block.type]}`}>
                      {copy.blockType[block.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-[var(--ink)]">{block.title}</span>
                      <span className="ml-2 text-[10px] text-[var(--ink-soft)]">{block.minutes}{copy.minuteShort}</span>
                    </div>
                    {block.skill !== "review" && (
                      <Link
                        href={block.href}
                        className="shrink-0 text-[10px] font-semibold text-[var(--navy)] hover:underline"
                      >
                        {copy.startTask} →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </article>
    </section>
  );
}
