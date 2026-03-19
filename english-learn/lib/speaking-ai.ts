import type { SpeakingFeedback, SpeakingPartnerReply } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Centralized speaking AI fallback logic so routes stay thin and the scoring rules are easier to maintain.
export function safeParseAIJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function clampScore(value: number) {
  return Math.min(9.5, Math.max(5.5, Number(value.toFixed(1))));
}

export function buildMockSpeakingFeedback(transcript: string, checkpoints: string[]): SpeakingFeedback {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const hasExample = /\bfor example|for instance|such as\b/i.test(transcript);
  const hasReason = /\bbecause|since|therefore|so\b/i.test(transcript);
  const hasContrast = /\bhowever|but|although|while\b/i.test(transcript);

  const taskResponseScore = clampScore(
    5.8 +
      (wordCount >= 45 ? 0.9 : wordCount >= 25 ? 0.5 : 0) +
      (hasExample ? 0.5 : 0) +
      (hasReason ? 0.4 : 0) +
      (hasContrast ? 0.3 : 0),
  );
  const pronunciationScore = clampScore(6.6 + (wordCount >= 20 ? 0.3 : 0));
  const fluencyScore = clampScore(6.2 + (wordCount >= 35 ? 0.6 : 0) + (hasReason || hasContrast ? 0.3 : 0));
  const grammarScore = clampScore(6.4 + (wordCount >= 30 ? 0.5 : 0));
  const overallScore = clampScore((taskResponseScore + pronunciationScore + fluencyScore + grammarScore) / 4);

  const strengths = [
    wordCount >= 25 ? "Your response has enough content to sound like a real academic turn." : "You already have a clear starting idea to build on.",
    hasReason || hasExample
      ? "You are beginning to support ideas instead of listing them."
      : "Your main point is understandable, which gives you a workable base.",
  ];

  const missingCheckpoint = checkpoints.find((checkpoint) => {
    const lower = checkpoint.toLowerCase();
    if (lower.includes("example")) return !hasExample;
    if (lower.includes("reason")) return !hasReason;
    if (lower.includes("contrast") || lower.includes("counter")) return !hasContrast;
    return false;
  });

  return {
    overall_score: overallScore,
    task_response_score: taskResponseScore,
    pronunciation_score: pronunciationScore,
    fluency_score: fluencyScore,
    grammar_score: grammarScore,
    strengths,
    revision_focus: missingCheckpoint
      ? `Your next revision should target this task requirement: ${missingCheckpoint}.`
      : "Your next revision should focus on sounding more precise and more confidently structured.",
    tips: [
      hasReason ? "Keep your reason, but make it shorter and more direct." : "Add one reason using because or one reason is that.",
      hasExample ? "Tighten the example so it directly supports your main claim." : "Add one brief academic example from class, campus life, or independent study.",
      hasContrast ? "Use the contrast point earlier so the response sounds more controlled." : "Use one transition such as however, for example, or therefore.",
    ],
  };
}

export function buildMockSpeakingPartnerReply(learnerTurn: string): SpeakingPartnerReply {
  const hasExample = /\bfor example|for instance|such as\b/i.test(learnerTurn);
  const hasReason = /\bbecause|since|therefore|so\b/i.test(learnerTurn);

  return {
    reply: hasReason
      ? "Your idea is clear, and I can follow your main reason. The response already sounds more like a seminar contribution than a short classroom answer."
      : "I understand your main idea, but the answer still feels a little brief for an academic discussion. Add one reason so the position sounds more convincing.",
    follow_up: hasExample
      ? "Can you explain why that example matters for university learning?"
      : "Can you add one specific example from class, campus life, or independent study?",
    coaching_note: hasReason
      ? "Use a transition phrase at the start of the next sentence so the response sounds more controlled."
      : "Start the next turn with one reason is that or this is important because.",
  };
}
