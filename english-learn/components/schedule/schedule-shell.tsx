"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  CalendarClock,
  ChevronDown,
  FileSpreadsheet,
  Headphones,
  ImageUp,
  Mic,
  PenTool,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale } from "@/lib/i18n/dictionaries";
import {
  createEmptyLearningTrackerSnapshot,
  loadLearningTrackerSnapshotFromStorage,
  subscribeLearningTracker,
  type TrackedSkill,
} from "@/lib/learning-tracker";
import {
  compareScheduleClasses,
  createEditableScheduleBlock,
  createDefaultSchedulePreferences,
  createScheduleClassSession,
  createScheduleDeadline,
  generateWeeklySchedule,
  getScheduleSlotDefaultTime,
  loadSchedulePreferencesFromStorage,
  saveSchedulePreferencesToStorage,
  SCHEDULE_TIME_SLOTS,
  subscribeSchedulePreferences,
  type EditableScheduleBlock,
  type ScheduleBlock,
  type ScheduleBlockType,
  type ScheduleClassSession,
  type ScheduleClassType,
  type ScheduleDeadline,
  type ScheduleGoal,
  type ScheduleMode,
  type SchedulePreferences,
  type ScheduleSkill,
  type ScheduleSlotId,
  type ScheduleWeekMode,
  type StudyWindow,
} from "@/lib/schedule";

const TRACKED_SKILLS: TrackedSkill[] = ["listening", "speaking", "reading", "writing"];
const PLAN_SKILLS: ScheduleSkill[] = ["listening", "speaking", "reading", "writing", "review"];
const WEEKDAY_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;
const dayLabels = {
  zh: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
} as const;
const classTypeOptions = [
  { value: "lecture", label: { zh: "课程", en: "Lecture" } },
  { value: "seminar", label: { zh: "研讨", en: "Seminar" } },
  { value: "lab", label: { zh: "实验", en: "Lab" } },
] as const;
const weekModeLabels: Record<ScheduleWeekMode, { zh: string; en: string }> = {
  normal: { zh: "常规周", en: "Normal week" },
  "heavy-reading": { zh: "阅读周", en: "Reading week" },
  presentation: { zh: "展示周", en: "Presentation week" },
  "deadline-rescue": { zh: "赶 due 周", en: "Deadline week" },
  recovery: { zh: "缓冲周", en: "Recovery week" },
};
const classTone = {
  lecture: "bg-[#ff8a3d] text-white",
  seminar: "bg-[#6b58d6] text-white",
  lab: "bg-[#21b7c8] text-white",
} satisfies Record<ScheduleClassType, string>;
const skillMeta = {
  listening: { label: { zh: "听力", en: "Listening" }, Icon: Headphones },
  speaking: { label: { zh: "口语", en: "Speaking" }, Icon: Mic },
  reading: { label: { zh: "阅读", en: "Reading" }, Icon: BookOpenText },
  writing: { label: { zh: "写作", en: "Writing" }, Icon: PenTool },
  review: { label: { zh: "复习", en: "Review" }, Icon: BrainCircuit },
} as const;

const compactInputCls =
  "w-full rounded-[0.9rem] border border-[rgba(20,50,75,0.14)] bg-white/90 px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[rgba(28,78,149,0.28)] focus:ring-2 focus:ring-[rgba(28,78,149,0.08)]";

type ClassDraft = {
  id: string | null;
  title: string;
  day: number;
  slot: ScheduleSlotId;
  type: ScheduleClassType;
  time: string;
};

type DeadlineDraft = {
  title: string;
  dueDate: string;
  skill: TrackedSkill;
};

type BlockDraft = {
  id: string | null;
  day: number;
  type: ScheduleBlockType;
  title: string;
  skill: ScheduleSkill;
  minutes: number;
  reason: string;
};

type ImportState = {
  tone: "idle" | "success" | "error";
  message: string;
  warnings: string[];
};

function normalizeLevel(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  return ["A1", "A2", "B1", "B2", "C1", "C2"].includes(next) ? next : "A2";
}

function chip(active: boolean) {
  return `rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
    active
      ? "border-[var(--navy)] bg-[var(--navy)] text-[#f7efe3]"
      : "border-[rgba(20,50,75,0.14)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.06)]"
  }`;
}

function getDefaultDeadlineDate() {
  const next = new Date();
  next.setDate(next.getDate() + 3);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
}

function createEmptyClassDraft(day = 0, slot: ScheduleSlotId = "03-04"): ClassDraft {
  return {
    id: null,
    title: "",
    day,
    slot,
    type: "lecture",
    time: getScheduleSlotDefaultTime(slot),
  };
}

function createEmptyDeadlineDraft(): DeadlineDraft {
  return {
    title: "",
    dueDate: getDefaultDeadlineDate(),
    skill: "writing",
  };
}

function toEditableBlock(block: ScheduleBlock): EditableScheduleBlock {
  return {
    id: block.id,
    type: block.type,
    title: block.title,
    skill: block.skill,
    minutes: block.minutes,
    reason: block.reason,
  };
}

