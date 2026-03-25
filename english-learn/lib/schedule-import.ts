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
  { day: 0, patterns: [/^\u5468\u4e00$/, /^\u661f\u671f\u4e00$/, /^monday$/i, /^mon$/i] },
  { day: 1, patterns: [/^\u5468\u4e8c$/, /^\u661f\u671f\u4e8c$/, /^tuesday$/i, /^tue$/i, /^tues$/i] },
  { day: 2, patterns: [/^\u5468\u4e09$/, /^\u661f\u671f\u4e09$/, /^wednesday$/i, /^wed$/i] },
  { day: 3, patterns: [/^\u5468\u56db$/, /^\u661f\u671f\u56db$/, /^thursday$/i, /^thu$/i, /^thur$/i, /^thurs$/i] },
  { day: 4, patterns: [/^\u5468\u4e94$/, /^\u661f\u671f\u4e94$/, /^friday$/i, /^fri$/i] },
  { day: 5, patterns: [/^\u5468\u516d$/, /^\u661f\u671f\u516d$/, /^saturday$/i, /^sat$/i] },
  {
    day: 6,
    patterns: [
      /^\u5468\u65e5$/,
      /^\u5468\u5929$/,
      /^\u661f\u671f\u65e5$/,
      /^\u661f\u671f\u5929$/,
      /^sunday$/i,
      /^sun$/i,
    ],
  },
];

const DAY_HEADER_PATTERN = /day|weekday|\u661f\u671f|\u5468/i;
const SLOT_HEADER_PATTERN = /slot|period|\u8282\u6b21|\u8282/i;
const TITLE_HEADER_PATTERN = /course|class|name|title|\u8bfe\u7a0b/i;
const TYPE_HEADER_PATTERN = /type|\u7c7b\u578b/i;
const TIME_HEADER_PATTERN = /time|\u65f6\u95f4/i;

function cleanCellText(value: unknown) {
  return String(value ?? "")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeDash(value: string) {
  return value.replace(/[\u2013\u2014\u2212\uff0d~\uff5e\u81f3]/g, "-");
}

function splitCourseChunks(value: string) {
  const cleaned = cleanCellText(value);
  if (!cleaned) return [] as string[];

  const chunks = cleaned
    .split(/\n\s*\n+/)
    .map((chunk) => cleanCellText(chunk))
    .filter(Boolean);

  return chunks.length > 0 ? chunks : [cleaned];
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
  const cleaned = normalizeDash(cleanCellText(label));
  if (!cleaned) return null;
  if (cleaned === "11-12") return "09-10";
  if (isScheduleSlotId(cleaned)) return cleaned;

  const match = cleaned.match(/(\d{1,2})\s*-\s*(\d{1,2})/);
  if (!match) return null;

  const start = String(match[1]).padStart(2, "0");
  const end = String(match[2]).padStart(2, "0");
  const normalized = `${start}-${end}`;
  if (normalized === "11-12") return "09-10";
  return isScheduleSlotId(normalized) ? normalized : null;
}

function inferClassType(value: string | null | undefined, title: string): ScheduleClassType {
  const merged = `${cleanCellText(value)} ${title}`.toLowerCase();
  if (/seminar|\u8ba8\u8bba|\u7814\u8ba8|presentation|report/.test(merged)) return "seminar";
  if (/lab|\u5b9e\u9a8c|\u5b9e\u8df5|studio|workshop/.test(merged)) return "lab";
  return "lecture";
}

function cleanTitle(value: string | null | undefined) {
  const cleaned = cleanCellText(value);
  if (!cleaned) return "";
  return (
    cleaned
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)[0]
      ?.replace(/[\uff0c,]?\s*\d{1,2}-\d{1,2}\u5468\s*$/i, "")
      .trim() ?? ""
  );
}

function expandImportedCell(args: {
  text: string;
  day: number;
  slot: ScheduleSlotId;
  time?: string;
}): Array<{
  title: string;
  day: number;
  slot: ScheduleSlotId;
  type: ScheduleClassType;
  time: string;
}> {
  return splitCourseChunks(args.text)
    .map((chunk) => {
      const title = cleanTitle(chunk);
      if (!title) return null;

      return {
        title,
        day: args.day,
        slot: args.slot,
        type: inferClassType(chunk, title),
        time: cleanCellText(args.time) || getScheduleSlotDefaultTime(args.slot),
      };
    })
    .filter(Boolean) as Array<{
    title: string;
    day: number;
    slot: ScheduleSlotId;
    type: ScheduleClassType;
    time: string;
  }>;
}

export function normalizeImportedClasses(values: unknown[]): ScheduleImportResult {
  const warnings: string[] = [];
  const seen = new Set<string>();
  const classes: ImportedScheduleClass[] = [];

  for (const value of values) {
    if (!value || typeof value !== "object") continue;
    const item = value as Partial<ImportedScheduleClass> & {
      title?: unknown;
      day?: unknown;
      slot?: unknown;
      type?: unknown;
      time?: unknown;
    };
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
    const dedupeKey = `${normalizedDay}-${slot}-${title}-${time}`;
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

        imported.push(...expandImportedCell({ text, day, slot }));
      });
    }
  }

  if (imported.length === 0) {
    const header = (rows.find((row) => row.some((cell) => cleanCellText(cell))) ?? []).map((cell) =>
      cleanCellText(cell).toLowerCase(),
    );
    const dayIndex = header.findIndex((cell) => DAY_HEADER_PATTERN.test(cell));
    const slotIndex = header.findIndex((cell) => SLOT_HEADER_PATTERN.test(cell));
    const titleIndex = header.findIndex((cell) => TITLE_HEADER_PATTERN.test(cell));
    const typeIndex = header.findIndex((cell) => TYPE_HEADER_PATTERN.test(cell));
    const timeIndex = header.findIndex((cell) => TIME_HEADER_PATTERN.test(cell));

    if (dayIndex >= 0 && slotIndex >= 0 && titleIndex >= 0) {
      rows.slice(1).forEach((row) => {
        const day = findScheduleDay(String(row[dayIndex] ?? ""));
        const slot = parseScheduleSlot(String(row[slotIndex] ?? ""));
        const text = cleanCellText(row[titleIndex]);
        if (day === null || !slot || !text) return;

        imported.push(
          ...expandImportedCell({
            text,
            day,
            slot,
            time: cleanCellText(timeIndex >= 0 ? row[timeIndex] : ""),
          }).map((item) => ({
            ...item,
            type: inferClassType(String(typeIndex >= 0 ? row[typeIndex] : ""), item.title),
          })),
        );
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
