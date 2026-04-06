export const SPEAKING_TEST_EXAMINER_CHARACTER_ID = "speaking_examiner" as const;

export type SpeakingTestQuestion = {
  id: string;
  prompt: string;
  preparationHint: string;
  expectedSeconds: number;
};

export type SpeakingTestQuestionSet = {
  id: string;
  title: string;
  theme: string;
  examinerBrief: string;
  openingInstruction: string;
  questions: [SpeakingTestQuestion, SpeakingTestQuestion, SpeakingTestQuestion];
};

export type SpeakingTestAnswerInput = {
  question_id: string;
  prompt: string;
  transcript: string;
  duration_sec: number;
};

export type SpeakingTestFeedback = {
  overall_score: number;
  fluency_score: number;
  pronunciation_score: number;
  intonation_score: number;
  vocabulary_score: number;
  grammar_score: number;
  overall_comment: string;
  fluency_feedback: string;
  pronunciation_feedback: string;
  intonation_feedback: string;
  vocabulary_feedback: string;
  grammar_feedback: string;
  transcript_overview: string;
  strengths: string[];
  priorities: string[];
};

const SPEAKING_TEST_SETS: SpeakingTestQuestionSet[] = [
  {
    id: "campus-transition",
    title: "Campus Transition Interview",
    theme: "settling into university life",
    examinerBrief: "A first-week oral check about adjustment, study habits, and student support.",
    openingInstruction:
      "You are conducting a formal but supportive university oral test. Keep the interaction structured. If the learner message includes [SYSTEM CONTROL], treat it as a platform instruction rather than candidate speech. When instructed to ask a question exactly as written, read it naturally, keep it short, and do not answer it yourself.",
    questions: [
      {
        id: "campus-transition-q1",
        prompt: "Please introduce yourself and explain one challenge you faced when adapting to university life.",
        preparationHint: "Give one concrete challenge and explain why it mattered.",
        expectedSeconds: 45,
      },
      {
        id: "campus-transition-q2",
        prompt: "Describe a study habit that helps you manage your coursework effectively.",
        preparationHint: "Mention the habit, how often you use it, and why it works.",
        expectedSeconds: 45,
      },
      {
        id: "campus-transition-q3",
        prompt: "What kind of support should universities offer new international students, and why?",
        preparationHint: "State one or two support ideas and justify them.",
        expectedSeconds: 60,
      },
    ],
  },
  {
    id: "seminar-readiness",
    title: "Seminar Readiness Interview",
    theme: "discussion preparation and participation",
    examinerBrief: "A speaking check focused on seminar contribution, evidence, and confidence.",
    openingInstruction:
      "You are conducting a formal but supportive university oral test. Keep the interaction structured. If the learner message includes [SYSTEM CONTROL], treat it as a platform instruction rather than candidate speech. When instructed to ask a question exactly as written, read it naturally, keep it short, and do not answer it yourself.",
    questions: [
      {
        id: "seminar-readiness-q1",
        prompt: "How do you prepare before joining a seminar discussion in English?",
        preparationHint: "Explain your preparation steps in order.",
        expectedSeconds: 45,
      },
      {
        id: "seminar-readiness-q2",
        prompt: "Describe a time when you disagreed with someone in class. How would you express that disagreement politely?",
        preparationHint: "Use one example and include polite language.",
        expectedSeconds: 60,
      },
      {
        id: "seminar-readiness-q3",
        prompt: "Why is it important to support your opinion with evidence in academic discussion?",
        preparationHint: "Link evidence to clarity, trust, or academic quality.",
        expectedSeconds: 60,
      },
    ],
  },
  {
    id: "team-project",
    title: "Team Project Interview",
    theme: "group work and communication",
    examinerBrief: "A speaking check about collaboration, responsibility, and problem-solving in projects.",
    openingInstruction:
      "You are conducting a formal but supportive university oral test. Keep the interaction structured. If the learner message includes [SYSTEM CONTROL], treat it as a platform instruction rather than candidate speech. When instructed to ask a question exactly as written, read it naturally, keep it short, and do not answer it yourself.",
    questions: [
      {
        id: "team-project-q1",
        prompt: "Tell me about your role in a successful team project.",
        preparationHint: "State your role, your actions, and the result.",
        expectedSeconds: 50,
      },
      {
        id: "team-project-q2",
        prompt: "What would you do if one member of your group stopped contributing?",
        preparationHint: "Explain the steps you would take and keep the tone professional.",
        expectedSeconds: 60,
      },
      {
        id: "team-project-q3",
        prompt: "Which is more important in teamwork: leadership or communication? Explain your view.",
        preparationHint: "Choose one position and support it with reasons.",
        expectedSeconds: 60,
      },
    ],
  },
  {
    id: "independent-learning",
    title: "Independent Learning Interview",
    theme: "self-study and reflection",
    examinerBrief: "A speaking check about planning, motivation, and evaluating progress.",
    openingInstruction:
      "You are conducting a formal but supportive university oral test. Keep the interaction structured. If the learner message includes [SYSTEM CONTROL], treat it as a platform instruction rather than candidate speech. When instructed to ask a question exactly as written, read it naturally, keep it short, and do not answer it yourself.",
    questions: [
      {
        id: "independent-learning-q1",
        prompt: "How do you study English independently outside class?",
        preparationHint: "Mention your routine and the tools or resources you use.",
        expectedSeconds: 45,
      },
      {
        id: "independent-learning-q2",
        prompt: "How do you stay motivated when progress feels slow?",
        preparationHint: "Use one practical strategy and explain why it helps.",
        expectedSeconds: 50,
      },
      {
        id: "independent-learning-q3",
        prompt: "What is the best way to measure improvement in spoken English?",
        preparationHint: "Give clear criteria and explain why they matter.",
        expectedSeconds: 60,
      },
    ],
  },
  {
    id: "city-and-culture",
    title: "City and Culture Interview",
    theme: "living, culture, and communication",
    examinerBrief: "A speaking check about cultural adjustment, observation, and daily communication.",
    openingInstruction:
      "You are conducting a formal but supportive university oral test. Keep the interaction structured. If the learner message includes [SYSTEM CONTROL], treat it as a platform instruction rather than candidate speech. When instructed to ask a question exactly as written, read it naturally, keep it short, and do not answer it yourself.",
    questions: [
      {
        id: "city-and-culture-q1",
        prompt: "Describe one cultural difference you have noticed at university and how you responded to it.",
        preparationHint: "Use one clear example and explain your reaction.",
        expectedSeconds: 50,
      },
      {
        id: "city-and-culture-q2",
        prompt: "What makes communication easier when people come from different backgrounds?",
        preparationHint: "Mention two useful communication behaviors.",
        expectedSeconds: 55,
      },
      {
        id: "city-and-culture-q3",
        prompt: "How can students build a sense of belonging in a new city?",
        preparationHint: "Give specific ideas rather than general advice.",
        expectedSeconds: 60,
      },
    ],
  },
];

