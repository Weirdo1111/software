import type { CEFRLevel, PlacementQuestion, SkillBreakdown } from "@/types/learning";

export const placementQuestions: PlacementQuestion[] = [
  {
    id: "q1",
    type: "single_choice",
    skill: "vocab",
    prompt: "Choose the best word: Please ___ notes during the lecture.",
    options: ["take", "takes", "took", "taking"],
    answer: 0,
    level: "A1",
  },
  {
    id: "q2",
    type: "single_choice",
    skill: "grammar",
    prompt: "Which is correct? The tutor ___ the assignment yesterday.",
    options: ["check", "checks", "checked", "checking"],
    answer: 2,
    level: "A1",
  },
  {
    id: "q3",
    type: "single_choice",
    skill: "reading",
    prompt: "What does 'main idea' mean in a reading task?",
    options: ["the most important point", "a small detail", "a personal opinion", "a spelling rule"],
    answer: 0,
    level: "A1",
  },
  {
    id: "q4",
    type: "single_choice",
    skill: "listening",
    prompt: "Pick the best form: By next month, we ___ this project for one year.",
    options: ["will work on", "will have worked on", "worked on", "have worked on"],
    answer: 1,
    level: "B1",
  },
  {
    id: "q5",
    type: "single_choice",
    skill: "grammar",
    prompt: "If students ___ more examples, they would understand the theory better.",
    options: ["have", "had", "will have", "are having"],
    answer: 1,
    level: "B1",
  },
  {
    id: "q6",
    type: "single_choice",
    skill: "reading",
    prompt: "Choose the closest meaning of 'significant' in an academic article.",
    options: ["important", "temporary", "expensive", "unclear"],
    answer: 0,
    level: "B2",
  },
  {
    id: "q7",
    type: "single_choice",
    skill: "vocab",
    prompt: "Select the best collocation: conduct ___.",
    options: ["research", "a progress", "an advice", "knowledge"],
    answer: 0,
    level: "A2",
  },
  {
    id: "q8",
    type: "single_choice",
    skill: "listening",
    prompt: "Which sentence sounds natural in a seminar discussion?",
    options: ["I am agree with the point.", "I agree with the point.", "I agreeing with the point.", "I do agreed with the point."],
    answer: 1,
    level: "A2",
  },
  {
    id: "q9",
    type: "single_choice",
    skill: "reading",
    prompt: "Choose the best transition for contrast in an essay.",
    options: ["Therefore", "However", "For example", "As a result"],
    answer: 1,
    level: "B1",
  },
  {
    id: "q10",
    type: "single_choice",
    skill: "grammar",
    prompt: "The speaker was praised for ___ a balanced argument.",
    options: ["present", "presenting", "to present", "presented"],
    answer: 1,
    level: "B2",
  },
];

const levelScoreBands: { min: number; level: CEFRLevel }[] = [
  { min: 0, level: "A1" },
  { min: 3, level: "A2" },
  { min: 6, level: "B1" },
  { min: 8, level: "B2" },
];

export function evaluatePlacement(answers: number[]) {
  const breakdown: SkillBreakdown = {
    vocab: 0,
    grammar: 0,
    reading: 0,
    listening: 0,
  };

  let totalCorrect = 0;

  placementQuestions.forEach((question, index) => {
    const isCorrect = answers[index] === question.answer;
    if (isCorrect) {
      totalCorrect += 1;
      breakdown[question.skill] += 1;
    }
  });

  const cefr_level = [...levelScoreBands].reverse().find((band) => totalCorrect >= band.min)?.level ?? "A1";

  return {
    score: totalCorrect,
    cefr_level,
    skill_breakdown: breakdown,
    recommended_path_id: `${cefr_level}-core-path`,
  };
}

export function getPlacementQuestionSet(limit = 20) {
  if (limit <= placementQuestions.length) {
    return placementQuestions.slice(0, limit);
  }

  const repeated: PlacementQuestion[] = [];
  while (repeated.length < limit) {
    repeated.push(...placementQuestions);
  }

  return repeated.slice(0, limit).map((question, idx) => ({
    ...question,
    id: `${question.id}-${idx + 1}`,
  }));
}
