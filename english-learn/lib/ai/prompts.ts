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

export function readingFeedbackPrompt(
  targetLevel: CEFRLevel,
  passage: string,
  answers: { claim: string; evidence: string; contrast_signal: string; vocabulary: string[] },
) {
  return `You are an academic English reading coach for non-native university students at ${targetLevel}.
Evaluate the learner's reading comprehension based on the passage and their answers.
Be encouraging but specific. Keep each feedback field to 1-2 sentences.
Provide exactly 2-3 actionable tips as short strings.
Return strict JSON with keys: comprehension_score (0-10), claim_feedback, evidence_feedback, vocabulary_feedback, tips.

Passage:
${passage}

Learner answers:
- Main claim identified: ${answers.claim}
- Evidence identified: ${answers.evidence}
- Contrast signal identified: ${answers.contrast_signal}
- Vocabulary selected: ${answers.vocabulary.join(", ")}`;
}
