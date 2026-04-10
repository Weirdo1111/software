import { describe, expect, it } from "vitest";

import {
  buddyNavigatorPrompt,
  roleplayConversationPrompt,
  speakingPartnerPrompt,
  speakingTestFeedbackPrompt,
} from "@/lib/ai/prompts";
import { getSpeakingPromptById } from "@/lib/speaking-prompts";
import { getSpeakingTestQuestionSetById } from "@/lib/speaking-test";

describe("AI prompt helpers", () => {
  it("builds a roleplay conversation prompt with JSON instructions and history", () => {
    const prompt = roleplayConversationPrompt("I think we should check the library door first.", [
      { role: "assistant", content: "Interesting. What makes that door stand out?" },
      { role: "user", content: "There was a strange sound near it a minute ago." },
    ]);

    expect(prompt).toContain("Return strict JSON with keys: reply, follow_up, coaching_note.");
    expect(prompt).toContain("Character: Interesting. What makes that door stand out?");
    expect(prompt).toContain("User: There was a strange sound near it a minute ago.");
    expect(prompt).toContain("Learner's latest turn:");
    expect(prompt).toContain("Use English only in every field");
  });

  it("builds a buddy navigator prompt that stays within site knowledge", () => {
    const prompt = buddyNavigatorPrompt({
      locale: "en",
      query: "Where can I find reading feedback?",
      pathname: "/reading",
      currentPageText: "Reading | Complete reading practice and AI feedback.",
      siteMapText: "- reading: Reading | Complete reading practice and AI feedback.",
      faqText: "- start-reading: where is reading feedback -> Open the Reading page.",
    });

    expect(prompt).toContain("Only answer questions about this website's pages, functions, and usage flow.");
    expect(prompt).toContain("Return strict JSON with keys:");
    expect(prompt).toContain("Current page:");
    expect(prompt).toContain("Site map:");
    expect(prompt).toContain("FAQ hints:");
  });

  it("builds a speaking partner prompt that requires English-only output", () => {
    const speakingPrompt = getSpeakingPromptById("civil-medium-report-discussion");
    const prompt = speakingPartnerPrompt(
      "medium",
      speakingPrompt!,
      "I think group reports are useful because students compare evidence.",
      [],
    );

    expect(prompt).toContain("Use English only in every field.");
    expect(prompt).toContain("Do not use Chinese, bilingual output, translation, or code-switching.");
  });

  it("builds a speaking-test scoring prompt that requires English-only feedback", () => {
    const questionSet = getSpeakingTestQuestionSetById("campus-transition");
    const prompt = speakingTestFeedbackPrompt(questionSet!, [
      {
        question_id: "campus-transition-q1",
        prompt: questionSet!.questions[0].prompt,
        transcript: "I am Ken, and adapting to university life was difficult because time management changed a lot.",
        duration_sec: 42,
      },
      {
        question_id: "campus-transition-q2",
        prompt: questionSet!.questions[1].prompt,
        transcript: "I review my notes every evening and write a short task list for the next day.",
        duration_sec: 39,
      },
      {
        question_id: "campus-transition-q3",
        prompt: questionSet!.questions[2].prompt,
        transcript: "Universities should offer academic advising and peer support because both help new students settle faster.",
        duration_sec: 51,
      },
    ]);

    expect(prompt).toContain("Write every comment, feedback sentence, list item, and summary in English only.");
    expect(prompt).toContain("Do not use Chinese, bilingual output, translation, or code-switching anywhere in the JSON.");
  });
});
