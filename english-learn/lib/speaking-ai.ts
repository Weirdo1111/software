import type { SpeakingFeedback, SpeakingPartnerReply, SpeakingPrompt } from "@/types/learning";

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
    delivery_snapshot:
      wordCount >= 40
        ? "The response sounds like a workable seminar turn, but it still needs tighter task framing."
        : "The response is understandable, but it still sounds too brief for a strong academic answer.",
    sample_upgrade: buildMockSampleUpgrade(transcript, hasReason, hasExample),
    tips: [
      hasReason ? "Keep your reason, but make it shorter and more direct." : "Add one reason using because or one reason is that.",
      hasExample ? "Tighten the example so it directly supports your main claim." : "Add one brief academic example from class, campus life, or independent study.",
      hasContrast ? "Use the contrast point earlier so the response sounds more controlled." : "Use one transition such as however, for example, or therefore.",
    ],
  };
}

export function buildMockSpeakingPartnerReply(learnerTurn: string, prompt: SpeakingPrompt): SpeakingPartnerReply {
  const normalizedTurn = learnerTurn.trim().toLowerCase();
  const asksQuestion = normalizedTurn.includes("?");
  const isGreeting = /\bhello\b|\bhi\b|\bhey\b/.test(normalizedTurn);
  const mentionsReason = /\bbecause|so|therefore|reason\b/.test(normalizedTurn);
  const mentionsExample = /\bfor example|for instance|such as|example\b/.test(normalizedTurn);

  if (isGreeting) {
    return {
      reply: `Hi, I am your ${prompt.partner_role}, and I am ready to hear your idea.`,
      follow_up: `What is your main point for ${prompt.title.toLowerCase()}?`,
      coaching_note: "Start with one direct position before you add support.",
    };
  }

  if (asksQuestion) {
    return {
      reply: "That is a fair question, but I want to hear your position first.",
      follow_up: "What would you recommend in this situation?",
      coaching_note: "Answer the question, then add one short reason tied to the task.",
    };
  }

  if (!mentionsReason) {
    return {
      reply: "Your idea is understandable, but it still needs a clearer reason.",
      follow_up: "Why do you think that is the best choice here?",
      coaching_note: "Use one reason marker such as because or one reason is that.",
    };
  }

  if (!mentionsExample) {
    return {
      reply: "That reason works. Now the answer needs one more concrete detail.",
      follow_up: "Can you add one example from class, campus life, or your major?",
      coaching_note: "Add one brief example so the response sounds more convincing.",
    };
  }

  return {
    reply: `Your answer is moving in the right direction for ${prompt.scenario.toLowerCase()}.`,
    follow_up: "Can you make the ending more direct and controlled?",
    coaching_note: "Keep the next turn concise and tie it back to the task goal.",
  };
}

function buildMockSampleUpgrade(transcript: string, hasReason: boolean, hasExample: boolean) {
  const baseIdea = transcript.trim().replace(/\s+/g, " ");
  const opening = baseIdea.length > 0 ? baseIdea : "Universities should provide clearer academic English support.";
  const reasonSentence = hasReason
    ? "This matters because students need guided chances to explain ideas clearly in English."
    : "One reason is that guided speaking practice helps students process course ideas more accurately.";
  const exampleSentence = hasExample
    ? "For example, short tutorial tasks can help students test vocabulary and receive immediate feedback from tutors."
    : "For example, tutors can ask students to give one-minute responses before seminar discussion begins.";

  return `${opening} ${reasonSentence} ${exampleSentence} As a result, students build confidence and participate more actively in academic discussion.`;
}
