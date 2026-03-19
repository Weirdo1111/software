import type { CEFRLevel } from "@/types/learning";

export function speakingFeedbackPrompt(targetLevel: CEFRLevel, transcript: string) {
  return `You are an English speaking coach for non-native learners at ${targetLevel}.
Score pronunciation, fluency, and grammar from 0 to 10.
Provide exactly 3 actionable tips.
Return strict JSON with keys: pronunciation_score, fluency_score, grammar_score, tips.
Transcript:\n${transcript}`;
}

export function writingFeedbackPrompt(targetLevel: CEFRLevel, essayText: string) {
  return `You are an English writing coach for non-native learners at ${targetLevel}.
Evaluate the essay on structure, grammar, and vocabulary.
Return strict JSON with keys: overall_score, errors, rewrite_sample.
errors must be short strings.
Essay:\n${essayText}`;
}
