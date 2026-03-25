import { type Locale } from "@/lib/i18n/dictionaries";
import { type LearningTrackerSnapshot, type TrackedSkill } from "@/lib/learning-tracker";

export type ScheduleMode = "light" | "standard" | "intensive";
export type ScheduleGoal = "coursework" | "research" | "seminar";
export type StudyWindow = "early" | "midday" | "evening";
export type ScheduleClassType = "lecture" | "seminar" | "lab";
export type ScheduleWeekMode = "normal" | "heavy-reading" | "presentation" | "deadline-rescue" | "recovery";
export type ScheduleSkill = TrackedSkill | "review";
export type ScheduleSlotId = "01-02" | "03-04" | "05-06" | "07-08" | "09-10";
export type ScheduleBlockType = "anchor" | "support" | "memory" | "custom";

export const SCHEDULE_TIME_SLOTS: ReadonlyArray<{
  id: ScheduleSlotId;
  defaultTime: string;
  label: {
    zh: string;
    en: string;
  };
}> = [
  { id: "01-02", defaultTime: "08:00", label: { zh: "01-02", en: "01-02" } },
  { id: "03-04", defaultTime: "10:00", label: { zh: "03-04", en: "03-04" } },
  { id: "05-06", defaultTime: "13:30", label: { zh: "05-06", en: "05-06" } },
  { id: "07-08", defaultTime: "15:30", label: { zh: "07-08", en: "07-08" } },
  { id: "09-10", defaultTime: "18:00", label: { zh: "09-10", en: "09-10" } },
] as const;

type PlanWindowCandidateKind = "free-slot" | "after-class" | "after-day";

type PlanWindowCandidate = {
  key: string;
  slot: ScheduleSlotId;
  kind: PlanWindowCandidateKind;
  label: string;
  sortOrder: number;
};

export interface ScheduleClassSession {
  id: string;
  title: string;
  type: ScheduleClassType;
  day: number;
  slot: ScheduleSlotId;
  time: string;
}

export interface ScheduleDeadline {
  id: string;
  title: string;
  dueDate: string;
  skill: TrackedSkill;
}

export interface EditableScheduleBlock {
  id: string;
  type: ScheduleBlockType;
  title: string;
  skill: ScheduleSkill;
  minutes: number;
  reason: string;
}

export interface ScheduleDayPlanOverride {
  day: number;
  blocks: EditableScheduleBlock[];
}

export interface SchedulePreferences {
  version: 1;
  goal: ScheduleGoal;
  dailyMinutes: number;
  mode: ScheduleMode;
  studyWindow: StudyWindow;
  classes: ScheduleClassSession[];
  deadlines: ScheduleDeadline[];
  planWeekStartISO: string | null;
  planOverrides: ScheduleDayPlanOverride[];
  updatedAt: string;
}

