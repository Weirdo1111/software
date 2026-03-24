import type { CEFRLevel, PlacementQuestion, SkillBreakdown } from "@/types/learning";

const skillOrder = ["listening", "speaking", "reading", "writing"] as const;

type PlacementSkill = (typeof skillOrder)[number];

const skillLabels: Record<PlacementSkill, string> = {
  listening: "Listening",
  speaking: "Speaking",
  reading: "Reading",
  writing: "Writing",
};

export const placementQuestions: PlacementQuestion[] = [
  {
    id: "listening-a1",
    type: "single_choice",
    skill: "listening",
    level: "A1",
    context: "Lecture excerpt: 'Please open page ten and underline the new words before we begin.'",
    prompt: "What should the student do first?",
    options: ["Underline the new words on page ten", "Close the book", "Write a summary", "Ask a classmate for help"],
    answer: 0,
  },
  {
    id: "speaking-a1",
    type: "single_choice",
    skill: "speaking",
    level: "A1",
    context: "Seminar check-in: the teacher asks, 'How are you finding today's topic?'",
    prompt: "Choose the most natural short reply.",
    options: ["It is interesting and clear.", "I am understand now.", "Interesting because yes.", "Clear topic for I."],
    answer: 0,
  },
  {
    id: "reading-a1",
    type: "single_choice",
    skill: "reading",
    level: "A1",
    context: "Notice: 'The library closes at 6 p.m. on Fridays.'",
    prompt: "What time does the library close on Friday?",
    options: ["At 5 p.m.", "At 6 p.m.", "At 7 p.m.", "At 8 p.m."],
    answer: 1,
  },
  {
    id: "writing-a1",
    type: "single_choice",
    skill: "writing",
    level: "A1",
    prompt: "Choose the best sentence for a simple study diary.",
    options: [
      "Today I studied English for thirty minutes after class.",
      "Today study English after class thirty minutes.",
      "English was study today class after thirty minutes.",
      "After class study I English thirty minutes today.",
    ],
    answer: 0,
  },
  {
    id: "listening-a2",
    type: "single_choice",
    skill: "listening",
    level: "A2",
    context:
      "Tutor message: 'Upload your paragraph by Thursday evening. On Friday we will review common mistakes together.'",
    prompt: "What happens on Friday?",
    options: ["Students upload the paragraph", "The tutor reviews mistakes with the class", "The lesson is cancelled", "Students take a final exam"],
    answer: 1,
  },
  {
    id: "speaking-a2",
    type: "single_choice",
    skill: "speaking",
    level: "A2",
    context: "A classmate says, 'I missed the reading because I was ill yesterday.'",
    prompt: "Choose the most supportive spoken response.",
    options: [
      "I hope you feel better. I can share my notes.",
      "You miss because bad planning.",
      "Reading yesterday not for you now.",
      "Be well and I sharing note maybe.",
    ],
    answer: 0,
  },
  {
    id: "reading-a2",
    type: "single_choice",
    skill: "reading",
    level: "A2",
    context:
      "Course website: 'Students should bring one printed article and two discussion questions to Monday's workshop.'",
    prompt: "What must students prepare for the workshop?",
    options: [
      "One article and two discussion questions",
      "A ten-minute presentation",
      "Three printed articles",
      "A vocabulary test",
    ],
    answer: 0,
  },
  {
    id: "writing-a2",
    type: "single_choice",
    skill: "writing",
    level: "A2",
    prompt: "Choose the best closing sentence for a short email to your teacher.",
    options: [
      "Thank you for your help. I will revise the paragraph tonight.",
      "Thanks teacher revise tonight maybe.",
      "I revise paragraph because help and thank.",
      "Tonight I thank for revise help.",
    ],
    answer: 0,
  },
  {
    id: "listening-b1",
    type: "single_choice",
    skill: "listening",
    level: "B1",
    context:
      "Lecture note: 'Although the first survey showed positive results, the sample size was too small to support a strong conclusion.'",
    prompt: "What is the speaker's main caution?",
    options: [
      "The survey took too long to complete",
      "The results were completely negative",
      "The evidence is limited because the sample was small",
      "The conclusion should focus only on cost",
    ],
    answer: 2,
  },
  {
    id: "speaking-b1",
    type: "single_choice",
    skill: "speaking",
    level: "B1",
    context: "During a seminar, you want to agree but also add a limitation.",
    prompt: "Which response sounds most appropriate?",
    options: [
      "I agree with your point, but the data only reflects one group of students.",
      "I am agree and the data reflects one group maybe yes.",
      "Your point is agree because one group data.",
      "Agreeing, but data one group so is probleming.",
    ],
    answer: 0,
  },
  {
    id: "reading-b1",
    type: "single_choice",
    skill: "reading",
    level: "B1",
    context:
      "Article excerpt: 'Students who annotated their readings weekly were more likely to recall key concepts during timed assessments.'",
    prompt: "What does the excerpt suggest?",
    options: [
      "Timed assessments should be removed",
      "Weekly annotation may improve recall in tests",
      "Students dislike weekly reading tasks",
      "Key concepts are difficult to define",
    ],
    answer: 1,
  },
  {
    id: "writing-b1",
    type: "single_choice",
    skill: "writing",
    level: "B1",
    prompt: "Choose the best topic sentence for a body paragraph about online study habits.",
    options: [
      "Online study can improve focus when learners plan their time carefully.",
      "Online study is many things for all students everywhere.",
      "Learners focus careful and online time planning is study.",
      "There are habits and focus because internet and homework.",
    ],
    answer: 0,
  },
  {
    id: "listening-b2",
    type: "single_choice",
    skill: "listening",
    level: "B2",
    context:
      "Seminar excerpt: 'The intervention appeared effective at first glance; however, once attendance was controlled for, the advantage narrowed substantially.'",
    prompt: "What is the speaker implying?",
    options: [
      "The intervention remained equally strong after analysis",
      "Attendance probably explains part of the reported improvement",
      "The seminar should focus only on attendance policy",
      "The results were ignored by the researchers",
    ],
    answer: 1,
  },
  {
    id: "speaking-b2",
    type: "single_choice",
    skill: "speaking",
    level: "B2",
    context: "You are challenging a claim in an academic discussion while staying polite.",
    prompt: "Which reply is the strongest?",
    options: [
      "I see the logic, but I am not fully convinced because the comparison group was not clearly defined.",
      "I do not accept because it is weak and unclear all around.",
      "Your claim is bad because the group is not group enough.",
      "I disagreeing because the comparison was unclear maybe everything.",
    ],
    answer: 0,
  },
  {
    id: "reading-b2",
    type: "single_choice",
    skill: "reading",
    level: "B2",
    context:
      "Research summary: 'While prior studies linked screen time with weaker concentration, the present study found that task design mediated most of that effect.'",
    prompt: "What is the key relationship in the summary?",
    options: [
      "Screen time always damages concentration",
      "Earlier studies were entirely incorrect",
      "Task design influences how strongly screen time affects concentration",
      "Concentration no longer matters in digital study",
    ],
    answer: 2,
  },
  {
    id: "writing-b2",
    type: "single_choice",
    skill: "writing",
    level: "B2",
    prompt: "Choose the best revision for an academic claim.",
    options: [
      "The findings suggest a correlation between attendance consistency and higher assessment performance, although causation remains uncertain.",
      "The findings prove attendance causes every learner to perform better in all assessments.",
      "Attendance is good, and the findings are better, so causation is obvious.",
      "These findings mean attendance and performance are basically the same thing.",
    ],
    answer: 0,
  },
];