export function getSpeakingTestQuestionSets() {
  return SPEAKING_TEST_SETS;
}

export function getSpeakingTestQuestionSetById(setId: string) {
  return SPEAKING_TEST_SETS.find((set) => set.id === setId) ?? null;
}

export function pickRandomSpeakingTestQuestionSet() {
  const index = Math.floor(Math.random() * SPEAKING_TEST_SETS.length);
  return SPEAKING_TEST_SETS[index] ?? SPEAKING_TEST_SETS[0];
}

export function normalizeSpeakingTestFeedback(input: SpeakingTestFeedback): SpeakingTestFeedback {
  const fluency = clampScore20(input.fluency_score);
  const pronunciation = clampScore20(input.pronunciation_score);
  const intonation = clampScore20(input.intonation_score);
  const vocabulary = clampScore20(input.vocabulary_score);
  const grammar = clampScore20(input.grammar_score);
  const overall = clampScore100(input.overall_score || fluency + pronunciation + intonation + vocabulary + grammar);

  return {
    overall_score: overall,
    fluency_score: fluency,
    pronunciation_score: pronunciation,
    intonation_score: intonation,
    vocabulary_score: vocabulary,
    grammar_score: grammar,
    overall_comment: ensureSentence(input.overall_comment, "The candidate completed the speaking test with a workable response profile."),
    fluency_feedback: ensureSentence(input.fluency_feedback, "Fluency is generally understandable, but pacing and smoothness still need more control."),
    pronunciation_feedback: ensureSentence(
      input.pronunciation_feedback,
      "Pronunciation is mostly intelligible, though some sounds and word endings still need cleaner production.",
    ),
    intonation_feedback: ensureSentence(
      input.intonation_feedback,
      "Intonation supports meaning at times, but the delivery still needs stronger sentence stress and clearer pitch movement.",
    ),
    vocabulary_feedback: ensureSentence(
      input.vocabulary_feedback,
      "Vocabulary is adequate for the task, but more precise and varied word choice would strengthen the response.",
    ),
    grammar_feedback: ensureSentence(
      input.grammar_feedback,
      "Grammar communicates the main ideas, but sentence variety and control can still improve.",
    ),
    transcript_overview: ensureSentence(
      input.transcript_overview,
      "The response covered the main topics, though some ideas need fuller development.",
    ),
    strengths: normalizeShortList(input.strengths, [
      "The response stays on topic across the full test.",
      "The speaker shows enough content to support further improvement.",
      "There is a clear attempt to explain ideas rather than only list them.",
    ]),
    priorities: normalizeShortList(input.priorities, [
      "Use more specific supporting details in each answer.",
      "Slow down key sentences so stress and endings stay clear.",
      "Vary sentence patterns instead of relying on the same structure repeatedly.",
    ]),
  };
}

