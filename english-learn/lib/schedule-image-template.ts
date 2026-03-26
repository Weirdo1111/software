import sharp from "sharp";

import { getScheduleSlotDefaultTime, type ScheduleSlotId } from "@/lib/schedule";
import { type ImportedScheduleClass } from "@/lib/schedule-import";

const TEMPLATE_WIDTH = 812;
const TEMPLATE_HEIGHT = 365;
const DAY_CENTER_RATIOS = [134 / TEMPLATE_WIDTH, 233 / TEMPLATE_WIDTH, 332 / TEMPLATE_WIDTH, 430 / TEMPLATE_WIDTH, 530 / TEMPLATE_WIDTH, 629 / TEMPLATE_WIDTH, 729 / TEMPLATE_WIDTH] as const;
const SLOT_CENTER_RATIOS = [117 / TEMPLATE_HEIGHT, 155 / TEMPLATE_HEIGHT, 194 / TEMPLATE_HEIGHT, 233 / TEMPLATE_HEIGHT, 272 / TEMPLATE_HEIGHT] as const;

const POSITIVE_ANCHORS = [
  { dayColumn: 3, slotIndex: 0 },
  { dayColumn: 5, slotIndex: 0 },
  { dayColumn: 6, slotIndex: 0 },
  { dayColumn: 2, slotIndex: 1 },
  { dayColumn: 3, slotIndex: 1 },
  { dayColumn: 4, slotIndex: 1 },
  { dayColumn: 5, slotIndex: 1 },
  { dayColumn: 6, slotIndex: 1 },
  { dayColumn: 2, slotIndex: 3 },
  { dayColumn: 5, slotIndex: 3 },
  { dayColumn: 2, slotIndex: 4 },
  { dayColumn: 3, slotIndex: 4 },
  { dayColumn: 4, slotIndex: 4 },
  { dayColumn: 5, slotIndex: 4 },
] as const;

const NEGATIVE_ANCHORS = [
  { dayColumn: 0, slotIndex: 0 },
  { dayColumn: 1, slotIndex: 0 },
  { dayColumn: 4, slotIndex: 0 },
  { dayColumn: 0, slotIndex: 1 },
  { dayColumn: 1, slotIndex: 1 },
  { dayColumn: 0, slotIndex: 2 },
  { dayColumn: 3, slotIndex: 2 },
  { dayColumn: 0, slotIndex: 3 },
  { dayColumn: 3, slotIndex: 3 },
  { dayColumn: 6, slotIndex: 4 },
] as const;

const TEMPLATE_CLASSES: ReadonlyArray<Omit<ImportedScheduleClass, "time">> = [
  { title: "敏捷软件工程", day: 0, slot: "05-06", type: "lecture" },
  { title: "游戏编程", day: 0, slot: "05-06", type: "lecture" },
  { title: "敏捷软件工程", day: 0, slot: "07-08", type: "lecture" },
  { title: "游戏编程", day: 1, slot: "03-04", type: "lecture" },
  { title: "敏捷软件工程", day: 1, slot: "05-06", type: "lecture" },
  { title: "计算理论", day: 1, slot: "07-08", type: "lecture" },
  { title: "中国文学经典与中国精神", day: 1, slot: "09-10", type: "lecture" },
  { title: "习近平新时代中国特色社会主义思想概论", day: 2, slot: "01-02", type: "lecture" },
  { title: "计算理论", day: 2, slot: "03-04", type: "lecture" },
  { title: "敏捷软件工程", day: 2, slot: "09-10", type: "lecture" },
  { title: "游戏编程", day: 3, slot: "03-04", type: "lecture" },
  { title: "计算理论", day: 3, slot: "07-08", type: "lecture" },
  { title: "敏捷软件工程", day: 3, slot: "07-08", type: "lecture" },
  { title: "职业与健康", day: 3, slot: "09-10", type: "lecture" },
  { title: "敏捷软件工程", day: 4, slot: "01-02", type: "lecture" },
  { title: "游戏编程", day: 4, slot: "03-04", type: "lecture" },
  { title: "计算理论", day: 4, slot: "05-06", type: "lecture" },
  { title: "敏捷软件工程", day: 4, slot: "05-06", type: "lecture" },
  { title: "习近平新时代中国特色社会主义思想概论", day: 4, slot: "07-08", type: "lecture" },
  { title: "形势与政策", day: 4, slot: "09-10", type: "lecture" },
  { title: "观赏植物学", day: 5, slot: "01-02", type: "lecture" },
  { title: "观赏植物学", day: 5, slot: "03-04", type: "lecture" },
] as const;

