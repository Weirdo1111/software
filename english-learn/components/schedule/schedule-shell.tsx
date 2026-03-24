"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  CalendarClock,
  Headphones,
  Mic,
  PenTool,
  Plus,
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
  type ScheduleGoal,
  type ScheduleMode,
  type SchedulePreferences,
  type StudyWindow,
} from "@/lib/schedule";

// ─── constants ───────────────────────────────────────────────────────────────

const MANUAL_KEY = "english-learn:schedule-manual-skills";

type ManualSkills = { [day: number]: TrackedSkill | "auto" };

const skillMeta = {
  listening: { label: { zh: "听力", en: "Listening" }, Icon: Headphones, href: (l: Locale) => `/listening?lang=${l}` },
  speaking:  { label: { zh: "口语", en: "Speaking"  }, Icon: Mic,       href: (level: string, l: Locale) => `/lesson/${level}-speaking-starter?lang=${l}` },
  reading:   { label: { zh: "阅读", en: "Reading"   }, Icon: BookOpenText, href: (l: Locale) => `/reading?lang=${l}` },
  writing:   { label: { zh: "写作", en: "Writing"   }, Icon: PenTool,    href: (level: string, l: Locale) => `/lesson/${level}-writing-starter?lang=${l}` },
  review:    { label: { zh: "复习", en: "Review"    }, Icon: BrainCircuit, href: (l: Locale) => `/review?lang=${l}` },
} as const;

const TRACKED_SKILLS: TrackedSkill[] = ["listening", "speaking", "reading", "writing"];

const classTypeOptions = [
  { value: "lecture", label: { zh: "课程",   en: "Lecture" } },
  { value: "seminar", label: { zh: "研讨课", en: "Seminar" } },
  { value: "lab",     label: { zh: "实验课", en: "Lab"     } },
] as const;

const dayLabels = {
  zh: ["周一","周二","周三","周四","周五","周六","周日"],
  en: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
};

function normalizeLevel(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  return ["A1","A2","B1","B2","C1","C2"].includes(next) ? next : "A2";
}

function getDefaultDeadlineDate() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function pressureColor(p: number) {
  if (p <= 35) return "bg-emerald-400/80";
  if (p <= 55) return "bg-amber-400/80";
  if (p <= 72) return "bg-orange-400/80";
  return "bg-red-400/80";
}

function loadManualSkills(): ManualSkills {
  try {
    const raw = localStorage.getItem(MANUAL_KEY);
    return raw ? (JSON.parse(raw) as ManualSkills) : {};
  } catch { return {}; }
}

function saveManualSkills(v: ManualSkills) {
  localStorage.setItem(MANUAL_KEY, JSON.stringify(v));
}

const inputCls =
  "w-full rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-white/90 px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[rgba(28,78,149,0.28)] focus:ring-2 focus:ring-[rgba(28,78,149,0.08)]";

function chip(active: boolean) {
  return `rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
    active
      ? "border-[var(--navy)] bg-[var(--navy)] text-[#f7efe3]"
      : "border-[rgba(20,50,75,0.14)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.06)]"
  }`;
}

// ─── main component ──────────────────────────────────────────────────────────

