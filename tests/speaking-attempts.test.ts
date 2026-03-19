import { describe, expect, it } from "vitest";

import { appendSpeakingAttempt } from "@/lib/speaking-attempts";
import type { SpeakingAttemptRecord } from "@/types/learning";

function createAttempt(id: string, createdAt: string): SpeakingAttemptRecord {
  return {
    id,
    prompt_id: "b1-language-support",
    prompt_title: "University language support",
    target_level: "B1",
    transcript: "Sample transcript",
    overall_score: 7,
    task_response_score: 7,
    pronunciation_score: 7,
    fluency_score: 7,
    grammar_score: 7,
    strengths: ["Clear main point", "Useful support"],
    revision_focus: "Add a more precise example.",
    tips: ["Add one example", "Use one transition", "Tighten the ending"],
    recording_duration_sec: 40,
    recording_mime_type: "audio/webm",
    created_at: createdAt,
  };
}

describe("speaking attempts", () => {
  it("keeps the latest attempt first after insert", () => {
    const attempts = appendSpeakingAttempt([createAttempt("older", "2026-03-18T04:00:00.000Z")], createAttempt("newer", "2026-03-18T05:00:00.000Z"));

    expect(attempts[0]?.id).toBe("newer");
    expect(attempts[1]?.id).toBe("older");
  });

  it("caps the number of saved attempts", () => {
    const attempts = Array.from({ length: 24 }, (_, index) =>
      createAttempt(`attempt-${index}`, `2026-03-18T${String(index).padStart(2, "0")}:00:00.000Z`),
    );

    const nextAttempts = appendSpeakingAttempt(attempts, createAttempt("latest", "2026-03-19T01:00:00.000Z"));

    expect(nextAttempts).toHaveLength(24);
    expect(nextAttempts[0]?.id).toBe("latest");
  });
});
