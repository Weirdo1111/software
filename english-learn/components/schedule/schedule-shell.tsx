"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Headphones,
  Mic,
  PenTool,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale } from "@/lib/i18n/dictionaries";
import {
  createEmptyLearningTrackerSnapshot,
  loadLearningTrackerSnapshotFromStorage,
  subscribeLearningTracker,
  type TrackedSkill,
} from "@/lib/learning-tracker";
import {
  createDefaultSchedulePreferences,
  createScheduleClassSession,
  createScheduleDeadline,
  generateWeeklySchedule,
  loadSchedulePreferencesFromStorage,
  saveSchedulePreferencesToStorage,
  subscribeSchedulePreferences,
  type ScheduleClassType,
  type ScheduleDeadline,
  type SchedulePreferences,
  type StudyWindow,
} from "@/lib/schedule";

const skillMeta = {
  listening: {
    label: { zh: "Listening", en: "Listening" },
    Icon: Headphones,
    badge: "bg-[#dfeeff] text-[#1c4e95]",
  },
  speaking: {
    label: { zh: "Speaking", en: "Speaking" },
    Icon: Mic,
    badge: "bg-[#ffe8d8] text-[#9e4f1f]",
  },
  reading: {
    label: { zh: "Reading", en: "Reading" },
    Icon: BookOpenText,
    badge: "bg-[#e3f4eb] text-[#1f5b47]",
  },
  writing: {
    label: { zh: "Writing", en: "Writing" },
    Icon: PenTool,
    badge: "bg-[#fde4de] text-[#924134]",
  },
  review: {
    label: { zh: "Review", en: "Review" },
    Icon: BrainCircuit,
    badge: "bg-[#ece6ff] text-[#4d3270]",
  },
} as const;

const goalOptions = [
  { value: "coursework", label: { zh: "Coursework", en: "Coursework" } },
  { value: "research", label: { zh: "Research", en: "Research" } },
  { value: "seminar", label: { zh: "Seminar", en: "Seminar" } },
] as const;

const modeOptions = [
  { value: "light", label: { zh: "Light", en: "Light" } },
  { value: "standard", label: { zh: "Standard", en: "Standard" } },
  { value: "intensive", label: { zh: "Intensive", en: "Intensive" } },
] as const;

const minuteOptions = [20, 35, 50] as const;

const windowOptions = [
  { value: "early", label: { zh: "Morning", en: "Morning" } },
  { value: "midday", label: { zh: "Midday", en: "Midday" } },
  { value: "evening", label: { zh: "Evening", en: "Evening" } },
] as const;

const classTypeOptions = [
  { value: "lecture", label: { zh: "Lecture", en: "Lecture" } },
  { value: "seminar", label: { zh: "Seminar", en: "Seminar" } },
  { value: "lab", label: { zh: "Lab", en: "Lab" } },
] as const;

const dayIndexes = [0, 1, 2, 3, 4, 5, 6] as const;

function normalizeLevel(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(next)) return next;
  return "A2";
}

function formatDisplayDate(dateISO: string, locale: Locale, options: Intl.DateTimeFormatOptions) {
  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", options);
  return formatter.format(new Date(`${dateISO}T00:00:00`));
}

function getPressureStyle(pressure: number) {
  if (pressure >= 78) return "border-[#efb8ad] bg-[#fff4f1] text-[#b55547]";
  if (pressure >= 60) return "border-[#e9c98d] bg-[#fff7ea] text-[#916129]";
  return "border-[#b8d4c8] bg-[#eef8f2] text-[#255948]";
}

function getBlockSurface(type: "anchor" | "support" | "memory") {
  if (type === "anchor") return "border-[rgba(28,78,149,0.16)] bg-[linear-gradient(160deg,rgba(227,242,255,0.84),rgba(255,255,255,0.9))]";
  if (type === "support") return "border-[rgba(42,105,88,0.16)] bg-[linear-gradient(160deg,rgba(232,246,239,0.84),rgba(255,255,255,0.9))]";
  return "border-[rgba(109,84,156,0.16)] bg-[linear-gradient(160deg,rgba(242,237,255,0.84),rgba(255,255,255,0.9))]";
}