export function buildMockSpeakingTestFeedback(
  questionSet: SpeakingTestQuestionSet,
  answers: SpeakingTestAnswerInput[],
): SpeakingTestFeedback {
  const transcript = answers.map((answer) => answer.transcript.trim()).join(" ");
  const words = collectWords(transcript);
  const totalWords = words.length;
  const uniqueWords = new Set(words).size;
  const totalDuration = answers.reduce((sum, answer) => sum + Math.max(1, answer.duration_sec), 0);
  const wordsPerMinute = totalDuration > 0 ? (totalWords / totalDuration) * 60 : 0;
  const fillers = countMatches(transcript, /\b(um|uh|like|you know|er|ah)\b/gi);
  const connectors = countMatches(
    transcript,
    /\b(because|however|therefore|for example|for instance|although|while|if|when|as a result|in addition)\b/gi,
  );
  const complexGrammar = countMatches(
    transcript,
    /\b(which|that|while|although|unless|whereas|if|when|who|whose|had|would|could|should)\b/gi,
  );
  const longWords = words.filter((word) => word.length >= 7).length;
  const averageWordsPerAnswer = totalWords / Math.max(1, answers.length);
  const lexicalRatio = totalWords > 0 ? uniqueWords / totalWords : 0;
  const questionCoverage = answers.filter((answer) => answer.transcript.trim().length >= 20).length;

  const fluency = clampScore20(
    10 +
      scoreWindow(wordsPerMinute, 85, 155, 4) +
      Math.min(3, averageWordsPerAnswer / 10) -
      Math.min(4, fillers * 0.7),
  );
  const pronunciation = clampScore20(
    10 +
      scoreWindow(wordsPerMinute, 80, 160, 3) +
      Math.min(3, questionCoverage * 0.8) -
      Math.min(3, fillers * 0.5),
  );
  const intonation = clampScore20(
    9 +
      Math.min(4, connectors * 0.7) +
      Math.min(3, complexGrammar * 0.4) +
      Math.min(2, answers.filter((answer) => /[,.!?]/.test(answer.transcript)).length) -
      Math.min(2, fillers * 0.3),
  );
  const vocabulary = clampScore20(
    9 +
      Math.min(4, lexicalRatio * 12) +
      Math.min(4, longWords / 6) +
      Math.min(2, connectors * 0.4),
  );
  const grammar = clampScore20(
    9 +
      Math.min(5, complexGrammar * 0.5) +
      Math.min(3, questionCoverage * 0.9) +
      Math.min(2, averageWordsPerAnswer / 18),
  );

  const overall = clampScore100(fluency + pronunciation + intonation + vocabulary + grammar);

  return {
    overall_score: overall,
    fluency_score: fluency,
    pronunciation_score: pronunciation,
    intonation_score: intonation,
    vocabulary_score: vocabulary,
    grammar_score: grammar,
    overall_comment:
      overall >= 80
        ? `This ${questionSet.title.toLowerCase()} performance is confident and well-developed, with clear control across most tasks.`
        : overall >= 65
          ? `This performance is solid and understandable, but it still needs more precision and stronger spoken control in the weaker categories.`
          : `This performance communicates the main ideas, but it still needs more support, clearer delivery, and stronger language range to sound test-ready.`,
    fluency_feedback:
      fluency >= 16
        ? "The pace is mostly steady and ideas move forward with limited hesitation."
        : "Fluency is understandable, but pauses, restarts, or thin development reduce smoothness.",
    pronunciation_feedback:
      pronunciation >= 16
        ? "Pronunciation appears clear enough to support comprehension without much strain."
        : "Pronunciation seems broadly understandable, but key sounds and endings likely need more consistency for clearer delivery.",
    intonation_feedback:
      intonation >= 16
        ? "Intonation and sentence stress appear varied enough to help meaning sound purposeful."
        : "Intonation seems fairly flat or uneven, so important points may not stand out clearly enough yet.",
    vocabulary_feedback:
      vocabulary >= 16
        ? "Vocabulary is reasonably varied and supports explanation with some precision."
        : "Vocabulary is serviceable, but more specific and varied wording would make the answers sound more academic and convincing.",
    grammar_feedback:
      grammar >= 16
        ? "Grammar shows useful variety and generally supports longer ideas well."
        : "Grammar carries the message, but sentence patterns still need more range and control.",
    transcript_overview:
      questionCoverage === questionSet.questions.length
        ? "All three questions received a developed spoken response with enough content for scoring."
        : "At least one answer was short, which limits the overall strength of the test performance.",
    strengths: [
      averageWordsPerAnswer >= 35
        ? "The candidate develops answers with enough length to show ideas."
        : "The candidate stays relevant to the core question focus.",
      connectors >= 3
        ? "The response uses linking language to connect reasons and examples."
        : "The response keeps the main meaning understandable from start to finish.",
      lexicalRatio >= 0.45
        ? "Word choice shows some variety rather than constant repetition."
        : "There is a workable base for stronger vocabulary expansion in future attempts.",
    ],
    priorities: [
      fillers >= 3
        ? "Reduce fillers and restart less often so delivery sounds more stable."
        : "Add one clearer supporting detail to each answer.",
      vocabulary < 15
        ? "Replace common repeated words with more precise academic or descriptive vocabulary."
        : "Keep pushing for more exact wording instead of general phrases.",
      grammar < 15
        ? "Use a wider mix of sentence patterns, including reasons, contrasts, and examples."
        : "Strengthen sentence stress so important ideas land more clearly.",
    ],
  };
}

function clampScore20(value: number) {
  return Math.max(0, Math.min(20, Math.round(value)));
}

function clampScore100(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeShortList(value: string[] | undefined, fallback: string[]) {
  const next = (value ?? []).map((item) => item.trim()).filter(Boolean);
  return next.length >= 3 ? next.slice(0, 3) : fallback;
}

function ensureSentence(value: string | undefined, fallback: string) {
  const next = value?.trim();
  return next ? next : fallback;
}

function collectWords(text: string) {
  return text
    .toLowerCase()
    .match(/[a-z']+/g)
    ?.filter(Boolean) ?? [];
}

function countMatches(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0;
}

function scoreWindow(value: number, lower: number, upper: number, bonus: number) {
  if (value >= lower && value <= upper) return bonus;
  if (value >= lower - 20 && value <= upper + 20) return bonus / 2;
  return 0;
}
