import { type Locale } from "@/lib/i18n/dictionaries";
import { type LearningTrackerSnapshot, type TrackedSkill } from "@/lib/learning-tracker";

export type ScheduleMode = "light" | "standard" | "intensive";
export type ScheduleGoal = "coursework" | "research" | "seminar";
export type StudyWindow = "early" | "midday" | "evening";
export type ScheduleClassType = "lecture" | "seminar" | "lab";
export type ScheduleWeekMode = "normal" | "heavy-reading" | "presentation" | "deadline-rescue" | "recovery";
export type ScheduleSkill = TrackedSkill | "review";

export interface ScheduleClassSession {
  id: string;
  title: string;
  type: ScheduleClassType;
  day: number;
  time: string;
}

export interface ScheduleDeadline {
  id: string;
  title: string;
  dueDate: string;
  skill: TrackedSkill;
}

export interface SchedulePreferences {
  version: 1;
  goal: ScheduleGoal;
  dailyMinutes: number;
  mode: ScheduleMode;
  studyWindow: StudyWindow;
  classes: ScheduleClassSession[];
  deadlines: ScheduleDeadline[];
  updatedAt: string;
}

export interface ScheduleBlock {
  id: string;
  type: "anchor" | "support" | "memory";
  title: string;
  skill: ScheduleSkill;
  minutes: number;
  reason: string;
  href: string;
  timeLabel: string;
}

export interface DailySchedule {
  dateISO: string;
  day: number;
  pressure: number;
  targetMinutes: number;
  isToday: boolean;
  classes: ScheduleClassSession[];
  deadlines: ScheduleDeadline[];
  blocks: ScheduleBlock[];
}

export interface WeeklySchedule {
  weekMode: ScheduleWeekMode;
  shockIndex: number;
  reviewDue: number;
  primarySkill: TrackedSkill;
  weakestSkill: TrackedSkill;
  weeklyTargetMinutes: number;
  days: DailySchedule[];
}