const skillQuestionTotals = placementQuestions.reduce<Record<PlacementSkill, number>>(
  (totals, question) => {
    totals[question.skill] += 1;
    return totals;
  },
  {
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
  },
);

const levelScoreBands: { min: number; level: CEFRLevel; band: "Low" | "Medium" | "High" }[] = [
  { min: 0, level: "A1", band: "Low" },
  { min: 5, level: "A2", band: "Low" },
  { min: 9, level: "B1", band: "Medium" },
  { min: 13, level: "B2", band: "High" },
];

function createEmptyBreakdown(): SkillBreakdown {
  return {
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
  };
}

function compareSkills(
  left: [PlacementSkill, number],
  right: [PlacementSkill, number],
  totals: Record<PlacementSkill, number>,
) {
  const leftAccuracy = left[1] / totals[left[0]];
  const rightAccuracy = right[1] / totals[right[0]];

  if (leftAccuracy !== rightAccuracy) {
    return rightAccuracy - leftAccuracy;
  }

  return skillOrder.indexOf(left[0]) - skillOrder.indexOf(right[0]);
}

function buildPlacementSummary(level: CEFRLevel, strongestSkill: PlacementSkill, weakestSkill: PlacementSkill) {
  const focusLabel = skillLabels[weakestSkill].toLowerCase();

  if (level === "A1") {
    return `Build core classroom English first, then use extra ${focusLabel} practice to stabilize the next band.`;
  }

  if (level === "A2") {
    return `The learner is handling simple study tasks, but ${focusLabel} still needs more control before the B1 pathway feels comfortable.`;
  }

  if (level === "B1") {
    return `The learner can manage academic study routines already, with ${skillLabels[strongestSkill].toLowerCase()} as a visible strength and ${focusLabel} as the next upgrade target.`;
  }

  return `The learner is ready for the advanced track, though continued ${focusLabel} work will make performance more consistent across all four skills.`;
}

export function evaluatePlacement(answers: number[]) {
  const breakdown = createEmptyBreakdown();
  let totalCorrect = 0;

  placementQuestions.forEach((question, index) => {
    const isCorrect = answers[index] === question.answer;
    if (isCorrect) {
      totalCorrect += 1;
      breakdown[question.skill] += 1;
    }
  });

  const scoredSkills = Object.entries(breakdown) as [PlacementSkill, number][];
  scoredSkills.sort((left, right) => compareSkills(left, right, skillQuestionTotals));

  const strongestSkill = scoredSkills[0]?.[0] ?? "reading";
  const weakestSkill = scoredSkills.at(-1)?.[0] ?? "writing";
  const matchedBand = [...levelScoreBands].reverse().find((band) => totalCorrect >= band.min) ?? levelScoreBands[0];

  return {
    score: totalCorrect,
    total_questions: placementQuestions.length,
    cefr_level: matchedBand.level,
    band_label: matchedBand.band,
    skill_breakdown: breakdown,
    strongest_skill: strongestSkill,
    weakest_skill: weakestSkill,
    recommended_focus: skillLabels[weakestSkill],
    summary: buildPlacementSummary(matchedBand.level, strongestSkill, weakestSkill),
    recommended_path_id: `${matchedBand.level}-core-path`,
  };
}

export function getPlacementQuestionSet(limit = placementQuestions.length) {
  return placementQuestions.slice(0, Math.min(limit, placementQuestions.length));
}
