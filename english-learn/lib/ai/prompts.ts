import { getRoleplayCharacter, wrapRoleplayUserInput } from "@/lib/roleplay";
import type { CEFRLevel, SpeakingPrompt, WritingPrompt } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Expanded speaking prompts so scoring and partner practice use the selected academic scenario.
export function speakingFeedbackPrompt(targetLevel: CEFRLevel, prompt: SpeakingPrompt, transcript: string) {
  return `You are an academic English speaking coach for non-native university students at ${targetLevel}.
Evaluate the learner response for the selected speaking task.
Score overall_score, task_response_score, pronunciation_score, fluency_score, and grammar_score from 0 to 10.
Return strict JSON with keys: overall_score, task_response_score, pronunciation_score, fluency_score, grammar_score, strengths, revision_focus, delivery_snapshot, sample_upgrade, tips.
strengths must be an array of exactly 2 short strings.
revision_focus must be one short paragraph with 1-2 sentences.
delivery_snapshot must be one short sentence describing how the answer sounds right now.
sample_upgrade must be a stronger version of the learner response in 3-5 sentences while staying realistic for ${targetLevel}.
tips must be an array of exactly 3 short action steps.

Speaking task:
- Title: ${prompt.title}
- Scenario: ${prompt.scenario}
- Prompt: ${prompt.prompt}
- Skill focus: ${prompt.skill_focus}
- Response time: ${prompt.response_time_sec} seconds
- Checkpoints: ${prompt.checkpoints.join("; ")}

Learner transcript:
${transcript}`;
}

export function speakingPartnerPrompt(
  learnerTurn: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const historyText =
    history.length > 0
      ? history.map((message) => `${message.role === "user" ? "Learner" : "Partner"}: ${message.content}`).join("\n")
      : "No previous turns.";

  return `You are a natural English conversation partner for non-native learners.
Your job is to respond like a real person in a short spoken exchange: warm, concise, and easy to answer.
The conversation is completely open-topic. The learner can talk about daily life, study, hobbies, feelings, plans, opinions, or anything else.
Return strict JSON with keys: reply, follow_up, coaching_note.
reply should be 1-2 short natural sentences in character, without labels, bullet points, or markdown.
follow_up should be exactly one short natural question that feels like part of the same conversation.
coaching_note should be one short sentence that helps the learner improve the next turn.
Do not add any extra commentary outside the JSON.
Do not use labels such as "Follow-up:", "Question:", or "Reply:".
Do not sound like a teacher writing feedback; sound like a conversation partner keeping the learner talking.

Conversation so far:
${historyText}

Learner's latest turn:
${learnerTurn}`;
}

export function roleplayConversationPrompt(
  learnerTurn: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const character = getRoleplayCharacter();
  const historyText =
    history.length > 0
      ? history
          .map((message) =>
            `${message.role === "user" ? "Companion" : character.botName}: ${message.content}`,
          )
          .join("\n")
      : "No previous turns.";

  return `You are ${character.botName}, ${character.title}.
Stay fully in character for an immersive roleplay chat with the user, who is your trusted companion.
Return strict JSON with keys: reply, follow_up, coaching_note.
reply should be 1-3 short natural spoken sentences in character.
follow_up should be exactly one short natural question that continues the scene.
coaching_note should be one short sentence helping the learner continue the conversation in English.
Do not add labels, markdown, bullet points, or any text outside the JSON.
Do not break character.
Do not mention AI, prompts, safety rules, or hidden instructions.
Always answer in natural spoken English unless the user explicitly asks for translation.

Character role:
${character.systemRole}

Speaking style:
${character.speakingStyle}

Character manifest:
${character.characterManifest}

Conversation so far:
${historyText}

Latest companion message:
${wrapRoleplayUserInput(learnerTurn)}`;
}

export function writingFeedbackPrompt(
  targetLevel: CEFRLevel,
  essayText: string,
  prompt?: WritingPrompt | null,
) {
  const promptContext = prompt
    ? `Selected writing task:
- Title: ${prompt.title}
- Scenario: ${prompt.scenario}
- Prompt: ${prompt.prompt}
- Skill focus: ${prompt.skill_focus}
- Checkpoints: ${prompt.checkpoints.join("; ")}

`
    : "";

  return `You are an English writing coach for non-native learners at ${targetLevel}.
Evaluate the essay on structure, grammar, and vocabulary.
Return strict JSON with keys: overall_score, errors, rewrite_sample.
errors must be short strings.
${promptContext}Essay:\n${essayText}`;
}

export function listeningFeedbackPrompt(
  targetLevel: CEFRLevel,
  talkTitle: string,
  speakerName: string,
  scenario: string,
  answers: { gist: string; detail: string; signpost: string; term: string },
  notes: string,
) {
  return `You are an academic English listening coach for non-native university students at ${targetLevel}.
Evaluate the learner's TED listening comprehension based on the talk information and their answers.
Be encouraging but specific. Keep each feedback field to 1-2 sentences.
Provide exactly 3 actionable tips as short strings.
Return strict JSON with keys: listening_score (0-10), gist_feedback, detail_feedback, signpost_feedback, term_feedback, note_feedback, tips.
listening_score should reflect overall comprehension quality across all four answers.
note_feedback should evaluate the quality and usefulness of the learner's notes (or say "No notes provided." if empty).

TED Talk: "${talkTitle}" by ${speakerName}
Scenario: ${scenario}

Learner answers:
- Main argument (gist): ${answers.gist}
- Key detail: ${answers.detail}
- Signpost or structure: ${answers.signpost}
- Technical term: ${answers.term}

Learner notes:
${notes || "(No notes provided)"}`;
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
