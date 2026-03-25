import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  knownTimetableTemplateClasses,
  tryRecognizeKnownTimetableScreenshot,
} from "@/lib/schedule-image-template";

const WIDTH = 812;
const HEIGHT = 365;
const DAY_CENTERS = [134, 233, 332, 430, 530, 629, 729];
const SLOT_CENTERS = [117, 155, 194, 233, 272];
const SLOT_BY_ID = {
  "01-02": 0,
  "03-04": 1,
  "05-06": 2,
  "07-08": 3,
  "09-10": 4,
} as const;

function dayToColumn(day: number) {
  return day === 6 ? 0 : day + 1;
}

function buildTemplateRectangles() {
  const grouped = new Map<string, typeof knownTimetableTemplateClasses>();

  for (const item of knownTimetableTemplateClasses) {
    const key = `${item.day}-${item.slot}`;
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  const colors = ["#ff8a3d", "#6b58d6", "#21b7c8", "#f35d71", "#f5bc00"];
  let colorIndex = 0;

  return [...grouped.entries()].flatMap(([key, items]) => {
    const [dayText, slot] = key.split("-");
    const column = dayToColumn(Number(dayText));
    const row = SLOT_BY_ID[slot as keyof typeof SLOT_BY_ID];
    const centerX = DAY_CENTERS[column] ?? DAY_CENTERS[0];
    const centerY = SLOT_CENTERS[row] ?? SLOT_CENTERS[0];
    const width = 86;
    const singleHeight = 30;
    const doubleHeight = 24;

    if (items.length === 1) {
      const color = colors[colorIndex % colors.length];
      colorIndex += 1;
      return [`<rect x="${centerX - width / 2}" y="${centerY - singleHeight / 2}" width="${width}" height="${singleHeight}" rx="4" fill="${color}" />`];
    }

    return items.map((_, index) => {
      const color = colors[(colorIndex + index) % colors.length];
      const y =
        index === 0
          ? centerY - doubleHeight - 2
          : centerY + 2;
      return `<rect x="${centerX - width / 2}" y="${y}" width="${width}" height="${doubleHeight}" rx="4" fill="${color}" />`;
    });
  });
}

async function buildKnownTemplateImage() {
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff" />
      ${buildTemplateRectangles().join("\n")}
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

describe("schedule image template", () => {
  it("recognizes the supported timetable screenshot layout without AI", async () => {
    const image = await buildKnownTemplateImage();
    const parsed = await tryRecognizeKnownTimetableScreenshot(image);

    expect(parsed).not.toBeNull();
    expect(parsed).toHaveLength(22);
    expect(parsed).toEqual(knownTimetableTemplateClasses);
  });

  it("does not match unrelated images", async () => {
    const image = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
        background: "#ffffff",
      },
    })
      .png()
      .toBuffer();

    const parsed = await tryRecognizeKnownTimetableScreenshot(image);
    expect(parsed).toBeNull();
  });
});
