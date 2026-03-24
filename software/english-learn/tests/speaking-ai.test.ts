import { describe, expect, it } from "vitest";

import { buildMockSpeakingFeedback, buildMockSpeakingPartnerReply } from "@/lib/speaking-ai";

describe("speaking AI helpers", () => {
  it("builds a structured fallback speaking score", () => {
    const feedback = buildMockSpeakingFeedback(
      "I would argue that discussion groups help students because they practice speaking more often. For example, students can test ideas before a seminar.",
      ["Open with a clear position.", "Give one specific reason.", "Add one concrete support example."],
    );

    expect(feedback.overall_score).toBeGreaterThanOrEqual(5.5);
    expect(feedback.task_response_score).toBeGreaterThanOrEqual(5.5);
    expect(feedback.strengths).toHaveLength(2);
    expect(feedback.delivery_snapshot.length).toBeGreaterThan(10);
    expect(feedback.sample_upgrade.length).toBeGreaterThan(30);
    expect(feedback.tips).toHaveLength(3);
  });

  it("builds a partner reply with a follow-up question", () => {
    const reply = buildMockSpeakingPartnerReply("I think students need more support because seminar speaking is difficult.");

    expect(reply.reply.length).toBeGreaterThan(20);
    expect(reply.follow_up.endsWith("?")).toBe(true);
    expect(reply.coaching_note.length).toBeGreaterThan(10);
  });
});