function getDefaultDeadlineDate() {
  const next = new Date();
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + 3);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
}

function dayLabel(day: number, locale: Locale) {
  const labels =
    locale === "zh"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return labels[day] ?? labels[0];
}

function segmentClass(active: boolean) {
  return `rounded-[1rem] border px-4 py-3 text-sm font-semibold transition ${
    active
      ? "border-[rgba(28,78,149,0.22)] bg-[rgba(28,78,149,0.09)] text-[var(--navy)] shadow-[0_12px_24px_rgba(28,78,149,0.08)]"
      : "border-[rgba(20,50,75,0.12)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.05)]"
  }`;
}

function chipClass(active: boolean) {
  return `rounded-full border px-4 py-2 text-sm font-semibold transition ${
    active
      ? "border-[var(--navy)] bg-[var(--navy)] text-[#f7efe3]"
      : "border-[rgba(20,50,75,0.12)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.05)]"
  }`;
}

const inputClassName =
  "w-full rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-white/90 px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[rgba(28,78,149,0.28)] focus:ring-2 focus:ring-[rgba(28,78,149,0.08)]";

export function ScheduleShell({ locale }: { locale: Locale }) {
  const [level, setLevel] = useState("A2");
  const [reviewDue, setReviewDue] = useState(0);
  const [snapshot, setSnapshot] = useState(() => createEmptyLearningTrackerSnapshot());
  const [preferences, setPreferences] = useState<SchedulePreferences>(() => createDefaultSchedulePreferences());
  const [selectedDate, setSelectedDate] = useState("");
  const [classDraft, setClassDraft] = useState({
    title: "",
    day: 0,
    type: "lecture" as ScheduleClassType,
    time: "09:00",
  });
  const [deadlineDraft, setDeadlineDraft] = useState({
    title: "",
    dueDate: getDefaultDeadlineDate(),
    skill: "writing" as TrackedSkill,
  });

  const copy =
    locale === "zh"
      ? {
          title: "Academic Rhythm",
          subtitle: "Bring lectures, seminars, review, and coursework into one weekly system.",
          weekMode: "Week mode",
          shockIndex: "Shock index",
          target: "Weekly target",
          focusLane: "Focus lane",
          todayTitle: "Today Focus",
          weekTitle: "Week Rhythm",
          studioTitle: "Plan Studio",
          studioHint: "Browser sync",
          classesTitle: "Class sessions",
          deadlinesTitle: "Deadlines",
          add: "Add",
          remove: "Remove",
          noClasses: "No class sessions yet",
          noDeadlines: "No deadlines yet",
          classTitle: "Title",
          classTime: "Time",
          deadlineTitle: "Task",
          studyWindow: "Study window",
          dailyLoad: "Daily load",
          goal: "Goal",
          mode: "Mode",
          selectedDay: "Selected day",
          today: "Today",
          cardsDue: "cards due",
          minutes: "min",
          sessions: "Sessions",
          due: "Due",
          noDue: "No deadline",
          noSession: "No session",
          restoreDefault: "Restore demo",
          weekModeLabel: {
            normal: "Normal Week",
            "heavy-reading": "Heavy Reading",
            presentation: "Presentation Week",
            "deadline-rescue": "Deadline Rescue",
            recovery: "Recovery Week",
          },
        }
      : {
          title: "Academic Rhythm",
          subtitle: "Bring lectures, seminars, review, and coursework into one weekly system.",
          weekMode: "Week mode",
          shockIndex: "Shock index",
          target: "Weekly target",
          focusLane: "Focus lane",
          todayTitle: "Today Focus",
          weekTitle: "Week Rhythm",
          studioTitle: "Plan Studio",
          studioHint: "Browser sync",
          classesTitle: "Class sessions",
          deadlinesTitle: "Deadlines",
          add: "Add",
          remove: "Remove",
          noClasses: "No class sessions yet",
          noDeadlines: "No deadlines yet",
          classTitle: "Title",
          classTime: "Time",
          deadlineTitle: "Task",
          studyWindow: "Study window",
          dailyLoad: "Daily load",
          goal: "Goal",
          mode: "Mode",
          selectedDay: "Selected day",
          today: "Today",
          cardsDue: "cards due",
          minutes: "min",
          sessions: "Sessions",
          due: "Due",
          noDue: "No deadline",
          noSession: "No session",
          restoreDefault: "Restore demo",
          weekModeLabel: {
            normal: "Normal Week",
            "heavy-reading": "Heavy Reading",
            presentation: "Presentation Week",
            "deadline-rescue": "Deadline Rescue",
            recovery: "Recovery Week",
          },
        };

  useEffect(() => {
    const refreshProfile = () => {
      setLevel(normalizeLevel(window.localStorage.getItem("demo_level")));
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
    };

    const refreshPreferences = () => {
      setPreferences(loadSchedulePreferencesFromStorage());
    };

    refreshProfile();
    refreshPreferences();

    const unsubscribeTracker = subscribeLearningTracker(refreshProfile);
    const unsubscribePreferences = subscribeSchedulePreferences(refreshPreferences);

    window.addEventListener("storage", refreshProfile);
    window.addEventListener("demo-placement-changed", refreshProfile as EventListener);

    return () => {
      unsubscribeTracker();
      unsubscribePreferences();
      window.removeEventListener("storage", refreshProfile);
      window.removeEventListener("demo-placement-changed", refreshProfile as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReviewDue() {
      try {
        const response = await fetch("/api/review-cards?filter=due");
        const result = await response.json();
        if (!cancelled) {
          setReviewDue(Number(result?.stats?.due ?? 0));
        }
      } catch {
        if (!cancelled) {
          setReviewDue(0);
        }
      }
    }

    void loadReviewDue();

    return () => {
      cancelled = true;
    };
  }, []);

  const weeklySchedule = useMemo(() => {
    return generateWeeklySchedule({
      preferences,
      snapshot,
      reviewDue,
      locale,
      level,
    });
  }, [level, locale, preferences, reviewDue, snapshot]);

  const todaySchedule = weeklySchedule.days.find((day) => day.isToday) ?? weeklySchedule.days[0];
  const fallbackSelectedDate = todaySchedule?.dateISO ?? weeklySchedule.days[0]?.dateISO ?? "";
  const activeSelectedDate =
    selectedDate && weeklySchedule.days.some((day) => day.dateISO === selectedDate) ? selectedDate : fallbackSelectedDate;
  const selectedDay = weeklySchedule.days.find((day) => day.dateISO === activeSelectedDate) ?? todaySchedule;
  const focusLane = `${skillMeta[weeklySchedule.primarySkill].label[locale]} -> ${skillMeta[weeklySchedule.weakestSkill].label[locale]}`;

  const updatePreferences = (updater: SchedulePreferences | ((current: SchedulePreferences) => SchedulePreferences)) => {
    setPreferences((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return saveSchedulePreferencesToStorage(next);
    });
  };

  function addClassSession() {
    if (!classDraft.title.trim()) return;

    updatePreferences((current) => ({
      ...current,
      classes: [
        ...current.classes,
        createScheduleClassSession({
          title: classDraft.title.trim(),
          day: classDraft.day,
          type: classDraft.type,
          time: classDraft.time,
        }),
      ],
      updatedAt: new Date().toISOString(),
    }));

    setClassDraft((current) => ({ ...current, title: "" }));
  }

  function addDeadline() {
    if (!deadlineDraft.title.trim()) return;

    updatePreferences((current) => ({
      ...current,
      deadlines: [
        ...current.deadlines,
        createScheduleDeadline({
          title: deadlineDraft.title.trim(),
          dueDate: deadlineDraft.dueDate,
          skill: deadlineDraft.skill,
        }),
      ],
      updatedAt: new Date().toISOString(),
    }));

    setDeadlineDraft((current) => ({ ...current, title: "" }));
  }

  function removeClassSession(id: string) {
    updatePreferences((current) => ({
      ...current,
      classes: current.classes.filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  }

  function removeDeadline(id: string) {
    updatePreferences((current) => ({
      ...current,
      deadlines: current.deadlines.filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  }

  function restoreDefaults() {
    const next = saveSchedulePreferencesToStorage(createDefaultSchedulePreferences());
    setPreferences(next);
  }

  return (
    <section className="mt-6 grid gap-5 reveal-up">
      <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-label">
              <CalendarDays className="size-3.5" />
              {copy.title}
            </p>
            <h2 className="font-display mt-4 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">{copy.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">{copy.subtitle}</p>
          </div>
          <LanguageSwitcher locale={locale} />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label={copy.weekMode} value={copy.weekModeLabel[weeklySchedule.weekMode]} />
          <SummaryCard label={copy.shockIndex} value={`${weeklySchedule.shockIndex}`} />
          <SummaryCard label={copy.target} value={`${weeklySchedule.weeklyTargetMinutes} ${copy.minutes}`} />
          <SummaryCard label={copy.focusLane} value={focusLane} />
        </div>
      </article>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">
                <Sparkles className="size-3.5" />
                {copy.todayTitle}
              </p>
              <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
                {formatDisplayDate(todaySchedule.dateISO, locale, { weekday: "long", month: "short", day: "numeric" })}
              </h3>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPressureStyle(todaySchedule.pressure)}`}>
              {copy.shockIndex}: {todaySchedule.pressure}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {todaySchedule.blocks.map((block) => {
              const blockSkill = skillMeta[block.skill];
              const Icon = blockSkill.Icon;

              return (
                <Link
                  key={block.id}
                  href={block.href}
                  className={`group rounded-[1.4rem] border p-4 transition hover:translate-y-[-2px] hover:shadow-[0_18px_40px_rgba(28,78,149,0.12)] ${getBlockSurface(block.type)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        <Icon className="size-3.5" />
                        {blockSkill.label[locale]}
                      </div>
                      <h4 className="mt-3 text-lg font-semibold text-[var(--ink)]">{block.title}</h4>
                      <p className="mt-2 text-sm text-[var(--ink-soft)]">{block.reason}</p>
                    </div>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-[var(--ink-soft)] transition group-hover:translate-x-1" />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)]">{block.timeLabel}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${blockSkill.badge}`}>{block.minutes} {copy.minutes}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-label">
                <GraduationCap className="size-3.5" />
                {copy.studioTitle}
              </p>
              <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{copy.studioTitle}</h3>
            </div>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {copy.studioHint}
            </span>
          </div>

          <div className="mt-5 grid gap-5">
            <div className="grid gap-3">
              <LabelRow label={copy.goal} />
              <div className="grid gap-2 sm:grid-cols-3">
                {goalOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePreferences((current) => ({ ...current, goal: option.value, updatedAt: new Date().toISOString() }))}
                    className={segmentClass(preferences.goal === option.value)}
                  >
                    {option.label[locale]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <LabelRow label={copy.dailyLoad} />
              <div className="flex flex-wrap gap-2">
                {minuteOptions.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => updatePreferences((current) => ({ ...current, dailyMinutes: minutes, updatedAt: new Date().toISOString() }))}
                    className={chipClass(preferences.dailyMinutes === minutes)}
                  >
                    {minutes} {copy.minutes}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <LabelRow label={copy.mode} />
              <div className="grid gap-2 sm:grid-cols-3">
                {modeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePreferences((current) => ({ ...current, mode: option.value, updatedAt: new Date().toISOString() }))}
                    className={segmentClass(preferences.mode === option.value)}
                  >
                    {option.label[locale]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <LabelRow label={copy.studyWindow} />
              <div className="grid gap-2 sm:grid-cols-3">
                {windowOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updatePreferences((current) => ({
                        ...current,
                        studyWindow: option.value as StudyWindow,
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                    className={segmentClass(preferences.studyWindow === option.value)}
                  >
                    {option.label[locale]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-3 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <LabelRow label={copy.classesTitle} />
                  <button
                    type="button"
                    onClick={restoreDefaults}
                    className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.06)]"
                  >
                    {copy.restoreDefault}
                  </button>
                </div>

                <div className="grid gap-2">
                  {preferences.classes.length > 0 ? (
                    preferences.classes.map((item) => (
                      <ItemRow
                        key={item.id}
                        title={item.title}
                        subtitle={`${dayLabel(item.day, locale)} · ${item.time}`}
                        tag={classTypeOptions.find((option) => option.value === item.type)?.label[locale] ?? item.type}
                        onRemove={() => removeClassSession(item.id)}
                        removeLabel={copy.remove}
                      />
                    ))
                  ) : (
                    <EmptyHint text={copy.noClasses} />
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={classDraft.title}
                    onChange={(event) => setClassDraft((current) => ({ ...current, title: event.target.value }))}
                    placeholder={copy.classTitle}
                    className={inputClassName}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={classDraft.day}
                      onChange={(event) => setClassDraft((current) => ({ ...current, day: Number(event.target.value) }))}
                      className={inputClassName}
                    >
                      {dayIndexes.map((day) => (
                        <option key={day} value={day}>
                          {dayLabel(day, locale)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={classDraft.type}
                      onChange={(event) => setClassDraft((current) => ({ ...current, type: event.target.value as ScheduleClassType }))}
                      className={inputClassName}
                    >
                      {classTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label[locale]}
                        </option>
                      ))}
                    </select>
                    <input
                      value={classDraft.time}
                      onChange={(event) => setClassDraft((current) => ({ ...current, time: event.target.value }))}
                      placeholder={copy.classTime}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addClassSession}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
                >
                  <Plus className="size-4" />
                  {copy.add}
                </button>
              </div>

              <div className="grid gap-3 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-white/70 p-4">
                <LabelRow label={copy.deadlinesTitle} />

                <div className="grid gap-2">
                  {preferences.deadlines.length > 0 ? (
                    preferences.deadlines
                      .slice()
                      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                      .map((item) => (
                        <ItemRow
                          key={item.id}
                          title={item.title}
                          subtitle={formatDisplayDate(item.dueDate, locale, { month: "short", day: "numeric" })}
                          tag={skillMeta[item.skill].label[locale]}
                          onRemove={() => removeDeadline(item.id)}
                          removeLabel={copy.remove}
                        />
                      ))
                  ) : (
                    <EmptyHint text={copy.noDeadlines} />
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={deadlineDraft.title}
                    onChange={(event) => setDeadlineDraft((current) => ({ ...current, title: event.target.value }))}
                    placeholder={copy.deadlineTitle}
                    className={inputClassName}
                  />
                  <div className="grid grid-cols-[1.2fr_0.8fr] gap-2">
                    <input
                      type="date"
                      value={deadlineDraft.dueDate}
                      onChange={(event) => setDeadlineDraft((current) => ({ ...current, dueDate: event.target.value }))}
                      className={inputClassName}
                    />
                    <select
                      value={deadlineDraft.skill}
                      onChange={(event) => setDeadlineDraft((current) => ({ ...current, skill: event.target.value as TrackedSkill }))}
                      className={inputClassName}
                    >
                      {(["listening", "speaking", "reading", "writing"] as TrackedSkill[]).map((skill) => (
                        <option key={skill} value={skill}>
                          {skillMeta[skill].label[locale]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addDeadline}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,50,75,0.14)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.06)]"
                >
                  <CalendarClock className="size-4" />
                  {copy.add}
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">
              <CalendarDays className="size-3.5" />
              {copy.weekTitle}
            </p>
            <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{copy.selectedDay}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
              {weeklySchedule.reviewDue} {copy.cardsDue}
            </span>
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getPressureStyle(selectedDay.pressure)}`}>
              {copy.shockIndex}: {selectedDay.pressure}
            </span>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {weeklySchedule.days.map((day) => {
            const active = day.dateISO === selectedDay.dateISO;
            const weekday = formatDisplayDate(day.dateISO, locale, { weekday: "short" });
            const dayText = formatDisplayDate(day.dateISO, locale, { month: "short", day: "numeric" });

            return (
              <button
                key={day.dateISO}
                type="button"
                onClick={() => setSelectedDate(day.dateISO)}
                className={`min-w-[112px] rounded-[1.3rem] border px-4 py-3 text-left transition ${
                  active
                    ? "border-[rgba(28,78,149,0.24)] bg-[rgba(28,78,149,0.08)] shadow-[0_12px_28px_rgba(28,78,149,0.1)]"
                    : "border-[rgba(20,50,75,0.12)] bg-white/72 hover:bg-[rgba(20,50,75,0.05)]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{weekday}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{dayText}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPressureStyle(day.pressure)}`}>
                    {day.pressure}
                  </span>
                  {day.isToday ? <span className="text-xs font-semibold text-[var(--navy)]">{copy.today}</span> : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-3">
            {selectedDay.blocks.map((block) => {
              const blockSkill = skillMeta[block.skill];
              const Icon = blockSkill.Icon;

              return (
                <Link
                  key={block.id}
                  href={block.href}
                  className={`group rounded-[1.4rem] border p-4 transition hover:translate-y-[-2px] hover:shadow-[0_18px_40px_rgba(28,78,149,0.12)] ${getBlockSurface(block.type)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        <Icon className="size-3.5" />
                        {blockSkill.label[locale]}
                      </div>
                      <h4 className="mt-3 text-lg font-semibold text-[var(--ink)]">{block.title}</h4>
                      <p className="mt-2 text-sm text-[var(--ink-soft)]">{block.reason}</p>
                    </div>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-[var(--ink-soft)] transition group-hover:translate-x-1" />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)]">{block.timeLabel}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${blockSkill.badge}`}>{block.minutes} {copy.minutes}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-[rgba(20,50,75,0.12)] bg-white/78 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.sessions}</p>
                <span className="rounded-full bg-[rgba(20,50,75,0.06)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)]">
                  {selectedDay.classes.length}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                {selectedDay.classes.length > 0 ? (
                  selectedDay.classes.map((item) => (
                    <div key={item.id} className="rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,255,255,0.85)] px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--ink)]">{item.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">
                        {classTypeOptions.find((option) => option.value === item.type)?.label[locale] ?? item.type} · {item.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyHint text={copy.noSession} />
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[rgba(20,50,75,0.12)] bg-white/78 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.due}</p>
                <span className="rounded-full bg-[rgba(20,50,75,0.06)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)]">
                  {selectedDay.deadlines.length}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                {selectedDay.deadlines.length > 0 ? (
                  selectedDay.deadlines.map((item: ScheduleDeadline) => (
                    <div key={item.id} className="rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,255,255,0.85)] px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--ink)]">{item.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{skillMeta[item.skill].label[locale]}</p>
                    </div>
                  ))
                ) : (
                  <EmptyHint text={copy.noDue} />
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.12)] bg-white/78 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{label}</p>
      <p className="mt-3 text-lg font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

function LabelRow({ label }: { label: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{label}</p>;
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-[1rem] border border-dashed border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.6)] px-4 py-3 text-sm text-[var(--ink-soft)]">
      {text}
    </p>
  );
}

function ItemRow({
  title,
  subtitle,
  tag,
  onRemove,
  removeLabel,
}: {
  title: string;
  subtitle: string;
  tag: string;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,255,255,0.85)] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--ink)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full bg-[rgba(20,50,75,0.06)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)]">{tag}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="inline-flex size-8 items-center justify-center rounded-full border border-[rgba(20,50,75,0.12)] bg-white text-[var(--ink-soft)] transition hover:border-[#c36d59] hover:text-[#c36d59]"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