export const SCHEDULE_PREFERENCES_KEY = "english-learn:schedule-preferences";
const SCHEDULE_EVENT = "english-learn:schedule-preferences:changed";
const SKILLS: TrackedSkill[] = ["listening", "speaking", "reading", "writing"];
const DEFAULT_LEVEL = "A2";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateAtStart(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatISODate(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function addDays(value: Date, amount: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

function getWeekStart(referenceDate: Date) {
  const next = toDateAtStart(referenceDate);
  const weekday = next.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  return addDays(next, diff);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMinutes(value: number) {
  if (value <= 22) return 20;
  if (value <= 42) return 35;
  return 50;
}

function normalizeWindow(value: string | null | undefined): StudyWindow {
  if (value === "early" || value === "midday" || value === "evening") return value;
  return "evening";
}

function normalizeGoal(value: string | null | undefined): ScheduleGoal {
  if (value === "coursework" || value === "research" || value === "seminar") return value;
  return "coursework";
}

function normalizeMode(value: string | null | undefined): ScheduleMode {
  if (value === "light" || value === "standard" || value === "intensive") return value;
  return "standard";
}

function isTrackedSkill(value: string | null | undefined): value is TrackedSkill {
  return value === "listening" || value === "speaking" || value === "reading" || value === "writing";
}

function normalizeDay(value: number) {
  if (!Number.isFinite(value)) return 0;
  return clamp(Math.round(value), 0, 6);
}

function normalizeTime(value: string | null | undefined) {
  const next = String(value ?? "").trim();
  if (/^\d{2}:\d{2}$/.test(next)) return next;
  return "09:00";
}

function normalizeClass(value: unknown): ScheduleClassSession | null {
  if (!value || typeof value !== "object") return null;

  const next = value as Partial<ScheduleClassSession>;
  const title = String(next.title ?? "").trim();
  const type = next.type;
  if (!title) return null;
  if (type !== "lecture" && type !== "seminar" && type !== "lab") return null;

  return {
    id: String(next.id ?? createId("class")),
    title,
    type,
    day: normalizeDay(Number(next.day ?? 0)),
    time: normalizeTime(next.time),
  };
}

function normalizeDeadline(value: unknown): ScheduleDeadline | null {
  if (!value || typeof value !== "object") return null;

  const next = value as Partial<ScheduleDeadline>;
  const title = String(next.title ?? "").trim();
  const dueDate = String(next.dueDate ?? "").trim();
  const skill = String(next.skill ?? "").trim();

  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !isTrackedSkill(skill)) return null;

  return {
    id: String(next.id ?? createId("deadline")),
    title,
    dueDate,
    skill,
  };
}

export function createDefaultSchedulePreferences(referenceDate = new Date()): SchedulePreferences {
  const today = toDateAtStart(referenceDate);

  return {
    version: 1,
    goal: "coursework",
    dailyMinutes: 35,
    mode: "standard",
    studyWindow: "evening",
    classes: [
      { id: createId("class"), title: "English-medium lecture", type: "lecture", day: 0, time: "09:00" },
      { id: createId("class"), title: "Seminar discussion", type: "seminar", day: 3, time: "14:00" },
    ],
    deadlines: [
      {
        id: createId("deadline"),
        title: "Source summary",
        dueDate: formatISODate(addDays(today, 3)),
        skill: "writing",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

function normalizePreferences(value: unknown): SchedulePreferences {
  const fallback = createDefaultSchedulePreferences();
  if (!value || typeof value !== "object") return fallback;

  const next = value as Partial<SchedulePreferences>;
  const classes = Array.isArray(next.classes) ? next.classes.map(normalizeClass).filter(Boolean) as ScheduleClassSession[] : fallback.classes;
  const deadlines = Array.isArray(next.deadlines)
    ? next.deadlines.map(normalizeDeadline).filter(Boolean) as ScheduleDeadline[]
    : fallback.deadlines;

  return {
    version: 1,
    goal: normalizeGoal(next.goal),
    dailyMinutes: normalizeMinutes(Number(next.dailyMinutes ?? fallback.dailyMinutes)),
    mode: normalizeMode(next.mode),
    studyWindow: normalizeWindow(next.studyWindow),
    classes,
    deadlines,
    updatedAt: typeof next.updatedAt === "string" ? next.updatedAt : fallback.updatedAt,
  };
}

export function loadSchedulePreferencesFromStorage() {
  if (typeof window === "undefined") return createDefaultSchedulePreferences();

  const raw = window.localStorage.getItem(SCHEDULE_PREFERENCES_KEY);
  if (!raw) return createDefaultSchedulePreferences();

  try {
    return normalizePreferences(JSON.parse(raw));
  } catch {
    return createDefaultSchedulePreferences();
  }
}

export function saveSchedulePreferencesToStorage(preferences: SchedulePreferences) {
  if (typeof window === "undefined") return preferences;

  const normalized = normalizePreferences({
    ...preferences,
    updatedAt: new Date().toISOString(),
  });

  window.localStorage.setItem(SCHEDULE_PREFERENCES_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(SCHEDULE_EVENT));
  return normalized;
}

export function subscribeSchedulePreferences(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === SCHEDULE_PREFERENCES_KEY) {
      callback();
    }
  };

  const onChanged = () => callback();

  window.addEventListener("storage", onStorage);
  window.addEventListener(SCHEDULE_EVENT, onChanged);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SCHEDULE_EVENT, onChanged);
  };
}

export function createScheduleClassSession(input: Omit<ScheduleClassSession, "id">): ScheduleClassSession {
  return {
    ...input,
    id: createId("class"),
  };
}

export function createScheduleDeadline(input: Omit<ScheduleDeadline, "id">): ScheduleDeadline {
  return {
    ...input,
    id: createId("deadline"),
  };
}

function normalizeLevel(raw: string | null | undefined) {
  const next = String(raw ?? DEFAULT_LEVEL).toUpperCase();
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(next)) return next;
  return DEFAULT_LEVEL;
}

function resolveBlockHref(skill: ScheduleSkill, level: string, locale: Locale) {
  if (skill === "review") return `/review?lang=${locale}`;
  if (skill === "reading") return `/reading?lang=${locale}`;
  if (skill === "listening") return `/listening?lang=${locale}`;
  return `/lesson/${level}-${skill}-starter?lang=${locale}`;
}

function getGoalPrimarySkill(goal: ScheduleGoal): TrackedSkill {
  if (goal === "seminar") return "speaking";
  if (goal === "research") return "reading";
  return "writing";
}

function getRotation(goal: ScheduleGoal): TrackedSkill[] {
  if (goal === "seminar") return ["speaking", "listening", "speaking", "reading", "speaking", "writing", "listening"];
  if (goal === "research") return ["reading", "reading", "writing", "listening", "reading", "writing", "speaking"];
  return ["writing", "reading", "listening", "writing", "speaking", "reading", "listening"];
}

function getSkillNeedOrder(snapshot: LearningTrackerSnapshot) {
  return [...SKILLS]
    .map((skill) => {
      const row = snapshot.skills[skill];
      const accuracy = row.attempts > 0 ? Math.round((row.correct / row.attempts) * 100) : 0;
      return {
        skill,
        attempts: row.attempts,
        accuracy,
        completed: row.completed,
        minutes: row.minutes,
      };
    })
    .sort((a, b) => {
      if (a.attempts === 0 && b.attempts > 0) return -1;
      if (b.attempts === 0 && a.attempts > 0) return 1;
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      if (a.completed !== b.completed) return a.completed - b.completed;
      return a.minutes - b.minutes;
    });
}

function chooseSupportSkill(anchorSkill: TrackedSkill, orderedSkills: TrackedSkill[], rotationSkill: TrackedSkill) {
  const preferred = orderedSkills.find((skill) => skill !== anchorSkill);
  if (preferred) return preferred;
  if (rotationSkill !== anchorSkill) return rotationSkill;
  return SKILLS.find((skill) => skill !== anchorSkill) ?? anchorSkill;
}

function minutesForWindow(window: StudyWindow) {
  if (window === "early") return 7 * 60 + 30;
  if (window === "midday") return 12 * 60 + 20;
  return 19 * 60 + 10;
}

function formatTimeLabel(window: StudyWindow, order: number, duration: number) {
  const startMinutes = minutesForWindow(window) + order * 46;
  const hours = Math.floor(startMinutes / 60);
  const minutes = startMinutes % 60;
  return `${pad(hours)}:${pad(minutes)} · ${duration} min`;
}

function getAnchorTitle(skill: TrackedSkill, classType?: ScheduleClassType | null, deadlineSoon = false) {
  if (deadlineSoon) {
    if (skill === "writing") return "Writing Clinic";
    if (skill === "reading") return "Reading Sprint";
    if (skill === "speaking") return "Seminar Rehearsal";
    return "Lecture Catch-up";
  }

  if (classType === "lecture") return "Lecture Preview";
  if (classType === "seminar") return "Seminar Rehearsal";
  if (classType === "lab") return "Vocabulary Rescue";

  if (skill === "writing") return "Writing Studio";
  if (skill === "reading") return "Reading Sprint";
  if (skill === "speaking") return "Confidence Builder";
  return "Lecture Debrief";
}

function getSupportTitle(skill: TrackedSkill) {
  if (skill === "listening") return "Accent Capture";
  if (skill === "speaking") return "Response Builder";
  if (skill === "reading") return "Evidence Map";
  return "Sentence Studio";
}

function determineWeekMode(preferences: SchedulePreferences, reviewDue: number, referenceDate: Date): ScheduleWeekMode {
  const today = toDateAtStart(referenceDate);
  const nearestDeadline = preferences.deadlines
    .map((deadline) => {
      const due = new Date(`${deadline.dueDate}T00:00:00`);
      return Math.round((toDateAtStart(due).getTime() - today.getTime()) / 86400000);
    })
    .filter((diff) => diff >= 0)
    .sort((a, b) => a - b)[0];

  if (typeof nearestDeadline === "number" && nearestDeadline <= 2) return "deadline-rescue";
  if (preferences.goal === "seminar" || preferences.classes.some((item) => item.type === "seminar")) return "presentation";
  if (preferences.goal === "research" || preferences.deadlines.some((item) => item.skill === "reading")) return "heavy-reading";
  if (preferences.mode === "light" && reviewDue >= 10) return "recovery";
  return "normal";
}

function createBlock(args: {
  id: string;
  type: "anchor" | "support" | "memory";
  title: string;
  skill: ScheduleSkill;
  minutes: number;
  reason: string;
  order: number;
  level: string;
  locale: Locale;
  studyWindow: StudyWindow;
}): ScheduleBlock {
  return {
    id: args.id,
    type: args.type,
    title: args.title,
    skill: args.skill,
    minutes: args.minutes,
    reason: args.reason,
    href: resolveBlockHref(args.skill, args.level, args.locale),
    timeLabel: formatTimeLabel(args.studyWindow, args.order, args.minutes),
  };
}

function targetMinutesForDay(baseMinutes: number, mode: ScheduleMode, classes: number, deadlines: number) {
  const modeFactor = mode === "light" ? 0.82 : mode === "intensive" ? 1.18 : 1;
  return clamp(Math.round(baseMinutes * modeFactor) + classes * 6 + deadlines * 8, 18, 72);
}

function pressureForDay(args: {
  today: boolean;
  classes: number;
  deadlinesToday: number;
  deadlineSoon: boolean;
  reviewDue: number;
  weekMode: ScheduleWeekMode;
  weakestSkill: TrackedSkill;
  snapshot: LearningTrackerSnapshot;
}) {
  const weakness = args.snapshot.skills[args.weakestSkill];
  const weakPenalty = weakness.attempts === 0 ? 10 : weakness.attempts > 0 && weakness.correct / weakness.attempts < 0.7 ? 8 : 4;
  const modePenalty =
    args.weekMode === "deadline-rescue"
      ? 14
      : args.weekMode === "presentation"
        ? 10
        : args.weekMode === "heavy-reading"
          ? 8
          : args.weekMode === "recovery"
            ? 2
            : 5;

  return clamp(
    24 +
      (args.today ? 8 : 0) +
      args.classes * 12 +
      args.deadlinesToday * 18 +
      (args.deadlineSoon ? 10 : 0) +
      Math.min(args.reviewDue, 14) +
      weakPenalty +
      modePenalty,
    18,
    96,
  );
}

export function generateWeeklySchedule(input: {
  preferences: SchedulePreferences;
  snapshot: LearningTrackerSnapshot;
  reviewDue: number;
  locale: Locale;
  level?: string | null;
  referenceDate?: Date;
}): WeeklySchedule {
  const referenceDate = toDateAtStart(input.referenceDate ?? new Date());
  const weekStart = getWeekStart(referenceDate);
  const level = normalizeLevel(input.level);
  const orderedSkills = getSkillNeedOrder(input.snapshot).map((item) => item.skill);
  const primarySkill = getGoalPrimarySkill(input.preferences.goal);
  const weakestSkill = orderedSkills[0] ?? "speaking";
  const rotation = getRotation(input.preferences.goal);
  const weekMode = determineWeekMode(input.preferences, input.reviewDue, referenceDate);

  const days: DailySchedule[] = Array.from({ length: 7 }, (_, day) => {
    const currentDate = addDays(weekStart, day);
    const dateISO = formatISODate(currentDate);
    const classes = input.preferences.classes
      .filter((item) => item.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
    const deadlines = input.preferences.deadlines
      .filter((item) => item.dueDate === dateISO)
      .sort((a, b) => a.title.localeCompare(b.title));

    const soonestDeadline = input.preferences.deadlines
      .map((deadline) => {
        const due = new Date(`${deadline.dueDate}T00:00:00`);
        const diff = Math.round((toDateAtStart(due).getTime() - currentDate.getTime()) / 86400000);
        return { deadline, diff };
      })
      .filter((item) => item.diff >= 0 && item.diff <= 2)
      .sort((a, b) => a.diff - b.diff)[0];

    let anchorSkill: TrackedSkill = rotation[day] ?? primarySkill;
    let anchorReason = "Keep the week balanced.";

    if (soonestDeadline) {
      anchorSkill = soonestDeadline.deadline.skill;
      anchorReason = soonestDeadline.diff === 0 ? `Due today: ${soonestDeadline.deadline.title}` : `Up next: ${soonestDeadline.deadline.title}`;
    } else if (classes.some((item) => item.type === "seminar")) {
      anchorSkill = "speaking";
      anchorReason = classes.find((item) => item.type === "seminar")?.title ?? "Seminar day";
    } else if (classes.some((item) => item.type === "lecture")) {
      anchorSkill = "listening";
      anchorReason = classes.find((item) => item.type === "lecture")?.title ?? "Lecture day";
    } else if (classes.some((item) => item.type === "lab")) {
      anchorSkill = "reading";
      anchorReason = classes.find((item) => item.type === "lab")?.title ?? "Lab day";
    } else if (input.preferences.goal === "research") {
      anchorReason = "Keep source reading live.";
    } else if (input.preferences.goal === "seminar") {
      anchorReason = "Protect speaking confidence.";
    } else {
      anchorReason = "Support coursework flow.";
    }

    const supportSkill = chooseSupportSkill(anchorSkill, orderedSkills, rotation[(day + 1) % rotation.length] ?? primarySkill);
    const targetMinutes = targetMinutesForDay(
      input.preferences.dailyMinutes,
      input.preferences.mode,
      classes.length,
      deadlines.length + (soonestDeadline ? 1 : 0),
    );
    const anchorMinutes = clamp(Math.round(targetMinutes * 0.54), 12, 34);
    const supportMinutes = clamp(Math.round(targetMinutes * 0.27), 8, 18);
    const memoryMinutes = clamp(targetMinutes - anchorMinutes - supportMinutes, 8, 16);

    const blocks: ScheduleBlock[] = [
      createBlock({
        id: `${dateISO}-anchor`,
        type: "anchor",
        title: getAnchorTitle(anchorSkill, classes[0]?.type, Boolean(soonestDeadline)),
        skill: anchorSkill,
        minutes: anchorMinutes,
        reason: anchorReason,
        order: 0,
        level,
        locale: input.locale,
        studyWindow: input.preferences.studyWindow,
      }),
      createBlock({
        id: `${dateISO}-support`,
        type: "support",
        title: getSupportTitle(supportSkill),
        skill: supportSkill,
        minutes: supportMinutes,
        reason: supportSkill === weakestSkill ? "Current weak point." : "Keep the chain connected.",
        order: 1,
        level,
        locale: input.locale,
        studyWindow: input.preferences.studyWindow,
      }),
      createBlock({
        id: `${dateISO}-memory`,
        type: "memory",
        title: "Memory Pulse",
        skill: "review",
        minutes: memoryMinutes,
        reason: input.reviewDue > 0 ? `${input.reviewDue} review cards due.` : "Keep key phrases active.",
        order: 2,
        level,
        locale: input.locale,
        studyWindow: input.preferences.studyWindow,
      }),
    ];

    return {
      dateISO,
      day,
      pressure: pressureForDay({
        today: dateISO === formatISODate(referenceDate),
        classes: classes.length,
        deadlinesToday: deadlines.length,
        deadlineSoon: Boolean(soonestDeadline),
        reviewDue: input.reviewDue,
        weekMode,
        weakestSkill,
        snapshot: input.snapshot,
      }),
      targetMinutes,
      isToday: dateISO === formatISODate(referenceDate),
      classes,
      deadlines,
      blocks,
    };
  });

  const weeklyTargetMinutes = days.reduce((sum, day) => sum + day.targetMinutes, 0);
  const shockIndex = clamp(
    Math.round(
      days.reduce((sum, day) => sum + day.pressure, 0) / days.length +
        (input.reviewDue > 10 ? 6 : 0) +
        (weekMode === "deadline-rescue" ? 8 : 0),
    ),
    22,
    95,
  );

  return {
    weekMode,
    shockIndex,
    reviewDue: input.reviewDue,
    primarySkill,
    weakestSkill,
    weeklyTargetMinutes,
    days,
  };
}
