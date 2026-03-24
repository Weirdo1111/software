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

function getDefaultPreferenceCopy(locale: Locale) {
  return locale === "zh"
    ? {
        lecture: "\u5168\u82f1\u6587\u8bfe\u7a0b",
        seminar: "\u7814\u8ba8\u8bfe\u4ea4\u6d41",
        deadline: "\u6587\u732e\u6982\u8981",
      }
    : {
        lecture: "English-medium lecture",
        seminar: "Seminar discussion",
        deadline: "Source summary",
      };
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

export function createDefaultSchedulePreferences(referenceDate = new Date(), locale: Locale = "en"): SchedulePreferences {
  const today = toDateAtStart(referenceDate);
  const copy = getDefaultPreferenceCopy(locale);

  return {
    version: 1,
    goal: "coursework",
    dailyMinutes: 35,
    mode: "standard",
    studyWindow: "evening",
    classes: [
      { id: createId("class"), title: copy.lecture, type: "lecture", day: 0, time: "09:00" },
      { id: createId("class"), title: copy.seminar, type: "seminar", day: 3, time: "14:00" },
    ],
    deadlines: [
      {
        id: createId("deadline"),
        title: copy.deadline,
        dueDate: formatISODate(addDays(today, 3)),
        skill: "writing",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

function normalizePreferences(value: unknown, locale: Locale = "en"): SchedulePreferences {
  const fallback = createDefaultSchedulePreferences(new Date(), locale);
  if (!value || typeof value !== "object") return fallback;

  const next = value as Partial<SchedulePreferences>;
  const classes = Array.isArray(next.classes)
    ? (next.classes.map(normalizeClass).filter(Boolean) as ScheduleClassSession[])
    : fallback.classes;
  const deadlines = Array.isArray(next.deadlines)
    ? (next.deadlines.map(normalizeDeadline).filter(Boolean) as ScheduleDeadline[])
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

export function loadSchedulePreferencesFromStorage(locale: Locale = "en") {
  if (typeof window === "undefined") return createDefaultSchedulePreferences(new Date(), locale);

  const raw = window.localStorage.getItem(SCHEDULE_PREFERENCES_KEY);
  if (!raw) return createDefaultSchedulePreferences(new Date(), locale);

  try {
    return normalizePreferences(JSON.parse(raw), locale);
  } catch {
    return createDefaultSchedulePreferences(new Date(), locale);
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

function formatTimeLabel(window: StudyWindow, order: number, duration: number, locale: Locale) {
  const startMinutes = minutesForWindow(window) + order * 46;
  const hours = Math.floor(startMinutes / 60);
  const minutes = startMinutes % 60;
  const minuteLabel = locale === "zh" ? "\u5206\u949f" : "min";
  return `${pad(hours)}:${pad(minutes)} / ${duration} ${minuteLabel}`;
}

function getAnchorTitle(skill: TrackedSkill, locale: Locale, classType?: ScheduleClassType | null, deadlineSoon = false) {
  if (deadlineSoon) {
    if (skill === "writing") return locale === "zh" ? "\u5199\u4f5c\u51b2\u523a" : "Writing Clinic";
    if (skill === "reading") return locale === "zh" ? "\u9605\u8bfb\u51b2\u523a" : "Reading Sprint";
    if (skill === "speaking") return locale === "zh" ? "\u53d1\u8a00\u9884\u6f14" : "Seminar Rehearsal";
    return locale === "zh" ? "\u542c\u529b\u8865\u6551" : "Lecture Catch-up";
  }

  if (classType === "lecture") return locale === "zh" ? "\u8bfe\u7a0b\u9884\u4e60" : "Lecture Preview";
  if (classType === "seminar") return locale === "zh" ? "\u7814\u8ba8\u9884\u6f14" : "Seminar Rehearsal";
  if (classType === "lab") return locale === "zh" ? "\u672f\u8bed\u8865\u5f3a" : "Vocabulary Rescue";

  if (skill === "writing") return locale === "zh" ? "\u5199\u4f5c\u7ec3\u4e60" : "Writing Studio";
  if (skill === "reading") return locale === "zh" ? "\u9605\u8bfb\u8bad\u7ec3" : "Reading Sprint";
  if (skill === "speaking") return locale === "zh" ? "\u8868\u8fbe\u7ec3\u4e60" : "Confidence Builder";
  return locale === "zh" ? "\u8bfe\u540e\u542c\u529b" : "Lecture Debrief";
}

function getSupportTitle(skill: TrackedSkill, locale: Locale) {
  if (skill === "listening") return locale === "zh" ? "\u53e3\u97f3\u8fa8\u8bc6" : "Accent Capture";
  if (skill === "speaking") return locale === "zh" ? "\u56de\u5e94\u8bad\u7ec3" : "Response Builder";
  if (skill === "reading") return locale === "zh" ? "\u8bc1\u636e\u68b3\u7406" : "Evidence Map";
  return locale === "zh" ? "\u53e5\u5f0f\u6253\u78e8" : "Sentence Studio";
}

function getMemoryTitle(locale: Locale) {
  return locale === "zh" ? "\u590d\u4e60\u5de9\u56fa" : "Memory Pulse";
}

function formatDueReason(title: string, diff: number, locale: Locale) {
  if (locale === "zh") {
    return diff === 0 ? `\u4eca\u5929\u622a\u6b62\uff1a${title}` : `\u5373\u5c06\u622a\u6b62\uff1a${title}`;
  }

  return diff === 0 ? `Due today: ${title}` : `Up next: ${title}`;
}

function getCourseReason(goal: ScheduleGoal, locale: Locale) {
  if (goal === "research") return locale === "zh" ? "\u4fdd\u6301\u9605\u8bfb\u8f93\u5165\u3002" : "Keep source reading live.";
  if (goal === "seminar") return locale === "zh" ? "\u5148\u7a33\u4f4f\u53e3\u8bed\u8f93\u51fa\u3002" : "Protect speaking confidence.";
  return locale === "zh" ? "\u8d34\u5408\u5f53\u524d\u8bfe\u7a0b\u4efb\u52a1\u3002" : "Support coursework flow.";
}

function getSupportReason(isWeakest: boolean, locale: Locale) {
  if (isWeakest) return locale === "zh" ? "\u5f53\u524d\u8584\u5f31\u9879\u3002" : "Current weak point.";
  return locale === "zh" ? "\u4fdd\u6301\u6280\u80fd\u8854\u63a5\u3002" : "Keep the chain connected.";
}

function getReviewReason(reviewDue: number, locale: Locale) {
  if (reviewDue > 0) {
    return locale === "zh" ? `${reviewDue} \u5f20\u590d\u4e60\u5361\u5230\u671f\u3002` : `${reviewDue} review cards due.`;
  }

  return locale === "zh" ? "\u4fdd\u6301\u5173\u952e\u8868\u8fbe\u6d3b\u8dc3\u3002" : "Keep key phrases active.";
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
    timeLabel: formatTimeLabel(args.studyWindow, args.order, args.minutes, args.locale),
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
  const weakPenalty =
    weakness.attempts === 0 ? 10 : weakness.attempts > 0 && weakness.correct / weakness.attempts < 0.7 ? 8 : 4;
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
    let anchorReason = input.locale === "zh" ? "\u4fdd\u6301\u672c\u5468\u6280\u80fd\u5e73\u8861\u3002" : "Keep the week balanced.";

    if (soonestDeadline) {
      anchorSkill = soonestDeadline.deadline.skill;
      anchorReason = formatDueReason(soonestDeadline.deadline.title, soonestDeadline.diff, input.locale);
    } else if (classes.some((item) => item.type === "seminar")) {
      anchorSkill = "speaking";
      anchorReason =
        classes.find((item) => item.type === "seminar")?.title ??
        (input.locale === "zh" ? "\u7814\u8ba8\u8bfe\u65e5" : "Seminar day");
    } else if (classes.some((item) => item.type === "lecture")) {
      anchorSkill = "listening";
      anchorReason =
        classes.find((item) => item.type === "lecture")?.title ??
        (input.locale === "zh" ? "\u8bfe\u7a0b\u65e5" : "Lecture day");
    } else if (classes.some((item) => item.type === "lab")) {
      anchorSkill = "reading";
      anchorReason =
        classes.find((item) => item.type === "lab")?.title ??
        (input.locale === "zh" ? "\u5b9e\u9a8c\u8bfe\u65e5" : "Lab day");
    } else {
      anchorReason = getCourseReason(input.preferences.goal, input.locale);
    }

    const supportSkill = chooseSupportSkill(
      anchorSkill,
      orderedSkills,
      rotation[(day + 1) % rotation.length] ?? primarySkill,
    );
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
        title: getAnchorTitle(anchorSkill, input.locale, classes[0]?.type, Boolean(soonestDeadline)),
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
        title: getSupportTitle(supportSkill, input.locale),
        skill: supportSkill,
        minutes: supportMinutes,
        reason: getSupportReason(supportSkill === weakestSkill, input.locale),
        order: 1,
        level,
        locale: input.locale,
        studyWindow: input.preferences.studyWindow,
      }),
      createBlock({
        id: `${dateISO}-memory`,
        type: "memory",
        title: getMemoryTitle(input.locale),
        skill: "review",
        minutes: memoryMinutes,
        reason: getReviewReason(input.reviewDue, input.locale),
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
