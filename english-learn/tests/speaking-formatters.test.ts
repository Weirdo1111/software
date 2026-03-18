import { describe, expect, it } from "vitest";

import { formatRecordingTime } from "@/components/forms/speaking/formatters";

describe("speaking formatters", () => {
  it("formats recording time as mm:ss", () => {
    expect(formatRecordingTime(0)).toBe("00:00");
    expect(formatRecordingTime(12_300)).toBe("00:12");
    expect(formatRecordingTime(61_000)).toBe("01:01");
  });
});
