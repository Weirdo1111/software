import { describe, expect, it } from "vitest";

import { parseScheduleSlot, parseSheetRows } from "@/lib/schedule-import";

const studentTimetableRows: unknown[][] = [
  ["Student timetable", "", "", "", "", "", "", ""],
  ["Term meta", "", "", "", "", "", "", ""],
  [
    "",
    "\u661f\u671f\u65e5",
    "\u661f\u671f\u4e00",
    "\u661f\u671f\u4e8c",
    "\u661f\u671f\u4e09",
    "\u661f\u671f\u56db",
    "\u661f\u671f\u4e94",
    "\u661f\u671f\u516d",
  ],
  [
    "1\uFF0D2",
    "",
    "",
    "",
    "\u4e60\u8fd1\u5e73\u65b0\u65f6\u4ee3\u4e2d\u56fd\u7279\u8272\u793e\u4f1a\u4e3b\u4e49\u601d\u60f3\u6982\u8bba\nTeacher\nC507",
    "",
    "\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b\nTeacher\nA207",
    "\u89c2\u8d4f\u690d\u7269\u5b66\nTeacher\nT112",
  ],
  [
    "3\uFF0D4",
    "",
    "",
    "\u6e38\u620f\u7f16\u7a0b\nTeacher\n635",
    "\u8ba1\u7b97\u7406\u8bba\nTeacher\nC511",
    "\u6e38\u620f\u7f16\u7a0b\nTeacher\n635",
    "\u6e38\u620f\u7f16\u7a0b\nTeacher\n635",
    "\u89c2\u8d4f\u690d\u7269\u5b66\nTeacher\nT112",
  ],
  [
    "5\uFF0D6",
    "",
    "\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b\nTeacher\nA410\n\n\u6e38\u620f\u7f16\u7a0b\nTeacher\n635",
    "\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b\nTeacher\nA206",
    "",
    "",
    "\u8ba1\u7b97\u7406\u8bba\nTeacher\nA207\n\n\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b\nTeacher\nA207",
    "",
  ],
  [
    "7\uFF0D8",
    "",
    "\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b\nTeacher\nA207",
    "\u8ba1\u7b97\u7406\u8bba\nTeacher\nC511",
    "",
    "\u8ba1\u7b97\u7406\u8bba\nTeacher\nA206\n\n\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b\nTeacher\nA206",
    "\u4e60\u8fd1\u5e73\u65b0\u65f6\u4ee3\u4e2d\u56fd\u7279\u8272\u793e\u4f1a\u4e3b\u4e49\u601d\u60f3\u6982\u8bba\nTeacher\nC105",
    "",
  ],
  [
    "9\uFF0D10",
    "",
    "",
    "\u4e2d\u56fd\u6587\u5b66\u7ecf\u5178\u4e0e\u4e2d\u56fd\u7cbe\u795e\nTeacher\nA210",
    "\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b\nTeacher\nA206",
    "\u804c\u4e1a\u4e0e\u5065\u5eb7\nTeacher\nC112",
    "\u5f62\u52bf\u4e0e\u653f\u7b56\nTeacher\nC111",
    "",
  ],
  ["11\uFF0D12", "", "", "", "", "", "", ""],
];

describe("schedule import", () => {
  it("parses full-width timetable slot labels", () => {
    expect(parseScheduleSlot("1\uFF0D2")).toBe("01-02");
    expect(parseScheduleSlot("3\uFF0D4")).toBe("03-04");
    expect(parseScheduleSlot("11\uFF0D12")).toBe("09-10");
  });

  it("recognizes the provided student timetable layout", () => {
    const parsed = parseSheetRows(studentTimetableRows);
    const summary = parsed.classes.map((item) => `${item.day}-${item.slot}-${item.title}`);

    expect(parsed.warnings).toEqual([]);
    expect(parsed.classes).toHaveLength(22);
    expect(summary).toContain("0-05-06-\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b");
    expect(summary).toContain("0-05-06-\u6e38\u620f\u7f16\u7a0b");
    expect(summary).toContain("2-01-02-\u4e60\u8fd1\u5e73\u65b0\u65f6\u4ee3\u4e2d\u56fd\u7279\u8272\u793e\u4f1a\u4e3b\u4e49\u601d\u60f3\u6982\u8bba");
    expect(summary).toContain("3-07-08-\u8ba1\u7b97\u7406\u8bba");
    expect(summary).toContain("3-07-08-\u654f\u6377\u8f6f\u4ef6\u5de5\u7a0b");
    expect(summary).toContain("1-09-10-\u4e2d\u56fd\u6587\u5b66\u7ecf\u5178\u4e0e\u4e2d\u56fd\u7cbe\u795e");
  });
});