export interface ScheduleBlock {
  id: string;
  type: ScheduleBlockType;
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
  isManual: boolean;
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

export function getScheduleWeekStartISO(referenceDate = new Date()) {
  return formatISODate(getWeekStart(toDateAtStart(referenceDate)));
}

export function getActiveWeekPlanOverrides(
  preferences: SchedulePreferences,
  referenceDate = new Date(),
) {
  return preferences.planWeekStartISO === getScheduleWeekStartISO(referenceDate)
    ? preferences.planOverrides
    : [];
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

function isScheduleSkill(value: string | null | undefined): value is ScheduleSkill {
  return isTrackedSkill(value) || value === "review";
}

function normalizeBlockType(value: string | null | undefined): ScheduleBlockType {
  if (value === "anchor" || value === "support" || value === "memory" || value === "custom") {
    return value;
  }

  return "custom";
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

export function isScheduleSlotId(value: string | null | undefined): value is ScheduleSlotId {
  return SCHEDULE_TIME_SLOTS.some((slot) => slot.id === value);
}

export function getScheduleSlotDefaultTime(slot: ScheduleSlotId) {
  return SCHEDULE_TIME_SLOTS.find((item) => item.id === slot)?.defaultTime ?? "09:00";
}

function inferSlotFromTime(time: string): ScheduleSlotId {
  const [hourString] = time.split(":");
  const hour = Number(hourString);
  if (!Number.isFinite(hour)) return "03-04";
  if (hour < 9) return "01-02";
  if (hour < 12) return "03-04";
  if (hour < 15) return "05-06";
  if (hour < 17) return "07-08";
  return "09-10";
}

function normalizeSlot(value: string | null | undefined, fallbackTime?: string | null) {
  if (isScheduleSlotId(value)) return value;
  if (fallbackTime) return inferSlotFromTime(normalizeTime(fallbackTime));
  return "03-04";
}

export function compareScheduleClasses(a: ScheduleClassSession, b: ScheduleClassSession) {
  const slotIndexA = SCHEDULE_TIME_SLOTS.findIndex((slot) => slot.id === a.slot);
  const slotIndexB = SCHEDULE_TIME_SLOTS.findIndex((slot) => slot.id === b.slot);
  if (slotIndexA !== slotIndexB) return slotIndexA - slotIndexB;
  return a.time.localeCompare(b.time);
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
    slot: normalizeSlot(typeof next.slot === "string" ? next.slot : null, next.time),
    time: normalizeTime(next.time ?? getScheduleSlotDefaultTime(normalizeSlot(typeof next.slot === "string" ? next.slot : null, next.time))),
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

function normalizeEditableBlock(value: unknown): EditableScheduleBlock | null {
  if (!value || typeof value !== "object") return null;

  const next = value as Partial<EditableScheduleBlock>;
  const title = String(next.title ?? "").trim();
  const reason = String(next.reason ?? "").trim();
  const minutes = clamp(Math.round(Number(next.minutes ?? 12)), 5, 90);

  if (!title || !reason || !isScheduleSkill(String(next.skill ?? ""))) {
    return null;
  }

  return {
    id: String(next.id ?? createId("plan")),
    type: normalizeBlockType(next.type),
    title,
    skill: String(next.skill ?? "review") as ScheduleSkill,
    minutes,
    reason,
  };
}

function normalizeDayPlanOverride(value: unknown): ScheduleDayPlanOverride | null {
  if (!value || typeof value !== "object") return null;

  const next = value as Partial<ScheduleDayPlanOverride>;
  const blocks = Array.isArray(next.blocks)
    ? (next.blocks.map(normalizeEditableBlock).filter(Boolean) as EditableScheduleBlock[])
    : [];

  if (blocks.length === 0) return null;

  return {
    day: normalizeDay(Number(next.day ?? 0)),
    blocks,
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
      { id: createId("class"), title: copy.lecture, type: "lecture", day: 0, slot: "03-04", time: "10:00" },
      { id: createId("class"), title: copy.seminar, type: "seminar", day: 3, slot: "07-08", time: "15:30" },
    ],
    deadlines: [
      {
        id: createId("deadline"),
        title: copy.deadline,
        dueDate: formatISODate(addDays(today, 3)),
        skill: "writing",
      },
    ],
    planWeekStartISO: null,
    planOverrides: [],
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
  const planOverrides = Array.isArray(next.planOverrides)
    ? (next.planOverrides
        .map(normalizeDayPlanOverride)
        .filter(Boolean) as ScheduleDayPlanOverride[])
    : [];

  return {
    version: 1,
    goal: normalizeGoal(next.goal),
    dailyMinutes: normalizeMinutes(Number(next.dailyMinutes ?? fallback.dailyMinutes)),
    mode: normalizeMode(next.mode),
    studyWindow: normalizeWindow(next.studyWindow),
    classes,
    deadlines,
    planWeekStartISO: typeof next.planWeekStartISO === "string" ? next.planWeekStartISO : null,
    planOverrides,
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

export async function hydrateSchedulePreferencesFromServer(locale: Locale = "en") {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch("/api/schedule/preferences", {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      preferences?: SchedulePreferences | null;
    };

    if (!payload.preferences) return null;

    const normalized = normalizePreferences(payload.preferences, locale);
    window.localStorage.setItem(SCHEDULE_PREFERENCES_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(SCHEDULE_EVENT));
    return normalized;
  } catch {
    return null;
  }
}

async function persistSchedulePreferencesToServer(preferences: SchedulePreferences) {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch("/api/schedule/preferences", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    });

    return response.ok;
  } catch {
    return false;
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
  void persistSchedulePreferencesToServer(normalized);
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
    slot: normalizeSlot(input.slot, input.time),
    time: normalizeTime(input.time ?? getScheduleSlotDefaultTime(normalizeSlot(input.slot, input.time))),
    id: createId("class"),
  };
}

export function createScheduleDeadline(input: Omit<ScheduleDeadline, "id">): ScheduleDeadline {
  return {
    ...input,
    id: createId("deadline"),
  };
}

export function createEditableScheduleBlock(
  input: Omit<EditableScheduleBlock, "id">,
): EditableScheduleBlock {
  return {
    ...input,
    id: createId("plan"),
    minutes: clamp(Math.round(input.minutes), 5, 90),
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

function getAfterSlotLabel(slot: ScheduleSlotId, locale: Locale) {
  return locale === "zh" ? `${slot}\u540e` : `After ${slot}`;
}

function buildPlanWindowCandidates(classes: ScheduleClassSession[], locale: Locale) {
  const occupiedSlots = new Set(classes.map((item) => item.slot));
  const candidates: PlanWindowCandidate[] = [];

  SCHEDULE_TIME_SLOTS.forEach((slot, index) => {
    if (occupiedSlots.has(slot.id)) {
      candidates.push({
        key: `after-${slot.id}`,
        slot: slot.id,
        kind: slot.id === "09-10" ? "after-day" : "after-class",
        label: getAfterSlotLabel(slot.id, locale),
        sortOrder: index * 2 + 1,
      });
      return;
    }

    candidates.push({
      key: `slot-${slot.id}`,
      slot: slot.id,
      kind: "free-slot",
      label: slot.label[locale],
      sortOrder: index * 2,
    });
  });

  if (!occupiedSlots.has("09-10")) {
    candidates.push({
      key: "after-09-10",
      slot: "09-10",
      kind: "after-day",
      label: getAfterSlotLabel("09-10", locale),
      sortOrder: SCHEDULE_TIME_SLOTS.length * 2 + 1,
    });
  }

  return candidates.sort((a, b) => a.sortOrder - b.sortOrder);
}

function getRelevantClassSlot(skill: ScheduleSkill, classes: ScheduleClassSession[]) {
  const ordered = [...classes].sort(compareScheduleClasses);
  const findSlot = (type: ScheduleClassType) => ordered.find((item) => item.type === type)?.slot ?? null;
  const lastSlot = ordered.length > 0 ? ordered[ordered.length - 1]?.slot ?? null : null;

  if (skill === "speaking") return findSlot("seminar") ?? findSlot("lecture") ?? lastSlot;
  if (skill === "listening") return findSlot("lecture") ?? lastSlot;
  if (skill === "reading") return findSlot("lab") ?? findSlot("lecture") ?? lastSlot;
  return lastSlot;
}

function getPreferenceTargetOrder(studyWindow: StudyWindow, includeAfterDay: boolean) {
  if (studyWindow === "early") return 0;
  if (studyWindow === "midday") return 4;
  return includeAfterDay ? SCHEDULE_TIME_SLOTS.length * 2 + 1 : 8;
}

function pickWindowNearTarget(
  windows: PlanWindowCandidate[],
  targetOrder: number,
  preferLater: boolean,
) {
  return [...windows].sort((a, b) => {
    const distanceDiff = Math.abs(a.sortOrder - targetOrder) - Math.abs(b.sortOrder - targetOrder);
    if (distanceDiff !== 0) return distanceDiff;
    return preferLater ? b.sortOrder - a.sortOrder : a.sortOrder - b.sortOrder;
  })[0];
}

function pickFallbackWindow(args: {
  candidates: PlanWindowCandidate[];
  used: Set<string>;
  studyWindow: StudyWindow;
  preferAfterDay?: boolean;
  preferLate?: boolean;
  skipAfterDay?: boolean;
}) {
  const available = args.candidates.filter((item) => !args.used.has(item.key));
  if (available.length === 0) {
    return args.candidates[args.candidates.length - 1];
  }

  if (args.preferAfterDay) {
    const afterDay = available.find((item) => item.kind === "after-day");
    if (afterDay) return afterDay;
  }

  let filtered = available;
  if (args.skipAfterDay) {
    filtered = filtered.filter((item) => item.kind !== "after-day");
  }
  if (filtered.length === 0) filtered = available;

  if (args.preferLate) {
    return [...filtered].sort((a, b) => b.sortOrder - a.sortOrder)[0];
  }

  return (
    pickWindowNearTarget(
      filtered,
      getPreferenceTargetOrder(args.studyWindow, !args.skipAfterDay),
      args.studyWindow === "evening",
    ) ?? filtered[0]
  );
}

function choosePlanWindow(args: {
  block: EditableScheduleBlock;
  classes: ScheduleClassSession[];
  candidates: PlanWindowCandidate[];
  used: Set<string>;
  studyWindow: StudyWindow;
  deadlineSoon: boolean;
}) {
  const available = args.candidates.filter((item) => !args.used.has(item.key));
  if (available.length === 0) {
    return args.candidates[args.candidates.length - 1];
  }

  const relevantSlot = getRelevantClassSlot(args.block.skill, args.classes);
  if (relevantSlot && args.block.type !== "memory") {
    const alignedWindow =
      available.find(
        (item) =>
          item.slot === relevantSlot &&
          (item.kind === "after-class" || item.kind === "after-day"),
      ) ?? available.find((item) => item.slot === relevantSlot && item.kind === "free-slot");

    if (alignedWindow) return alignedWindow;
  }

  if (args.block.type === "memory") {
    return pickFallbackWindow({
      candidates: args.candidates,
      used: args.used,
      studyWindow: args.studyWindow,
      preferAfterDay: true,
      preferLate: true,
    });
  }

  if (args.block.type === "anchor" && args.deadlineSoon) {
    return pickFallbackWindow({
      candidates: args.candidates,
      used: args.used,
      studyWindow: args.studyWindow,
      preferLate: true,
    });
  }

  if (args.block.type === "support") {
    return pickFallbackWindow({
      candidates: args.candidates,
      used: args.used,
      studyWindow: args.studyWindow,
      skipAfterDay: true,
    });
  }

  return pickFallbackWindow({
    candidates: args.candidates,
    used: args.used,
    studyWindow: args.studyWindow,
  });
}

function assignPlanWindowLabels(args: {
  blocks: EditableScheduleBlock[];
  classes: ScheduleClassSession[];
  locale: Locale;
  studyWindow: StudyWindow;
  deadlineSoon: boolean;
}) {
  const candidates = buildPlanWindowCandidates(args.classes, args.locale);
  const used = new Set<string>();

  return args.blocks.map((block) => {
    const chosen =
      choosePlanWindow({
        block,
        classes: args.classes,
        candidates,
        used,
        studyWindow: args.studyWindow,
        deadlineSoon: args.deadlineSoon,
      }) ?? candidates[candidates.length - 1];

    if (!chosen) {
      return getAfterSlotLabel("09-10", args.locale);
    }

    used.add(chosen.key);
    return chosen.label;
  });
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
  type: ScheduleBlockType;
  title: string;
  skill: ScheduleSkill;
  minutes: number;
  reason: string;
  level: string;
  locale: Locale;
  timeLabel: string;
}): ScheduleBlock {
  return {
    id: args.id,
    type: args.type,
    title: args.title,
    skill: args.skill,
    minutes: args.minutes,
    reason: args.reason,
    href: resolveBlockHref(args.skill, args.level, args.locale),
    timeLabel: args.timeLabel,
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
  planOverrides?: ScheduleDayPlanOverride[];
  useGeneratedFallback?: boolean;
}): WeeklySchedule {
  const referenceDate = toDateAtStart(input.referenceDate ?? new Date());
  const weekStart = getWeekStart(referenceDate);
  const level = normalizeLevel(input.level);
  const orderedSkills = getSkillNeedOrder(input.snapshot).map((item) => item.skill);
  const primarySkill = getGoalPrimarySkill(input.preferences.goal);
  const weakestSkill = orderedSkills[0] ?? "speaking";
  const rotation = getRotation(input.preferences.goal);
  const weekMode = determineWeekMode(input.preferences, input.reviewDue, referenceDate);
  const planOverrideMap = new Map(
    (input.planOverrides ?? input.preferences.planOverrides).map((item) => [item.day, item.blocks]),
  );

  const days: DailySchedule[] = Array.from({ length: 7 }, (_, day) => {
    const currentDate = addDays(weekStart, day);
    const dateISO = formatISODate(currentDate);
    const classes = input.preferences.classes
      .filter((item) => item.day === day)
      .sort(compareScheduleClasses);
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

    const autoBlocks: EditableScheduleBlock[] = [
      {
        id: `${dateISO}-anchor`,
        type: "anchor",
        title: getAnchorTitle(anchorSkill, input.locale, classes[0]?.type, Boolean(soonestDeadline)),
        skill: anchorSkill,
        minutes: anchorMinutes,
        reason: anchorReason,
      },
      {
        id: `${dateISO}-support`,
        type: "support",
        title: getSupportTitle(supportSkill, input.locale),
        skill: supportSkill,
        minutes: supportMinutes,
        reason: getSupportReason(supportSkill === weakestSkill, input.locale),
      },
      {
        id: `${dateISO}-memory`,
        type: "memory",
        title: getMemoryTitle(input.locale),
        skill: "review",
        minutes: memoryMinutes,
        reason: getReviewReason(input.reviewDue, input.locale),
      },
    ];
    const blockTemplates =
      planOverrideMap.get(day) ?? (input.useGeneratedFallback === false ? [] : autoBlocks);
    const timeLabels = assignPlanWindowLabels({
      blocks: blockTemplates,
      classes,
      locale: input.locale,
      studyWindow: input.preferences.studyWindow,
      deadlineSoon: Boolean(soonestDeadline),
    });
    const blocks: ScheduleBlock[] = blockTemplates.map((block, index) =>
      createBlock({
        id: block.id,
        type: block.type,
        title: block.title,
        skill: block.skill,
        minutes: block.minutes,
        reason: block.reason,
        level,
        locale: input.locale,
        timeLabel: timeLabels[index] ?? getAfterSlotLabel("09-10", input.locale),
      }),
    );

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
      isManual: planOverrideMap.has(day),
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
