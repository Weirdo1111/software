import type { CEFRLevel, SpeakingPrompt } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Added a reusable prompt bank for the academic speaking studio.
export const speakingPrompts: SpeakingPrompt[] = [
  {
    id: "a1-study-routine",
    level: "A1",
    title: "Study routine introduction",
    scenario: "Orientation pair discussion",
    prompt: "Introduce one study habit that helps you learn in English and explain why it is useful.",
    response_time_sec: 45,
    skill_focus: "Give one clear idea with one simple reason.",
    partner_role: "friendly student partner",
    partner_goal: "help the learner give a simple, complete answer about study habits",
    useful_phrases: ["I usually...", "It helps me because...", "For my classes..."],
    checkpoints: [
      "State one study habit clearly.",
      "Give one reason with because.",
      "Finish with a simple result or benefit.",
    ],
    sample_opening: "I usually review my class notes every evening because it helps me remember key words.",
  },
  {
    id: "a1-asking-for-help",
    level: "A1",
    title: "Ask for assignment help",
    scenario: "Short tutor meeting",
    prompt: "Explain one problem you have with an assignment and say what help you need from the tutor.",
    response_time_sec: 45,
    skill_focus: "Describe one problem and one support request.",
    partner_role: "patient tutor",
    partner_goal: "help the learner explain a classroom problem and request support politely",
    useful_phrases: ["I have difficulty with...", "Could you help me with...", "I need more practice in..."],
    checkpoints: [
      "Name the assignment problem.",
      "Use a polite request.",
      "Say what support would help next.",
    ],
    sample_opening: "I have difficulty with the reading summary, and I need more help with academic vocabulary.",
  },
  {
    id: "a2-seminar-preparation",
    level: "A2",
    title: "Seminar preparation advice",
    scenario: "Peer study conversation",
    prompt: "Give advice to a classmate about how to prepare for an academic seminar in English.",
    response_time_sec: 60,
    skill_focus: "Organize advice with sequence and support.",
    partner_role: "classmate preparing for a seminar",
    partner_goal: "push the learner to offer practical and organized speaking advice",
    useful_phrases: ["First, you should...", "It is useful to...", "This can help you..."],
    checkpoints: [
      "Give at least two steps.",
      "Use a sequence word such as first or then.",
      "Explain why the advice helps.",
    ],
    sample_opening: "First, you should read the topic early and write two short ideas before the seminar starts.",
  },
  {
    id: "a2-study-group",
    level: "A2",
    title: "Recommend a study group",
    scenario: "Campus support fair",
    prompt: "Recommend a study group or club to a new student and explain how it supports academic English.",
    response_time_sec: 60,
    skill_focus: "Recommend one option with one clear benefit and example.",
    partner_role: "new international student",
    partner_goal: "encourage the learner to make a clear recommendation with support",
    useful_phrases: ["I recommend...", "One benefit is...", "For example..."],
    checkpoints: [
      "Name the group clearly.",
      "Give one benefit for academic English.",
      "Add one short example.",
    ],
    sample_opening: "I recommend the weekly discussion club because it gives students more chances to speak in English.",
  },
  {
    id: "b1-language-support",
    level: "B1",
    title: "University language support",
    scenario: "Seminar response",
    prompt: "In one minute, explain how a university should support students who are learning through English.",
    response_time_sec: 60,
    skill_focus: "State a position, give one reason, and support it with one example.",
    partner_role: "seminar classmate",
    partner_goal: "challenge the learner to defend one practical support idea",
    useful_phrases: ["I would argue that...", "One reason is that...", "A useful example is..."],
    checkpoints: [
      "Open with a clear position.",
      "Give one specific reason.",
      "Add one concrete support example.",
    ],
    sample_opening: "I would argue that universities should give clearer task guidance and small-group speaking practice.",
  },
  {
    id: "b1-reading-discussion",
    level: "B1",
    title: "Reading discussion response",
    scenario: "Tutorial follow-up",
    prompt: "Respond to the claim that online reading improves flexibility but reduces deep understanding.",
    response_time_sec: 75,
    skill_focus: "Respond to a claim and weigh one advantage against one limitation.",
    partner_role: "tutorial leader",
    partner_goal: "ask the learner to compare benefits and drawbacks in a balanced way",
    useful_phrases: ["I partly agree because...", "However, we should also consider...", "This means that..."],
    checkpoints: [
      "Show your position clearly.",
      "Mention both benefit and limitation.",
      "Use one contrast signal such as however.",
    ],
    sample_opening: "I partly agree because online reading is flexible, but it can reduce concentration when students read too quickly.",
  },
  {
    id: "b2-research-summary",
    level: "B2",
    title: "Mini research summary",
    scenario: "Research methods class",
    prompt: "Summarize a small campus study and explain what conclusion a lecturer could draw from it.",
    response_time_sec: 90,
    skill_focus: "Summarize evidence and interpret its meaning with academic caution.",
    partner_role: "research methods tutor",
    partner_goal: "push the learner to connect evidence with a careful conclusion",
    useful_phrases: ["The study suggests that...", "The data indicates...", "A cautious conclusion is..."],
    checkpoints: [
      "State what the study found.",
      "Interpret the finding carefully.",
      "Avoid overgeneralizing the result.",
    ],
    sample_opening: "The study suggests that students who join weekly discussion groups identify evidence more accurately in seminar readings.",
  },
  {
    id: "b2-policy-debate",
    level: "B2",
    title: "Attendance policy debate",
    scenario: "Academic debate practice",
    prompt: "Argue for or against a strict attendance policy in English-medium university courses.",
    response_time_sec: 90,
    skill_focus: "Take a position, justify it, and address one counterpoint.",
    partner_role: "debate opponent",
    partner_goal: "test whether the learner can defend a policy position under pressure",
    useful_phrases: ["My position is that...", "The strongest argument is...", "A counterpoint might be..."],
    checkpoints: [
      "State a direct position.",
      "Give one strong justification.",
      "Address one counterargument briefly.",
    ],
    sample_opening: "My position is that attendance policies should be firm but flexible when students face documented academic or health issues.",
  },
];

export function getSpeakingPromptsForLevel(level: CEFRLevel) {
  return speakingPrompts.filter((prompt) => prompt.level === level);
}

export function getSpeakingPromptById(id: string) {
  return speakingPrompts.find((prompt) => prompt.id === id) ?? null;
}
