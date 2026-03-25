import {
  getScheduleSlotDefaultTime,
  isScheduleSlotId,
  type ScheduleClassType,
  type ScheduleSlotId,
} from "@/lib/schedule";

export interface ImportedScheduleClass {
  title: string;
  day: number;
  slot: ScheduleSlotId;
  type: ScheduleClassType;
  time: string;
}

export interface ScheduleImportResult {
  classes: ImportedScheduleClass[];
  warnings: string[];
}

const DAY_PATTERNS: Array<{ day: number; patterns: RegExp[] }> = [
  { day: 0, patterns: [/^周一$/, /^星期一$/, /^monday$/i, /^mon$/i] },
  { day: 1, patterns: [/^周二$/, /^星期二$/, /^tuesday$/i, /^tue$/i, /^tues$/i] },
  { day: 2, patterns: [/^周三$/, /^星期三$/, /^wednesday$/i, /^wed$/i] },
  { day: 3, patterns: [/^周四$/, /^星期四$/, /^thursday$/i, /^thu$/i, /^thur$/i, /^thurs$/i] },
  { day: 4, patterns: [/^周五$/, /^星期五$/, /^friday$/i, /^fri$/i] },
  { day: 5, patterns: [/^周六$/, /^星期六$/, /^saturday$/i, /^sat$/i] },
  { day: 6, patterns: [/^周日$/, /^周天$/, /^星期日$/, /^星期天$/, /^sunday$/i, /^sun$/i] },
];

function cleanCellText(value: unknown) {
  return String(value ?? "")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function findScheduleDay(label: string | null | undefined) {
  const cleaned = cleanCellText(label);
  if (!cleaned) return null;

  for (const item of DAY_PATTERNS) {
    if (item.patterns.some((pattern) => pattern.test(cleaned))) {
      return item.day;
    }
  }

  return null;
}

export function parseScheduleSlot(label: string | null | undefined): ScheduleSlotId | null {
  const cleaned = cleanCellText(label);
  if (!cleaned) return null;
  if (isScheduleSlotId(cleaned)) return cleaned;

  const match = cleaned.match(/(\d{1,2})\s*[-~—至]\s*(\d{1,2})/);
  if (!match) return null;

  const start = String(match[1]).padStart(2, "0");
  const end = String(match[2]).padStart(2, "0");
  const normalized = `${start}-${end}`;
  return isScheduleSlotId(normalized) ? normalized : null;
}

function inferClassType(value: string | null | undefined, title: string): ScheduleClassType {
  const merged = `${cleanCellText(value)} ${title}`.toLowerCase();
  if (/seminar|讨论|研讨|presentation|report/.test(merged)) return "seminar";
  if (/lab|实验|实践|studio|workshop/.test(merged)) return "lab";
  return "lecture";
}

function cleanTitle(value: string | null | undefined) {
  const cleaned = cleanCellText(value);
  if (!cleaned) return "";
  return cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)[0]
    ?.replace(/[，,]\s*\d{1,2}-\d{1,2}周.*$/i, "")
    .trim() ?? "";
}

export function normalizeImportedClasses(values: unknown[]): ScheduleImportResult {
  const warnings: string[] = [];
  const seen = new Set<string>();
  const classes: ImportedScheduleClass[] = [];

  for (const value of values) {
    if (!value || typeof value !== "object") continue;
    const item = value as Partial<ImportedScheduleClass> & { title?: unknown; day?: unknown; slot?: unknown; type?: unknown; time?: unknown };
    const title = cleanTitle(typeof item.title === "string" ? item.title : String(item.title ?? ""));
    const day = Number(item.day);
    const slot = parseScheduleSlot(typeof item.slot === "string" ? item.slot : String(item.slot ?? ""));

    if (!title || !Number.isFinite(day) || day < 0 || day > 6 || !slot) {
      warnings.push("Skipped one imported course because the title, weekday, or slot was incomplete.");
      continue;
    }

    const normalizedDay = Math.round(day);
    const type = inferClassType(typeof item.type === "string" ? item.type : "", title);
    const timeText = cleanCellText(item.time);
    const time = /^\d{2}:\d{2}$/.test(timeText) ? timeText : getScheduleSlotDefaultTime(slot);
    const dedupeKey = `${normalizedDay}-${slot}-${title}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    classes.push({
      title,
      day: normalizedDay,
      slot,
      type,
      time,
    });
  }

  return { classes, warnings };
}

export function parseSheetRows(rows: unknown[][]): ScheduleImportResult {
  const warnings: string[] = [];
  const imported: unknown[] = [];

  const dayColumns = new Map<number, number>();
  let headerRowIndex = -1;

  rows.forEach((row, rowIndex) => {
    if (headerRowIndex >= 0) return;
    row.forEach((cell, columnIndex) => {
      const day = findScheduleDay(String(cell ?? ""));
      if (day !== null) {
        dayColumns.set(columnIndex, day);
      }
    });
    if (dayColumns.size >= 4) {
      headerRowIndex = rowIndex;
    } else {
      dayColumns.clear();
    }
  });

  if (headerRowIndex >= 0 && dayColumns.size > 0) {
    for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] ?? [];
      const slot = parseScheduleSlot(String(row[0] ?? row[1] ?? ""));
      if (!slot) continue;

      dayColumns.forEach((day, columnIndex) => {
        const text = cleanCellText(row[columnIndex]);
        if (!text) return;
        imported.push({
          title: text,
          day,
          slot,
        });
      });
    }
  }

  if (imported.length === 0) {
    const header = (rows.find((row) => row.some((cell) => cleanCellText(cell))) ?? []).map((cell) =>
      cleanCellText(cell).toLowerCase(),
    );
    const dayIndex = header.findIndex((cell) => /day|weekday|星期|周/.test(cell));
    const slotIndex = header.findIndex((cell) => /slot|period|节次|节/.test(cell));
    const titleIndex = header.findIndex((cell) => /course|class|name|title|课程/.test(cell));
    const typeIndex = header.findIndex((cell) => /type|类型/.test(cell));
    const timeIndex = header.findIndex((cell) => /time|时间/.test(cell));

    if (dayIndex >= 0 && slotIndex >= 0 && titleIndex >= 0) {
      rows.slice(1).forEach((row) => {
        const day = findScheduleDay(String(row[dayIndex] ?? ""));
        const slot = parseScheduleSlot(String(row[slotIndex] ?? ""));
        const title = cleanCellText(row[titleIndex]);
        if (day === null || !slot || !title) return;
        imported.push({
          title,
          day,
          slot,
          type: cleanCellText(typeIndex >= 0 ? row[typeIndex] : ""),
          time: cleanCellText(timeIndex >= 0 ? row[timeIndex] : ""),
        });
      });
    }
  }

  const normalized = normalizeImportedClasses(imported);
  if (normalized.classes.length === 0) {
    warnings.push("No timetable data could be recognized from this file.");
  }

  return {
    classes: normalized.classes,
    warnings: [...normalized.warnings, ...warnings],
  };
}