export function ScheduleShell({ locale }: { locale: Locale }) {
  const [level, setLevel]           = useState("A2");
  const [snapshot, setSnapshot]     = useState(() => createEmptyLearningTrackerSnapshot());
  const [preferences, setPreferences] = useState<SchedulePreferences>(() =>
    createDefaultSchedulePreferences(new Date(), locale)
  );
  const [mode, setMode]             = useState<"auto" | "manual">("auto");
  const [manualSkills, setManualSkills] = useState<ManualSkills>({});

  const [classDraft, setClassDraft] = useState({
    title: "", day: 0, type: "lecture" as ScheduleClassType, time: "09:00",
  });
  const [deadlineDraft, setDeadlineDraft] = useState({
    title: "", dueDate: getDefaultDeadlineDate(), skill: "writing" as TrackedSkill,
  });

  const c = locale === "zh"
    ? {
        title:           "学习计划",
        langNote:        "浏览器本地保存",
        prefsTitle:      "学习偏好",
        goalLabel:       "目标",
        goals:           { coursework:"课程作业", research:"学术研究", seminar:"研讨课" },
        minutesLabel:    "每日时长",
        modeLabel:       "强度",
        modes:           { light:"轻松", standard:"标准", intensive:"强化" },
        windowLabel:     "学习时段",
        windows:         { early:"早晨", midday:"中午", evening:"晚上" },
        classesTitle:    "课程表",
        noClasses:       "还没有课程，点下方添加",
        classNamePh:     "课程名称",
        classTimePh:     "时间",
        addClass:        "添加课程",
        deadlinesTitle:  "截止任务",
        noDeadlines:     "还没有截止任务，点下方添加",
        deadlineNamePh:  "任务名称",
        addDeadline:     "添加任务",
        remove:          "删除",
        scheduleTitle:   "本周安排",
        autoMode:        "自动安排",
        manualMode:      "自己安排",
        autoHint:        "系统根据课程表和截止任务自动分配每日任务。",
        manualHint:      "为每天选择一个主练技能，系统生成对应任务。",
        skillAuto:       "自动",
        startTask:       "开始",
        minShort:        "分",
        today:           "今天",
      }
    : {
        title:           "Schedule",
        langNote:        "Saved in browser",
        prefsTitle:      "Preferences",
        goalLabel:       "Goal",
        goals:           { coursework:"Coursework", research:"Research", seminar:"Seminar" },
        minutesLabel:    "Daily time",
        modeLabel:       "Intensity",
        modes:           { light:"Light", standard:"Standard", intensive:"Intensive" },
        windowLabel:     "Study window",
        windows:         { early:"Morning", midday:"Midday", evening:"Evening" },
        classesTitle:    "Classes",
        noClasses:       "No classes yet — add one below",
        classNamePh:     "Class name",
        classTimePh:     "Time",
        addClass:        "Add class",
        deadlinesTitle:  "Deadlines",
        noDeadlines:     "No deadlines yet — add one below",
        deadlineNamePh:  "Task name",
        addDeadline:     "Add deadline",
        remove:          "Remove",
        scheduleTitle:   "This week",
        autoMode:        "Auto",
        manualMode:      "Manual",
        autoHint:        "System allocates daily tasks based on your classes and deadlines.",
        manualHint:      "Pick a focus skill for each day; the system builds your tasks around it.",
        skillAuto:       "Auto",
        startTask:       "Start",
        minShort:        "min",
        today:           "Today",
      };

  // ── effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const refreshProfile = () => {
      setLevel(normalizeLevel(localStorage.getItem("demo_level")));
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
    };
    const refreshPrefs = () => setPreferences(loadSchedulePreferencesFromStorage(locale));

    refreshProfile();
    refreshPrefs();
    setManualSkills(loadManualSkills());

    const u1 = subscribeLearningTracker(refreshProfile);
    const u2 = subscribeSchedulePreferences(refreshPrefs);
    window.addEventListener("storage", refreshProfile);
    window.addEventListener("demo-placement-changed", refreshProfile as EventListener);
    return () => {
      u1(); u2();
      window.removeEventListener("storage", refreshProfile);
      window.removeEventListener("demo-placement-changed", refreshProfile as EventListener);
    };
  }, [locale]);

  // ── schedule ───────────────────────────────────────────────────────────────

  const weeklySchedule = useMemo(() =>
    generateWeeklySchedule({ preferences, snapshot, reviewDue: 0, locale, level }),
    [preferences, snapshot, locale, level]
  );

  // ── preference helpers ─────────────────────────────────────────────────────

  const updatePrefs = (partial: Partial<SchedulePreferences>) => {
    setPreferences((cur) => saveSchedulePreferencesToStorage({ ...cur, ...partial, updatedAt: new Date().toISOString() }));
  };

  // ── class CRUD ─────────────────────────────────────────────────────────────

  function addClass() {
    if (!classDraft.title.trim()) return;
    updatePrefs({
      classes: [...preferences.classes, createScheduleClassSession({
        title: classDraft.title.trim(), day: classDraft.day,
        type: classDraft.type, time: classDraft.time,
      })],
    });
    setClassDraft((c) => ({ ...c, title: "" }));
  }

  function removeClass(id: string) {
    updatePrefs({ classes: preferences.classes.filter((c) => c.id !== id) });
  }

  // ── deadline CRUD ──────────────────────────────────────────────────────────

  function addDeadline() {
    if (!deadlineDraft.title.trim()) return;
    updatePrefs({
      deadlines: [...preferences.deadlines, createScheduleDeadline({
        title: deadlineDraft.title.trim(),
        dueDate: deadlineDraft.dueDate,
        skill: deadlineDraft.skill,
      })],
    });
    setDeadlineDraft((d) => ({ ...d, title: "" }));
  }

  function removeDeadline(id: string) {
    updatePrefs({ deadlines: preferences.deadlines.filter((d) => d.id !== id) });
  }

  // ── manual skill picker ────────────────────────────────────────────────────

  function setManualSkill(day: number, skill: TrackedSkill | "auto") {
    const next = { ...manualSkills, [day]: skill };
    setManualSkills(next);
    saveManualSkills(next);
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <section className="mt-6 grid gap-5 reveal-up">

      {/* ── header ── */}
      <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">{c.title}</h2>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink-soft)] sm:inline-flex">
              {c.langNote}
            </span>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        {/* preferences strip */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PrefRow label={c.goalLabel}>
            {(["coursework","research","seminar"] as ScheduleGoal[]).map((g) => (
              <button key={g} className={chip(preferences.goal === g)} onClick={() => updatePrefs({ goal: g })}>
                {c.goals[g]}
              </button>
            ))}
          </PrefRow>
          <PrefRow label={c.minutesLabel}>
            {([20,35,50] as const).map((m) => (
              <button key={m} className={chip(preferences.dailyMinutes === m)} onClick={() => updatePrefs({ dailyMinutes: m })}>
                {m} {c.minShort}
              </button>
            ))}
          </PrefRow>
          <PrefRow label={c.modeLabel}>
            {(["light","standard","intensive"] as ScheduleMode[]).map((m) => (
              <button key={m} className={chip(preferences.mode === m)} onClick={() => updatePrefs({ mode: m })}>
                {c.modes[m]}
              </button>
            ))}
          </PrefRow>
          <PrefRow label={c.windowLabel}>
            {(["early","midday","evening"] as StudyWindow[]).map((w) => (
              <button key={w} className={chip(preferences.studyWindow === w)} onClick={() => updatePrefs({ studyWindow: w })}>
                {c.windows[w]}
              </button>
            ))}
          </PrefRow>
        </div>
      </article>

      {/* ── classes + deadlines ── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* classes */}
        <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
          <h3 className="font-display text-3xl tracking-tight text-[var(--ink)]">{c.classesTitle}</h3>

          <div className="mt-4 grid gap-2">
            {preferences.classes.length === 0 ? (
              <EmptyHint text={c.noClasses} />
            ) : (
              preferences.classes.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.title}
                  subtitle={`${dayLabels[locale][item.day]} · ${item.time}`}
                  tag={classTypeOptions.find((o) => o.value === item.type)?.label[locale] ?? item.type}
                  onRemove={() => removeClass(item.id)}
                  removeLabel={c.remove}
                />
              ))
            )}
          </div>

          {/* add form */}
          <div className="mt-4 grid gap-2">
            <input
              value={classDraft.title}
              onChange={(e) => setClassDraft((d) => ({ ...d, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addClass()}
              placeholder={c.classNamePh}
              className={inputCls}
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={classDraft.day}
                onChange={(e) => setClassDraft((d) => ({ ...d, day: Number(e.target.value) }))}
                className={inputCls}
              >
                {dayLabels[locale].map((label, i) => (
                  <option key={i} value={i}>{label}</option>
                ))}
              </select>
              <select
                value={classDraft.type}
                onChange={(e) => setClassDraft((d) => ({ ...d, type: e.target.value as ScheduleClassType }))}
                className={inputCls}
              >
                {classTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label[locale]}</option>
                ))}
              </select>
              <input
                value={classDraft.time}
                onChange={(e) => setClassDraft((d) => ({ ...d, time: e.target.value }))}
                placeholder={c.classTimePh}
                type="time"
                className={inputCls}
              />
            </div>
            <button
              onClick={addClass}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
            >
              <Plus className="size-4" />
              {c.addClass}
            </button>
          </div>
        </article>

        {/* deadlines */}
        <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
          <h3 className="font-display text-3xl tracking-tight text-[var(--ink)]">{c.deadlinesTitle}</h3>

          <div className="mt-4 grid gap-2">
            {preferences.deadlines.length === 0 ? (
              <EmptyHint text={c.noDeadlines} />
            ) : (
              preferences.deadlines
                .slice()
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map((item) => (
                  <ItemRow
                    key={item.id}
                    title={item.title}
                    subtitle={item.dueDate}
                    tag={skillMeta[item.skill].label[locale]}
                    onRemove={() => removeDeadline(item.id)}
                    removeLabel={c.remove}
                  />
                ))
            )}
          </div>

          {/* add form */}
          <div className="mt-4 grid gap-2">
            <input
              value={deadlineDraft.title}
              onChange={(e) => setDeadlineDraft((d) => ({ ...d, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addDeadline()}
              placeholder={c.deadlineNamePh}
              className={inputCls}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={deadlineDraft.dueDate}
                onChange={(e) => setDeadlineDraft((d) => ({ ...d, dueDate: e.target.value }))}
                className={inputCls}
              />
              <select
                value={deadlineDraft.skill}
                onChange={(e) => setDeadlineDraft((d) => ({ ...d, skill: e.target.value as TrackedSkill }))}
                className={inputCls}
              >
                {TRACKED_SKILLS.map((s) => (
                  <option key={s} value={s}>{skillMeta[s].label[locale]}</option>
                ))}
              </select>
            </div>
            <button
              onClick={addDeadline}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,50,75,0.14)] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.06)]"
            >
              <CalendarClock className="size-4" />
              {c.addDeadline}
            </button>
          </div>
        </article>
      </div>

      {/* ── weekly schedule ── */}
      <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-3xl tracking-tight text-[var(--ink)]">{c.scheduleTitle}</h3>
          <div className="flex items-center gap-1 rounded-full border border-[rgba(20,50,75,0.14)] bg-white/80 p-1">
            <button
              onClick={() => setMode("auto")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${mode === "auto" ? "bg-[var(--navy)] text-[#f7efe3]" : "text-[var(--ink)] hover:bg-[rgba(20,50,75,0.06)]"}`}
            >
              {c.autoMode}
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${mode === "manual" ? "bg-[var(--navy)] text-[#f7efe3]" : "text-[var(--ink)] hover:bg-[rgba(20,50,75,0.06)]"}`}
            >
              {c.manualMode}
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{mode === "auto" ? c.autoHint : c.manualHint}</p>

        {/* AUTO mode */}
        {mode === "auto" && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {weeklySchedule.days.map((day) => {
              const dl = dayLabels[locale][day.day];
              return (
                <div
                  key={day.dateISO}
                  className={`rounded-[1.4rem] border p-4 ${
                    day.isToday
                      ? "border-[rgba(28,78,149,0.22)] bg-[rgba(28,78,149,0.06)]"
                      : "border-[rgba(20,50,75,0.10)] bg-white/72"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{dl}</span>
                    <div className="flex items-center gap-1.5">
                      {day.isToday && (
                        <span className="rounded-full bg-[var(--navy)] px-2 py-0.5 text-[10px] font-bold text-[#f7efe3]">{c.today}</span>
                      )}
                      {day.deadlines.length > 0 && (
                        <span className="size-2 rounded-full bg-red-500" title="deadline" />
                      )}
                      <span className={`size-2.5 rounded-full ${pressureColor(day.pressure)}`} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    {day.blocks.map((block) => {
                      const meta = skillMeta[block.skill];
                      const Icon = meta.Icon;
                      return (
                        <Link
                          key={block.id}
                          href={block.href}
                          className="flex items-center gap-2 rounded-[0.8rem] border border-[rgba(20,50,75,0.08)] bg-white/80 px-3 py-2 transition hover:bg-[rgba(20,50,75,0.06)]"
                        >
                          <Icon className="size-3.5 shrink-0 text-[var(--ink-soft)]" />
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--ink)]">{block.title}</span>
                          <span className="shrink-0 text-[10px] text-[var(--ink-soft)]">{block.minutes}{c.minShort}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MANUAL mode */}
        {mode === "manual" && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {weeklySchedule.days.map((day) => {
              const dl = dayLabels[locale][day.day];
              const chosen = manualSkills[day.day] ?? "auto";
              const activeSkill = chosen === "auto"
                ? day.blocks[0]?.skill
                : chosen;

              const skillHref = activeSkill && activeSkill !== "review"
                ? (activeSkill === "listening"
                    ? `/listening?lang=${locale}`
                    : activeSkill === "reading"
                      ? `/reading?lang=${locale}`
                      : `/lesson/${level}-${activeSkill}-starter?lang=${locale}`)
                : null;

              return (
                <div
                  key={day.dateISO}
                  className={`rounded-[1.4rem] border p-4 ${
                    day.isToday
                      ? "border-[rgba(28,78,149,0.22)] bg-[rgba(28,78,149,0.06)]"
                      : "border-[rgba(20,50,75,0.10)] bg-white/72"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{dl}</span>
                    {day.isToday && (
                      <span className="rounded-full bg-[var(--navy)] px-2 py-0.5 text-[10px] font-bold text-[#f7efe3]">{c.today}</span>
                    )}
                  </div>

                  {/* skill picker */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <button
                      onClick={() => setManualSkill(day.day, "auto")}
                      className={chip(chosen === "auto") + " !text-[10px] !px-2 !py-1"}
                    >
                      {c.skillAuto}
                    </button>
                    {TRACKED_SKILLS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setManualSkill(day.day, s)}
                        className={chip(chosen === s) + " !text-[10px] !px-2 !py-1"}
                      >
                        {skillMeta[s].label[locale]}
                      </button>
                    ))}
                  </div>

                  {/* go button */}
                  {skillHref && (
                    <Link
                      href={skillHref}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--navy)] px-3 py-2 text-xs font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
                    >
                      {activeSkill && skillMeta[activeSkill as keyof typeof skillMeta]?.label[locale]}
                      <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function PrefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-[1rem] border border-dashed border-[rgba(20,50,75,0.14)] bg-white/60 px-4 py-3 text-sm text-[var(--ink-soft)]">
      {text}
    </p>
  );
}

function ItemRow({
  title, subtitle, tag, onRemove, removeLabel,
}: { title: string; subtitle: string; tag: string; onRemove: () => void; removeLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-white/85 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--ink)]">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{subtitle}</p>
      </div>
      <span className="shrink-0 rounded-full bg-[rgba(20,50,75,0.06)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)]">{tag}</span>
      <button
        onClick={onRemove}
        aria-label={removeLabel}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[rgba(20,50,75,0.12)] bg-white text-[var(--ink-soft)] transition hover:border-red-300 hover:text-red-500"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