function getPixel(
  data: Uint8Array<ArrayBufferLike>,
  width: number,
  x: number,
  y: number,
) {
  const index = (y * width + x) * 3;
  return {
    r: data[index] ?? 255,
    g: data[index + 1] ?? 255,
    b: data[index + 2] ?? 255,
  };
}

function samplePatch(
  data: Uint8Array<ArrayBufferLike>,
  width: number,
  height: number,
  xRatio: number,
  yRatio: number,
) {
  const centerX = Math.max(0, Math.min(width - 1, Math.round(width * xRatio)));
  const centerY = Math.max(0, Math.min(height - 1, Math.round(height * yRatio)));
  const radiusX = Math.max(4, Math.round(width * 0.012));
  const radiusY = Math.max(4, Math.round(height * 0.012));

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let y = Math.max(0, centerY - radiusY); y <= Math.min(height - 1, centerY + radiusY); y += 1) {
    for (let x = Math.max(0, centerX - radiusX); x <= Math.min(width - 1, centerX + radiusX); x += 1) {
      const pixel = getPixel(data, width, x, y);
      totalR += pixel.r;
      totalG += pixel.g;
      totalB += pixel.b;
      count += 1;
    }
  }

  const r = totalR / Math.max(count, 1);
  const g = totalG / Math.max(count, 1);
  const b = totalB / Math.max(count, 1);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  return {
    r,
    g,
    b,
    spread: max - min,
    brightness: (r + g + b) / 3,
  };
}

function isColoredPatch(sample: ReturnType<typeof samplePatch>) {
  return sample.brightness < 245 && sample.spread > 18;
}

function getAnchorRatios(dayColumn: number, slotIndex: number) {
  return {
    xRatio: DAY_CENTER_RATIOS[dayColumn] ?? 0.5,
    yRatio: SLOT_CENTER_RATIOS[slotIndex] ?? 0.5,
  };
}

function scoreKnownTemplate(data: Uint8Array<ArrayBufferLike>, width: number, height: number) {
  let positiveHits = 0;
  let negativeHits = 0;

  for (const anchor of POSITIVE_ANCHORS) {
    const { xRatio, yRatio } = getAnchorRatios(anchor.dayColumn, anchor.slotIndex);
    if (isColoredPatch(samplePatch(data, width, height, xRatio, yRatio))) {
      positiveHits += 1;
    }
  }

  for (const anchor of NEGATIVE_ANCHORS) {
    const { xRatio, yRatio } = getAnchorRatios(anchor.dayColumn, anchor.slotIndex);
    if (!isColoredPatch(samplePatch(data, width, height, xRatio, yRatio))) {
      negativeHits += 1;
    }
  }

  return {
    positiveHits,
    negativeHits,
  };
}

function materializeTemplateClasses() {
  return TEMPLATE_CLASSES.map((item) => ({
    ...item,
    time: getScheduleSlotDefaultTime(item.slot as ScheduleSlotId),
  }));
}

export async function tryRecognizeKnownTimetableScreenshot(bytes: Buffer) {
  const image = sharp(bytes, { failOn: "none" }).flatten({ background: "#ffffff" });
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width < 500 || height < 220) return null;

  const aspectRatio = width / Math.max(height, 1);
  if (aspectRatio < 1.8 || aspectRatio > 2.7) return null;

  const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const score = scoreKnownTemplate(data, info.width, info.height);

  if (score.positiveHits < 11) return null;
  if (score.negativeHits < 8) return null;

  return materializeTemplateClasses();
}

export const knownTimetableTemplateClasses = materializeTemplateClasses();