function createEmptyBlockDraft(day = 0): BlockDraft {
  return {
    id: null,
    day,
    type: "custom",
    title: "",
    skill: "reading",
    minutes: 15,
    reason: "",
  };
}

function formatDateLabel(dateISO: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: locale === "zh" ? "numeric" : "short",
    day: "numeric",
  }).format(new Date(`${dateISO}T00:00:00`));
}

function pressureTone(pressure: number) {
  if (pressure <= 35) return { dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-700" };
  if (pressure <= 55) return { dot: "bg-amber-400", pill: "bg-amber-50 text-amber-700" };
  if (pressure <= 72) return { dot: "bg-orange-400", pill: "bg-orange-50 text-orange-700" };
  return { dot: "bg-red-400", pill: "bg-red-50 text-red-700" };
}

function buildImportState(
  tone: ImportState["tone"],
  message: string,
  warnings: string[] = [],
): ImportState {
  return { tone, message, warnings };
}

export function ScheduleShell({ locale }: { locale: Locale }) {
  const [level, setLevel] = useState("A2");
  const [snapshot, setSnapshot] = useState(() => createEmptyLearningTrackerSnapshot());
  const [preferences, setPreferences] = useState<SchedulePreferences>(() =>
    createDefaultSchedulePreferences(new Date(), locale),
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [classDraft, setClassDraft] = useState<ClassDraft>(() => createEmptyClassDraft());
  const [deadlineDraft, setDeadlineDraft] = useState<DeadlineDraft>(() => createEmptyDeadlineDraft());
  const [blockDraft, setBlockDraft] = useState<BlockDraft>(() => createEmptyBlockDraft());
  const [importState, setImportState] = useState<ImportState>(() => buildImportState("idle", "", []));
  const [excelLoading, setExcelLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const excelInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const copy =
    locale === "zh"
      ? {
          title: "学习计划",
          savedLabel: "本地保存",
          goalLabel: "目标",
          goals: { coursework: "课程作业", research: "学术研究", seminar: "研讨发言" },
          minutesLabel: "每日时长",
          modeLabel: "强度",
          modes: { light: "轻量", standard: "标准", intensive: "强化" },
          windowLabel: "学习时段",
          windows: { early: "早晨", midday: "中午", evening: "晚上" },
          weekTarget: "本周总量",
          weekMode: "周模式",
          weekFocus: "当前重点",
          todayTitle: "今天重点",
          todayBadge: "今天",
          timetableTitle: "课表",
          timetableHint: "点击单元格可快速录入课程，也可以直接导入图片或 Excel。",
          imageImport: "图片识别课程表",
          excelImport: "Excel 导入",
          importReady: "已导入课程表。",
          importFailed: "导入失败，请检查文件内容。",
          importRunningImage: "正在识别图片课程表…",
          importRunningExcel: "正在导入 Excel 课程表…",
          manualEdit: "手动编辑",
          classNamePlaceholder: "课程名称",
          classTimeLabel: "时间",
          classTypeLabel: "类型",
          weekdayLabel: "星期",
          slotLabel: "节次",
          addClass: "添加课程",
          updateClass: "更新课程",
          cancelEdit: "取消",
          noClassInCell: "空",
          deadlinesTitle: "截止任务",
          deadlineHint: "截止任务会直接影响系统给出的本周自动安排。",
          deadlineNamePlaceholder: "任务名称",
          deadlineDateLabel: "截止日期",
          deadlineSkillLabel: "关联技能",
          addDeadline: "添加任务",
          remove: "删除",
          weekTitle: "本周安排",
          weekHint: "系统会自动生成安排，默认只显示星期，点击当天后展开详情。",
          autoPlan: "自动生成",
          dateLabel: "日期",
          pressureLabel: "压力",
          classesCount: "课程",
          deadlinesCount: "任务",
          start: "开始",
          minuteShort: "分钟",
          noDeadlines: "还没有截止任务",
        }
      : {
          title: "Schedule",
          savedLabel: "Saved locally",
          goalLabel: "Goal",
          goals: { coursework: "Coursework", research: "Research", seminar: "Seminar" },
          minutesLabel: "Daily time",
          modeLabel: "Intensity",
          modes: { light: "Light", standard: "Standard", intensive: "Intensive" },
          windowLabel: "Study window",
          windows: { early: "Morning", midday: "Midday", evening: "Evening" },
          weekTarget: "Weekly target",
          weekMode: "Week mode",
          weekFocus: "Current focus",
          todayTitle: "Today focus",
          todayBadge: "Today",
          timetableTitle: "Timetable",
          timetableHint: "Click a cell to add a class, or import the whole timetable from an image or Excel file.",
          imageImport: "Recognize from image",
          excelImport: "Import Excel",
          importReady: "Timetable imported.",
          importFailed: "Import failed. Please check the file contents.",
          importRunningImage: "Recognizing timetable image...",
          importRunningExcel: "Importing Excel timetable...",
          manualEdit: "Manual edit",
          classNamePlaceholder: "Class name",
          classTimeLabel: "Time",
          classTypeLabel: "Type",
          weekdayLabel: "Weekday",
          slotLabel: "Slot",
          addClass: "Add class",
          updateClass: "Update class",
          cancelEdit: "Cancel",
          noClassInCell: "Empty",
          deadlinesTitle: "Deadlines",
          deadlineHint: "Deadlines feed directly into the auto-generated weekly plan.",
          deadlineNamePlaceholder: "Task name",
          deadlineDateLabel: "Due date",
          deadlineSkillLabel: "Skill",
          addDeadline: "Add deadline",
          remove: "Remove",
          weekTitle: "This week",
          weekHint: "The schedule is generated automatically. Open a weekday to inspect and edit the plan.",
          autoPlan: "Auto plan",
          manualPlan: "Manual",
          editPlan: "Edit plan",
          taskTitlePlaceholder: "Task title",
          taskReasonPlaceholder: "Why this task",
          taskMinutesLabel: "Minutes",
          taskSkillLabel: "Skill",
          saveTask: "Save",
          addTask: "Add task",
          resetDay: "Reset day",
          dateLabel: "Date",
          pressureLabel: "Pressure",
          classesCount: "Classes",
          deadlinesCount: "Tasks",
          start: "Start",
          minuteShort: "min",
          noDeadlines: "No deadlines yet",
        };

  useEffect(() => {
    const refreshProfile = () => {
      setLevel(normalizeLevel(localStorage.getItem("demo_level")));
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
    };
    const refreshPreferences = () => setPreferences(loadSchedulePreferencesFromStorage(locale));

    refreshProfile();
    refreshPreferences();

    const offTracker = subscribeLearningTracker(refreshProfile);
    const offSchedule = subscribeSchedulePreferences(refreshPreferences);

    window.addEventListener("storage", refreshProfile);
    window.addEventListener("demo-placement-changed", refreshProfile as EventListener);

    return () => {
      offTracker();
      offSchedule();
      window.removeEventListener("storage", refreshProfile);
      window.removeEventListener("demo-placement-changed", refreshProfile as EventListener);
    };
  }, [locale]);

  const weeklySchedule = useMemo(
    () =>
      generateWeeklySchedule({
        preferences,
        snapshot,
        reviewDue: 0,
        locale,
        level,
      }),
    [preferences, snapshot, locale, level],
  );

  const todaySchedule = weeklySchedule.days.find((day) => day.isToday) ?? weeklySchedule.days[0];

  const timetableMap = useMemo(() => {
    const next = new Map<string, ScheduleClassSession[]>();
    for (const item of [...preferences.classes].sort(compareScheduleClasses)) {
      const key = `${item.day}-${item.slot}`;
      next.set(key, [...(next.get(key) ?? []), item]);
    }
    return next;
  }, [preferences.classes]);
  const scheduleText =
    locale === "zh"
      ? {
          manualPlan: "\u624b\u52a8\u8c03\u6574",
          editPlan: "\u7f16\u8f91\u8ba1\u5212",
          taskTitlePlaceholder: "\u4efb\u52a1\u6807\u9898",
          taskReasonPlaceholder: "\u5b89\u6392\u539f\u56e0",
          taskMinutesLabel: "\u65f6\u957f",
          taskSkillLabel: "\u6280\u80fd",
          saveTask: "\u4fdd\u5b58",
          addTask: "\u65b0\u589e\u4efb\u52a1",
          resetDay: "\u6062\u590d\u81ea\u52a8",
        }
      : {
          manualPlan: "Manual",
          editPlan: "Edit plan",
          taskTitlePlaceholder: "Task title",
          taskReasonPlaceholder: "Why this task",
          taskMinutesLabel: "Minutes",
          taskSkillLabel: "Skill",
          saveTask: "Save",
          addTask: "Add task",
          resetDay: "Reset day",
        };

  function getDayPlanBlocks(daySchedule: (typeof weeklySchedule.days)[number]) {
    const override = preferences.planOverrides.find((item) => item.day === daySchedule.day);
    return override?.blocks ?? daySchedule.blocks.map(toEditableBlock);
  }

  function updatePreferences(partial: Partial<SchedulePreferences>) {
    setPreferences((current) =>
      saveSchedulePreferencesToStorage({
        ...current,
        ...partial,
        updatedAt: new Date().toISOString(),
      }),
    );
  }

  function saveDayPlanBlocks(day: number, blocks: EditableScheduleBlock[]) {
    const nextOverrides = preferences.planOverrides.filter((item) => item.day !== day);
    if (blocks.length > 0) {
      nextOverrides.push({ day, blocks });
    }

    updatePreferences({
      planOverrides: nextOverrides.sort((a, b) => a.day - b.day),
    });
  }

  function beginCreateClass(day: number, slot: ScheduleSlotId) {
    setClassDraft(createEmptyClassDraft(day, slot));
  }

  function beginEditClass(item: ScheduleClassSession) {
    setClassDraft({
      id: item.id,
      title: item.title,
      day: item.day,
      slot: item.slot,
      type: item.type,
      time: item.time,
    });
  }

  function cancelClassEdit() {
    setClassDraft(createEmptyClassDraft(classDraft.day, classDraft.slot));
  }

  function submitClass() {
    const title = classDraft.title.trim();
    if (!title) return;

    if (classDraft.id) {
      updatePreferences({
        classes: preferences.classes.map((item) =>
          item.id === classDraft.id
            ? {
                ...item,
                title,
                day: classDraft.day,
                slot: classDraft.slot,
                type: classDraft.type,
                time: classDraft.time,
              }
            : item,
        ),
      });
    } else {
      updatePreferences({
        classes: [
          ...preferences.classes,
          createScheduleClassSession({
            title,
            day: classDraft.day,
            slot: classDraft.slot,
            type: classDraft.type,
            time: classDraft.time,
          }),
        ],
      });
    }

    setClassDraft(createEmptyClassDraft(classDraft.day, classDraft.slot));
  }

  function removeClass(id: string) {
    updatePreferences({
      classes: preferences.classes.filter((item) => item.id !== id),
    });
    if (classDraft.id === id) {
      setClassDraft(createEmptyClassDraft(classDraft.day, classDraft.slot));
    }
  }

  function updateDeadline(id: string, partial: Partial<ScheduleDeadline>) {
    updatePreferences({
      deadlines: preferences.deadlines.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    });
  }

  function removeDeadline(id: string) {
    updatePreferences({
      deadlines: preferences.deadlines.filter((item) => item.id !== id),
    });
  }

  function addDeadline() {
    const title = deadlineDraft.title.trim();
    if (!title) return;

    updatePreferences({
      deadlines: [
        ...preferences.deadlines,
        createScheduleDeadline({
          title,
          dueDate: deadlineDraft.dueDate,
          skill: deadlineDraft.skill,
        }),
      ],
    });
    setDeadlineDraft(createEmptyDeadlineDraft());
  }

  function beginCreateBlock(day: number) {
    setBlockDraft(createEmptyBlockDraft(day));
  }

  function beginEditBlock(day: number, block: ScheduleBlock) {
    setBlockDraft({
      id: block.id,
      day,
      type: block.type,
      title: block.title,
      skill: block.skill,
      minutes: block.minutes,
      reason: block.reason,
    });
  }

  function cancelBlockEdit(day = blockDraft.day) {
    setBlockDraft(createEmptyBlockDraft(day));
  }

  function submitBlock(daySchedule: (typeof weeklySchedule.days)[number]) {
    const title = blockDraft.title.trim();
    const reason = blockDraft.reason.trim();
    if (!title || !reason) return;

    const currentBlocks = getDayPlanBlocks(daySchedule);
    const nextBlocks = blockDraft.id
      ? currentBlocks.map((item) =>
          item.id === blockDraft.id
            ? {
                ...item,
                title,
                skill: blockDraft.skill,
                minutes: blockDraft.minutes,
                reason,
              }
            : item,
        )
      : [
          ...currentBlocks,
          createEditableScheduleBlock({
            type: blockDraft.type,
            title,
            skill: blockDraft.skill,
            minutes: blockDraft.minutes,
            reason,
          }),
        ];

    saveDayPlanBlocks(daySchedule.day, nextBlocks);
    setBlockDraft(createEmptyBlockDraft(daySchedule.day));
  }

  function removeDayBlock(daySchedule: (typeof weeklySchedule.days)[number], blockId: string) {
    const nextBlocks = getDayPlanBlocks(daySchedule).filter((item) => item.id !== blockId);
    saveDayPlanBlocks(daySchedule.day, nextBlocks);
    if (blockDraft.id === blockId || blockDraft.day === daySchedule.day) {
      setBlockDraft(createEmptyBlockDraft(daySchedule.day));
    }
  }

  function resetDayPlan(day: number) {
    updatePreferences({
      planOverrides: preferences.planOverrides.filter((item) => item.day !== day),
    });
    if (blockDraft.day === day) {
      setBlockDraft(createEmptyBlockDraft(day));
    }
  }

  async function applyImportedClasses(file: File, endpoint: string, loadingKind: "image" | "excel") {
    if (loadingKind === "image") {
      setImageLoading(true);
      setImportState(buildImportState("idle", copy.importRunningImage));
    } else {
      setExcelLoading(true);
      setImportState(buildImportState("idle", copy.importRunningExcel));
    }

    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            classes?: Array<{
              title: string;
              day: number;
              slot: ScheduleSlotId;
              type: ScheduleClassType;
              time?: string;
            }>;
            warnings?: string[];
          }
        | null;

      if (!response.ok || !payload || !Array.isArray(payload.classes) || payload.classes.length === 0) {
        setImportState(
          buildImportState("error", payload?.error || copy.importFailed, Array.isArray(payload?.warnings) ? payload.warnings : []),
        );
        return;
      }

      updatePreferences({
        classes: payload.classes.map((item) =>
          createScheduleClassSession({
            title: item.title,
            day: item.day,
            slot: item.slot,
            type: item.type,
            time: item.time || getScheduleSlotDefaultTime(item.slot),
          }),
        ),
      });

      setImportState(
        buildImportState("success", copy.importReady, Array.isArray(payload.warnings) ? payload.warnings : []),
      );
      const first = payload.classes[0];
      setClassDraft(createEmptyClassDraft(first.day, first.slot));
    } catch {
      setImportState(buildImportState("error", copy.importFailed));
    } finally {
      if (loadingKind === "image") {
        setImageLoading(false);
      } else {
        setExcelLoading(false);
      }
    }
  }

  async function onExcelFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await applyImportedClasses(file, "/api/schedule/import-excel", "excel");
    event.target.value = "";
  }

  async function onImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await applyImportedClasses(file, "/api/schedule/import-image", "image");
    event.target.value = "";
  }

  return (
    <section className="mt-6 grid gap-5 reveal-up">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageFileChange}
      />
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={onExcelFileChange}
      />

      <article className="surface-panel rounded-[2rem] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">{copy.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatPill label={copy.weekTarget} value={`${weeklySchedule.weeklyTargetMinutes} ${copy.minuteShort}`} />
              <StatPill label={copy.weekMode} value={weekModeLabels[weeklySchedule.weekMode][locale]} />
              <StatPill
                label={copy.weekFocus}
                value={`${skillMeta[weeklySchedule.primarySkill].label[locale]} / ${skillMeta[weeklySchedule.weakestSkill].label[locale]}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink-soft)] sm:inline-flex">
              {copy.savedLabel}
            </span>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PrefRow label={copy.goalLabel}>
            {(["coursework", "research", "seminar"] as ScheduleGoal[]).map((goal) => (
              <button key={goal} className={chip(preferences.goal === goal)} onClick={() => updatePreferences({ goal })} type="button">
                {copy.goals[goal]}
              </button>
            ))}
          </PrefRow>
          <PrefRow label={copy.minutesLabel}>
            {[20, 35, 50].map((minutes) => (
              <button key={minutes} className={chip(preferences.dailyMinutes === minutes)} onClick={() => updatePreferences({ dailyMinutes: minutes })} type="button">
                {minutes} {copy.minuteShort}
              </button>
            ))}
          </PrefRow>
          <PrefRow label={copy.modeLabel}>
            {(["light", "standard", "intensive"] as ScheduleMode[]).map((mode) => (
              <button key={mode} className={chip(preferences.mode === mode)} onClick={() => updatePreferences({ mode })} type="button">
                {copy.modes[mode]}
              </button>
            ))}
          </PrefRow>
          <PrefRow label={copy.windowLabel}>
            {(["early", "midday", "evening"] as StudyWindow[]).map((windowOption) => (
              <button key={windowOption} className={chip(preferences.studyWindow === windowOption)} onClick={() => updatePreferences({ studyWindow: windowOption })} type="button">
                {copy.windows[windowOption]}
              </button>
            ))}
          </PrefRow>
        </div>
      </article>

      {todaySchedule ? (
        <article className="surface-panel rounded-[2rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-3xl tracking-tight text-[var(--ink)]">{copy.todayTitle}</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {dayLabels[locale][todaySchedule.day]} · {formatDateLabel(todaySchedule.dateISO, locale)}
              </p>
            </div>
            <span className="rounded-full bg-[var(--navy)] px-3 py-1 text-xs font-semibold text-[#f7efe3]">
              {copy.todayBadge}
            </span>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {todaySchedule.blocks.map((block) => {
              const meta = skillMeta[block.skill];
              const Icon = meta.Icon;
              return (
                <Link key={block.id} href={block.href} className="rounded-[1.4rem] border border-[rgba(20,50,75,0.1)] bg-white/82 p-4 transition hover:translate-y-[-2px] hover:bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(20,50,75,0.06)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                      <Icon className="size-3.5" />
                      {meta.label[locale]}
                    </span>
                    <span className="text-xs font-semibold text-[var(--ink-soft)]">{block.timeLabel}</span>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-[var(--ink)]">{block.title}</h4>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{block.reason}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--navy)]">
                    {copy.start}
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </article>
      ) : null}

      <article className="surface-panel rounded-[2rem] p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-[1.85rem] tracking-tight text-[var(--ink)]">{copy.timetableTitle}</h3>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.timetableHint}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px] disabled:opacity-60"
              disabled={imageLoading}
            >
              <ImageUp className="size-4" />
              {copy.imageImport}
            </button>
            <button
              type="button"
              onClick={() => excelInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.14)] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.06)] disabled:opacity-60"
              disabled={excelLoading}
            >
              <FileSpreadsheet className="size-4" />
              {copy.excelImport}
            </button>
          </div>
        </div>

        {importState.message ? <ImportNotice state={importState} /> : null}

        <div className="mt-4 overflow-x-auto rounded-[1.35rem] border border-[rgba(20,50,75,0.08)] bg-white/82">
          <table className="min-w-[760px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[rgba(20,50,75,0.05)] text-[var(--ink)]">
                <th className="border-b border-r border-[rgba(20,50,75,0.08)] px-3 py-2.5 text-left font-semibold">
                  {copy.slotLabel}
                </th>
                {WEEKDAY_ORDER.map((day) => (
                  <th key={day} className="border-b border-[rgba(20,50,75,0.08)] px-3 py-2.5 text-left font-semibold">
                    {dayLabels[locale][day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE_TIME_SLOTS.map((slot) => (
                <tr key={slot.id}>
                  <td className="border-r border-t border-[rgba(20,50,75,0.08)] px-3 py-3 font-semibold text-[var(--ink)]">
                    {slot.label[locale]}
                  </td>
                  {WEEKDAY_ORDER.map((day) => {
                    const cellItems = timetableMap.get(`${day}-${slot.id}`) ?? [];
                    return (
                      <td key={`${day}-${slot.id}`} className="border-t border-[rgba(20,50,75,0.08)] p-1.5 align-top">
                        <div
                          className={`min-h-[72px] rounded-[0.95rem] border p-1.5 transition ${
                            classDraft.day === day && classDraft.slot === slot.id
                              ? "border-[rgba(28,78,149,0.24)] bg-[rgba(28,78,149,0.06)]"
                              : "border-transparent bg-[rgba(20,50,75,0.02)] hover:border-[rgba(20,50,75,0.12)]"
                          }`}
                          onClick={() => beginCreateClass(day, slot.id)}
                        >
                          <div className="grid gap-2">
                            {cellItems.length === 0 ? (
                              <span className="text-xs text-[var(--ink-soft)]">{copy.noClassInCell}</span>
                            ) : (
                              cellItems.map((item) => (
                                <div
                                  key={item.id}
                                  className={`flex items-start gap-2 rounded-[0.85rem] px-2.5 py-1.5 ${classTone[item.type]}`}
                                >
                                  <button type="button" className="min-w-0 flex-1 text-left text-xs font-semibold leading-5" onClick={(event) => { event.stopPropagation(); beginEditClass(item); }}>
                                    <span className="block truncate">{item.title}</span>
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={copy.remove}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      removeClass(item.id);
                                    }}
                                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
                                  >
                                    <X className="size-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-[rgba(20,50,75,0.08)] bg-white/72 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ink)]">{copy.manualEdit}</h4>
            {classDraft.id ? (
              <button type="button" onClick={cancelClassEdit} className="text-sm font-semibold text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
                {copy.cancelEdit}
              </button>
            ) : null}
          </div>
          <div className="mt-3 grid gap-2.5 lg:grid-cols-[1.4fr_repeat(4,minmax(0,0.72fr))_auto]">
            <input
              value={classDraft.title}
              onChange={(event) => setClassDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder={copy.classNamePlaceholder}
              className={compactInputCls}
            />
            <select
              value={classDraft.day}
              onChange={(event) => setClassDraft((current) => ({ ...current, day: Number(event.target.value) }))}
              className={compactInputCls}
            >
              {dayLabels[locale].map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={classDraft.slot}
              onChange={(event) =>
                setClassDraft((current) => ({
                  ...current,
                  slot: event.target.value as ScheduleSlotId,
                  time: getScheduleSlotDefaultTime(event.target.value as ScheduleSlotId),
                }))
              }
              className={compactInputCls}
            >
              {SCHEDULE_TIME_SLOTS.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label[locale]}
                </option>
              ))}
            </select>
            <select
              value={classDraft.type}
              onChange={(event) => setClassDraft((current) => ({ ...current, type: event.target.value as ScheduleClassType }))}
              className={compactInputCls}
            >
              {classTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label[locale]}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={classDraft.time}
              onChange={(event) => setClassDraft((current) => ({ ...current, time: event.target.value }))}
              className={compactInputCls}
            />
            <button type="button" onClick={submitClass} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]">
              <Plus className="size-4" />
              {classDraft.id ? copy.updateClass : copy.addClass}
            </button>
          </div>
        </div>
      </article>

      <article className="surface-panel rounded-[2rem] p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-[1.85rem] tracking-tight text-[var(--ink)]">{copy.deadlinesTitle}</h3>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.deadlineHint}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {preferences.deadlines.length === 0 ? (
            <EmptyHint text={copy.noDeadlines} />
          ) : (
            [...preferences.deadlines]
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .map((item) => (
                <EditableDeadlineRow
                  key={item.id}
                  item={item}
                  locale={locale}
                  removeLabel={copy.remove}
                  onRemove={() => removeDeadline(item.id)}
                  onSave={(partial) => updateDeadline(item.id, partial)}
                />
              ))
          )}
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-[rgba(20,50,75,0.08)] bg-white/72 p-3.5">
          <div className="grid gap-2.5 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
            <input
              value={deadlineDraft.title}
              onChange={(event) => setDeadlineDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder={copy.deadlineNamePlaceholder}
              className={compactInputCls}
            />
            <input
              type="date"
              value={deadlineDraft.dueDate}
              onChange={(event) => setDeadlineDraft((current) => ({ ...current, dueDate: event.target.value }))}
              className={compactInputCls}
            />
            <select
              value={deadlineDraft.skill}
              onChange={(event) => setDeadlineDraft((current) => ({ ...current, skill: event.target.value as TrackedSkill }))}
              className={compactInputCls}
            >
              {TRACKED_SKILLS.map((skill) => (
                <option key={skill} value={skill}>
                  {skillMeta[skill].label[locale]}
                </option>
              ))}
            </select>
            <button type="button" onClick={addDeadline} className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,50,75,0.14)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.06)]">
              <CalendarClock className="size-4" />
              {copy.addDeadline}
            </button>
          </div>
        </div>
      </article>

      <article className="surface-panel rounded-[2rem] p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-[1.85rem] tracking-tight text-[var(--ink)]">{copy.weekTitle}</h3>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.weekHint}</p>
          </div>
          <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
            {copy.autoPlan}
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {weeklySchedule.days.map((day) => {
            const isExpanded = expandedDay === day.day;
            const pressure = pressureTone(day.pressure);
            const isEditingDay = blockDraft.day === day.day;
            return (
              <article key={day.dateISO} className={`rounded-[1.4rem] border transition ${isExpanded ? "border-[rgba(28,78,149,0.2)] bg-[rgba(28,78,149,0.05)]" : "border-[rgba(20,50,75,0.1)] bg-white/78"}`}>
                <button type="button" onClick={() => setExpandedDay(isExpanded ? null : day.day)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className={`size-2.5 rounded-full ${pressure.dot}`} />
                    <span className="font-display text-2xl tracking-tight text-[var(--ink)]">{dayLabels[locale][day.day]}</span>
                    {day.isToday ? <span className="rounded-full bg-[var(--navy)] px-2.5 py-1 text-[10px] font-semibold text-[#f7efe3]">{copy.todayBadge}</span> : null}
                  </div>
                  <ChevronDown className={`size-5 text-[var(--ink-soft)] transition ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                {isExpanded ? (
                  <div className="border-t border-[rgba(20,50,75,0.08)] px-4 pb-4 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <InlineMeta label={copy.dateLabel} value={formatDateLabel(day.dateISO, locale)} />
                      <InlineMeta label={copy.pressureLabel} value={String(day.pressure)} toneClass={pressure.pill} />
                      <InlineMeta label={copy.weekTarget} value={`${day.targetMinutes} ${copy.minuteShort}`} />
                      <InlineMeta label={copy.classesCount} value={String(day.classes.length)} />
                      <InlineMeta label={copy.deadlinesCount} value={String(day.deadlines.length)} />
                      <InlineMeta label={copy.weekTitle} value={day.isManual ? scheduleText.manualPlan : copy.autoPlan} />
                    </div>

                    <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_19rem]">
                      <div className="grid gap-2.5">
                        {day.blocks.map((block) => {
                        const meta = skillMeta[block.skill];
                        const Icon = meta.Icon;
                        return (
                          <article
                            key={block.id}
                            className={`rounded-[1.15rem] border p-3 transition ${isEditingDay && blockDraft.id === block.id ? "border-[rgba(28,78,149,0.2)] bg-[rgba(28,78,149,0.06)]" : "border-[rgba(20,50,75,0.08)] bg-white/88"}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(20,50,75,0.06)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)]">
                                <Icon className="size-3.5" />
                                {meta.label[locale]}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-[var(--ink-soft)]">{block.timeLabel}</span>
                                <button
                                  type="button"
                                  onClick={() => beginEditBlock(day.day, block)}
                                  className="rounded-full border border-[rgba(20,50,75,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                                >
                                  {scheduleText.editPlan}
                                </button>
                              </div>
                            </div>
                            <div className="mt-2.5 flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-semibold text-[var(--ink)]">{block.title}</h4>
                                <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{block.reason}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={block.href}
                                  className="inline-flex items-center gap-1 rounded-full bg-[rgba(20,50,75,0.06)] px-2.5 py-1 text-[11px] font-semibold text-[var(--navy)]"
                                >
                                  {copy.start}
                                  <ArrowRight className="size-3.5" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => removeDayBlock(day, block.id)}
                                  className="inline-flex size-8 items-center justify-center rounded-full border border-[rgba(20,50,75,0.12)] text-[var(--ink-soft)] transition hover:border-red-300 hover:text-red-500"
                                  aria-label={copy.remove}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                      </div>

                      <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.08)] bg-white/84 p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ink)]">
                            {scheduleText.editPlan}
                          </h4>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => beginCreateBlock(day.day)}
                              className="rounded-full border border-[rgba(20,50,75,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                            >
                              {scheduleText.addTask}
                            </button>
                            <button
                              type="button"
                              onClick={() => resetDayPlan(day.day)}
                              className="rounded-full border border-[rgba(20,50,75,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
                            >
                              {scheduleText.resetDay}
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2.5">
                          <input
                            value={isEditingDay ? blockDraft.title : ""}
                            onChange={(event) =>
                              setBlockDraft((current) => ({ ...current, day: day.day, title: event.target.value }))
                            }
                            placeholder={scheduleText.taskTitlePlaceholder}
                            className={compactInputCls}
                          />
                          <div className="grid gap-2.5 sm:grid-cols-[1fr_6.5rem]">
                            <select
                              value={isEditingDay ? blockDraft.skill : "reading"}
                              onChange={(event) =>
                                setBlockDraft((current) => ({
                                  ...current,
                                  day: day.day,
                                  skill: event.target.value as ScheduleSkill,
                                }))
                              }
                              className={compactInputCls}
                            >
                              {PLAN_SKILLS.map((skill) => (
                                <option key={skill} value={skill}>
                                  {skillMeta[skill].label[locale]}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={5}
                              max={90}
                              step={5}
                              value={isEditingDay ? blockDraft.minutes : 15}
                              onChange={(event) =>
                                setBlockDraft((current) => ({
                                  ...current,
                                  day: day.day,
                                  minutes: Number(event.target.value || 15),
                                }))
                              }
                              className={compactInputCls}
                            />
                          </div>
                          <textarea
                            rows={4}
                            value={isEditingDay ? blockDraft.reason : ""}
                            onChange={(event) =>
                              setBlockDraft((current) => ({ ...current, day: day.day, reason: event.target.value }))
                            }
                            placeholder={scheduleText.taskReasonPlaceholder}
                            className={`${compactInputCls} min-h-[110px] resize-none py-3`}
                          />
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-[var(--ink-soft)]">
                              {scheduleText.taskMinutesLabel}: {isEditingDay ? blockDraft.minutes : 15}
                            </span>
                            <div className="flex items-center gap-2">
                              {isEditingDay ? (
                                <button
                                  type="button"
                                  onClick={() => cancelBlockEdit(day.day)}
                                  className="rounded-full border border-[rgba(20,50,75,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
                                >
                                  {copy.cancelEdit}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => submitBlock(day)}
                                className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
                              >
                                <Plus className="size-4" />
                                {blockDraft.id && isEditingDay ? scheduleText.saveTask : scheduleText.addTask}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}

function PrefRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white/82 px-4 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

function InlineMeta({ label, value, toneClass }: { label: string; value: string; toneClass?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${toneClass ?? "bg-white/80 text-[var(--ink)]"}`}>
      <span className="text-[var(--ink-soft)]">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="rounded-[1rem] border border-dashed border-[rgba(20,50,75,0.14)] bg-white/60 px-4 py-3 text-sm text-[var(--ink-soft)]">{text}</p>;
}

function ImportNotice({ state }: { state: ImportState }) {
  if (!state.message) return null;

  const toneClass =
    state.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : state.tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-[rgba(20,50,75,0.12)] bg-[rgba(20,50,75,0.04)] text-[var(--ink)]";

  return (
    <div className={`mt-4 rounded-[1rem] border px-4 py-3 ${toneClass}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4" />
        {state.message}
      </div>
      {state.warnings.length > 0 ? (
        <div className="mt-2 grid gap-1 text-xs">
          {state.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EditableDeadlineRow({
  item,
  locale,
  removeLabel,
  onSave,
  onRemove,
}: {
  item: ScheduleDeadline;
  locale: Locale;
  removeLabel: string;
  onSave: (partial: Partial<ScheduleDeadline>) => void;
  onRemove: () => void;
}) {
  const [title, setTitle] = useState(item.title);

  function commitTitle() {
    const next = title.trim();
    if (!next) {
      setTitle(item.title);
      return;
    }
    if (next !== item.title) onSave({ title: next });
  }

  return (
    <div className="grid gap-2.5 rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-white/85 p-3.5 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
      <input value={title} onChange={(event) => setTitle(event.target.value)} onBlur={commitTitle} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className={compactInputCls} />
      <input type="date" value={item.dueDate} onChange={(event) => onSave({ dueDate: event.target.value })} className={compactInputCls} />
      <select value={item.skill} onChange={(event) => onSave({ skill: event.target.value as TrackedSkill })} className={compactInputCls}>
        {TRACKED_SKILLS.map((skill) => (
          <option key={skill} value={skill}>
            {skillMeta[skill].label[locale]}
          </option>
        ))}
      </select>
      <button type="button" onClick={onRemove} aria-label={removeLabel} className="inline-flex size-11 items-center justify-center rounded-full border border-[rgba(20,50,75,0.12)] bg-white text-[var(--ink-soft)] transition hover:border-red-300 hover:text-red-500">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
